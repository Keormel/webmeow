package main

import (
	"bytes"
	"container/list"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"
	"sync"
	"time"
)

type cacheEntry struct {
	status  int
	header  http.Header
	body    []byte
	expires time.Time
}

type cacheRecord struct {
	key   string
	entry cacheEntry
}

type responseCache struct {
	mu           sync.Mutex
	entries      map[string]*list.Element
	order        *list.List
	ttl          time.Duration
	maxEntries   int
	maxBodyBytes int
}

func newResponseCache(ttl time.Duration, maxEntries, maxBodyBytes int) *responseCache {
	return &responseCache{
		entries:      make(map[string]*list.Element),
		order:        list.New(),
		ttl:          ttl,
		maxEntries:   maxEntries,
		maxBodyBytes: maxBodyBytes,
	}
}

func (c *responseCache) get(key string) (cacheEntry, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	el, ok := c.entries[key]
	if !ok {
		return cacheEntry{}, false
	}
	record := el.Value.(*cacheRecord)
	if time.Now().After(record.entry.expires) {
		c.removeElement(el)
		return cacheEntry{}, false
	}
	c.order.MoveToFront(el)
	return record.entry, true
}

func (c *responseCache) set(key string, e cacheEntry) {
	if c.maxEntries <= 0 {
		return
	}
	if c.maxBodyBytes > 0 && len(e.body) > c.maxBodyBytes {
		return
	}

	e.expires = time.Now().Add(c.ttl)
	c.mu.Lock()
	defer c.mu.Unlock()

	if el, ok := c.entries[key]; ok {
		el.Value.(*cacheRecord).entry = e
		c.order.MoveToFront(el)
		return
	}

	c.entries[key] = c.order.PushFront(&cacheRecord{
		key:   key,
		entry: e,
	})

	for len(c.entries) > c.maxEntries {
		c.removeElement(c.order.Back())
	}
}

func (c *responseCache) removeElement(el *list.Element) {
	if el == nil {
		return
	}

	record := el.Value.(*cacheRecord)
	delete(c.entries, record.key)
	c.order.Remove(el)
}

// cacheCapture tees a cacheable response into a buffer while passing it through
// to the client. Cacheability is decided on the first WriteHeader (200 +
// non-streaming Content-Type), so SSE responses are never buffered and flushes
// pass straight through — keeping the proxy's FlushInterval = -1 behaviour.
type cacheCapture struct {
	http.ResponseWriter
	buf       bytes.Buffer
	status    int
	cacheable bool
	decided   bool
}

func (c *cacheCapture) WriteHeader(code int) {
	if !c.decided {
		c.status = code
		c.cacheable = responseCacheable(code, c.Header())
		c.decided = true
	}
	c.ResponseWriter.WriteHeader(code)
}

func (c *cacheCapture) Write(b []byte) (int, error) {
	if !c.decided {
		c.WriteHeader(http.StatusOK)
	}
	if c.cacheable {
		c.buf.Write(b)
	}
	return c.ResponseWriter.Write(b)
}

func (c *cacheCapture) Flush() {
	if f, ok := c.ResponseWriter.(http.Flusher); ok {
		f.Flush()
	}
}

// cacheKey scopes entries by method, path, query, and per-client credentials
// so personalized responses are never shared across users.
func cacheKey(r *http.Request) string {
	key := r.Method + " " + r.URL.Path + "?" + r.URL.Query().Encode()

	var scope []string
	for _, part := range []struct {
		label string
		value string
	}{
		{"auth", r.Header.Get("Authorization")},
		{"cookie", r.Header.Get("Cookie")},
		{"key", r.Header.Get("X-Internal-Key")},
	} {
		if part.value != "" {
			sum := sha256.Sum256([]byte(part.value))
			scope = append(scope, part.label+"="+hex.EncodeToString(sum[:8]))
		}
	}
	if len(scope) > 0 {
		key += "|" + strings.Join(scope, "|")
	}
	return key
}

// responseCacheable reports whether a backend response may be stored in the
// shared gateway cache. Private or session-bound responses are excluded.
func responseCacheable(status int, h http.Header) bool {
	if status != http.StatusOK {
		return false
	}
	if strings.HasPrefix(h.Get("Content-Type"), "text/event-stream") {
		return false
	}
	if len(h.Values("Set-Cookie")) > 0 {
		return false
	}
	cc := strings.ToLower(h.Get("Cache-Control"))
	if strings.Contains(cc, "private") || strings.Contains(cc, "no-store") {
		return false
	}
	return true
}

// CacheMiddleware caches safe responses (GET/HEAD, status 200, non-streaming)
// for ttl. No-op when ttl <= 0 or maxEntries <= 0.
func CacheMiddleware(ttl time.Duration, maxEntries, maxBodyBytes int) func(http.Handler) http.Handler {
	if ttl <= 0 || maxEntries <= 0 {
		return func(next http.Handler) http.Handler { return next }
	}
	cache := newResponseCache(ttl, maxEntries, maxBodyBytes)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodGet && r.Method != http.MethodHead {
				next.ServeHTTP(w, r)
				return
			}

			key := cacheKey(r)

			if e, ok := cache.get(key); ok {
				for k, vals := range e.header {
					for _, v := range vals {
						w.Header().Add(k, v)
					}
				}
				w.Header().Set("X-Cache", "HIT")
				w.WriteHeader(e.status)
				w.Write(e.body)
				return
			}

			cc := &cacheCapture{ResponseWriter: w}
			next.ServeHTTP(cc, r)

			if cc.cacheable && responseCacheable(cc.status, w.Header()) {
				cache.set(key, cacheEntry{
					status: cc.status,
					header: w.Header().Clone(),
					body:   cc.buf.Bytes(),
				})
			}
		})
	}
}
