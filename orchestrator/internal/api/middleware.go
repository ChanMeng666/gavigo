package api

import (
	"context"
	"log"
	"net/http"
	"strings"
)

type contextKey string

const (
	// ContextKeyFirebaseUID is the context key for the Firebase UID
	ContextKeyFirebaseUID contextKey = "firebase_uid"
	// ContextKeyUsername is the context key for the username
	ContextKeyUsername contextKey = "username"
)

// FirebaseAuthVerifier is a function that verifies a Firebase ID token
// and returns the Firebase UID and any error.
// In production, this uses Firebase Admin SDK to verify tokens.
// For dev/demo mode, it accepts any non-empty token.
type FirebaseAuthVerifier func(ctx context.Context, idToken string) (uid string, err error)

// AuthMiddleware creates an HTTP middleware that validates Firebase ID tokens.
// If no verifier is provided, it runs in permissive mode (accepts any token).
func AuthMiddleware(verifier FirebaseAuthVerifier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				// Allow unauthenticated requests (backward compatibility)
				next.ServeHTTP(w, r)
				return
			}

			// Extract Bearer token
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
				http.Error(w, "Invalid authorization header", http.StatusUnauthorized)
				return
			}

			token := parts[1]
			if token == "" {
				http.Error(w, "Empty token", http.StatusUnauthorized)
				return
			}

			var uid string
			if verifier != nil {
				var err error
				uid, err = verifier(r.Context(), token)
				if err != nil {
					log.Printf("Auth verification failed: %v", err)
					http.Error(w, "Invalid token", http.StatusUnauthorized)
					return
				}
			} else {
				// Dev mode: use token as UID
				uid = "dev-" + token[:min(8, len(token))]
				log.Printf("Dev auth mode: assigned uid=%s", uid)
			}

			// Add UID to context
			ctx := context.WithValue(r.Context(), ContextKeyFirebaseUID, uid)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetFirebaseUID extracts the Firebase UID from the request context
func GetFirebaseUID(r *http.Request) string {
	uid, _ := r.Context().Value(ContextKeyFirebaseUID).(string)
	return uid
}

// RequireAuth returns 401 if the request is not authenticated
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid := GetFirebaseUID(r)
		if uid == "" {
			http.Error(w, "Authentication required", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
