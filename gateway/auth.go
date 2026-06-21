package main

import (
	"net/http"
)

// AuthMiddleware requires a valid X-Internal-Key when secret is configured.
// When secret is empty, auth is disabled and all requests pass through.
func AuthMiddleware(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if secret == "" {
				next.ServeHTTP(w, r)
				return
			}

			if key := r.Header.Get("X-Internal-Key"); key == secret {
				next.ServeHTTP(w, r)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"error": "Unauthorized"}`))
		})
	}
}
