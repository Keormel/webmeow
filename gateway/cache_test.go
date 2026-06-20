package main

import (
	"net/http"
	"testing"
	"time"
)

func TestResponseCacheEvictsLeastRecentlyUsedEntry(t *testing.T) {
	cache := newResponseCache(time.Minute, 2, 0)

	cache.set("a", cacheEntry{status: http.StatusOK, body: []byte("a")})
	cache.set("b", cacheEntry{status: http.StatusOK, body: []byte("b")})

	if _, ok := cache.get("a"); !ok {
		t.Fatal("expected key a to be cached")
	}

	cache.set("c", cacheEntry{status: http.StatusOK, body: []byte("c")})

	if _, ok := cache.get("b"); ok {
		t.Fatal("expected least recently used key b to be evicted")
	}
	if _, ok := cache.get("a"); !ok {
		t.Fatal("expected recently used key a to remain cached")
	}
	if _, ok := cache.get("c"); !ok {
		t.Fatal("expected key c to be cached")
	}
}

func TestResponseCacheSkipsOversizedBodies(t *testing.T) {
	cache := newResponseCache(time.Minute, 2, 3)

	cache.set("large", cacheEntry{status: http.StatusOK, body: []byte("1234")})
	if _, ok := cache.get("large"); ok {
		t.Fatal("expected oversized response body to be skipped")
	}

	cache.set("small", cacheEntry{status: http.StatusOK, body: []byte("123")})
	if _, ok := cache.get("small"); !ok {
		t.Fatal("expected body at the size limit to be cached")
	}
}
