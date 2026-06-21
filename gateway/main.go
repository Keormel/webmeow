package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
)

func main() {
	cfg := LoadConfig()

	r := chi.NewRouter()

	// Global middleware (applied to ALL routes)
	r.Use(chimw.RequestID)
	r.Use(RequestLogger)
	r.Use(chimw.Recoverer)
	r.Use(CORSMiddleware(cfg.CORSOrigins))
	rl := NewRateLimiter(cfg.RateLimitPerWindow, cfg.RateLimitWindow)
	// Rate limit before RealIP so client-supplied X-Forwarded-For cannot bypass limits.
	r.Use(RateLimitMiddleware(rl))
	r.Use(chimw.RealIP)

	// Health check (aggregates all backend health endpoints)
	r.Get("/health", HealthHandler(cfg))

	// Public API proxy — browser traffic enters here without a shared secret.
	pools := map[string][]string{
		"/api/airport":   cfg.AirportServicePool,
		"/api/hotel":     cfg.HotelServicePool,
		"/api/beach":     cfg.BeachServicePool,
		"/api/broadcast": cfg.BroadcastServicePool,
		"/api/parrot":    cfg.ParrotServicePool,
	}
	for prefix, pool := range pools {
		switch len(pool) {
		case 0:
			// Service not configured — leave it unregistered so it 404s.
		case 1:
			r.Route(prefix, withRouteMiddleware(ProxyRoute(pool[0]), cfg))
		default:
			r.Route(prefix, withRouteMiddleware(PooledProxyRoute(pool), cfg))
		}
	}

	// Admin routes require X-Internal-Key when INTERNAL_SECRET is set.
	r.Group(func(r chi.Router) {
		r.Use(AuthMiddleware(cfg.InternalSecret))
		r.Put("/admin/rate-limit", AdminRateLimitHandler(rl))
	})

	addr := fmt.Sprintf(":%s", cfg.Port)
	srv := &http.Server{Addr: addr, Handler: r}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Printf("Gateway starting on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("Shutting down gracefully...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("shutdown: %v", err)
	}
	log.Println("Gateway stopped")
}

// withRouteMiddleware wraps a proxy route with the optional per-route cache
// middleware. It is a no-op when the cache is disabled, leaving the route
// behaving exactly like a bare ProxyRoute.
func withRouteMiddleware(route func(chi.Router), cfg Config) func(chi.Router) {
	return func(r chi.Router) {
		if cfg.CacheTTL > 0 {
			r.Use(CacheMiddleware(cfg.CacheTTL, cfg.CacheMaxEntries, cfg.CacheMaxBodyBytes))
		}
		route(r)
	}
}
