package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/gavigo/orchestrator/internal/models"
)

// SocialHandlers provides HTTP handlers for social features
type SocialHandlers struct {
	store *models.SocialStore
}

// NewSocialHandlers creates new social API handlers
func NewSocialHandlers(store *models.SocialStore) *SocialHandlers {
	return &SocialHandlers{store: store}
}

// RegisterRoutes registers social HTTP routes
func (h *SocialHandlers) RegisterRoutes(mux *http.ServeMux) {
	// User profile
	mux.HandleFunc("/api/v1/users/me", h.handleGetMe)
	mux.HandleFunc("/api/v1/users/profile", RequireAuth(h.handleUpdateProfile))

	// Content social actions - use pattern matching
	mux.HandleFunc("/api/v1/content/", h.handleContentSocial)

	// Follow
	mux.HandleFunc("/api/v1/users/", h.handleUserAction)
}

// handleGetMe returns the current user's profile
func (h *SocialHandlers) handleGetMe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	uid := GetFirebaseUID(r)
	if uid == "" {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	user := h.store.GetUser(uid)
	if user == nil {
		// Auto-create user
		user = h.store.GetOrCreateUser(uid, "user_"+uid[:6], "")
	}

	writeJSON(w, user)
}

// handleUpdateProfile creates or updates a user profile
func (h *SocialHandlers) handleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	uid := GetFirebaseUID(r)

	var req struct {
		Username    string `json:"username"`
		AvatarURL   string `json:"avatar_url"`
		Bio         string `json:"bio"`
		FirebaseUID string `json:"firebase_uid"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Try to update existing user first
	user := h.store.UpdateUser(uid, &models.UserProfile{
		Username:  req.Username,
		AvatarURL: req.AvatarURL,
		Bio:       req.Bio,
	})

	if user == nil {
		// Create new user
		username := req.Username
		if username == "" {
			username = "user_" + uid[:6]
		}
		user = h.store.GetOrCreateUser(uid, username, req.AvatarURL)
	}

	writeJSON(w, user)
}

// handleContentSocial handles /api/v1/content/:id/like and /api/v1/content/:id/comments
func (h *SocialHandlers) handleContentSocial(w http.ResponseWriter, r *http.Request) {
	// Parse path: /api/v1/content/{contentId}/{action}
	path := strings.TrimPrefix(r.URL.Path, "/api/v1/content/")
	parts := strings.SplitN(path, "/", 2)

	if len(parts) < 2 {
		// This is a GET /api/v1/content/{id} - let the main handler handle it
		return
	}

	contentID := parts[0]
	action := parts[1]

	switch action {
	case "like":
		h.handleLike(w, r, contentID)
	case "comments":
		h.handleComments(w, r, contentID)
	default:
		http.Error(w, "Not found", http.StatusNotFound)
	}
}

// handleLike handles POST/DELETE /api/v1/content/:id/like
func (h *SocialHandlers) handleLike(w http.ResponseWriter, r *http.Request, contentID string) {
	uid := GetFirebaseUID(r)
	if uid == "" {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case http.MethodPost:
		liked, count := h.store.ToggleLike(uid, contentID)
		if !liked {
			// Was already liked, toggle back (we want to like)
			liked, count = h.store.ToggleLike(uid, contentID)
		}
		writeJSON(w, map[string]interface{}{
			"liked": liked,
			"count": count,
		})

	case http.MethodDelete:
		isLiked := h.store.IsLiked(uid, contentID)
		if isLiked {
			h.store.ToggleLike(uid, contentID)
		}
		writeJSON(w, map[string]interface{}{
			"liked": false,
			"count": h.store.GetLikeCount(contentID),
		})

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleComments handles GET/POST /api/v1/content/:id/comments
func (h *SocialHandlers) handleComments(w http.ResponseWriter, r *http.Request, contentID string) {
	switch r.Method {
	case http.MethodGet:
		comments := h.store.GetComments(contentID)
		writeJSON(w, comments)

	case http.MethodPost:
		uid := GetFirebaseUID(r)
		if uid == "" {
			http.Error(w, "Authentication required", http.StatusUnauthorized)
			return
		}

		var req struct {
			Text string `json:"text"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(req.Text) == "" {
			http.Error(w, "Comment text is required", http.StatusBadRequest)
			return
		}

		user := h.store.GetUser(uid)
		username := "user"
		avatarURL := ""
		if user != nil {
			username = user.Username
			avatarURL = user.AvatarURL
		}

		comment := h.store.AddComment(uid, contentID, req.Text, username, avatarURL)
		log.Printf("Comment added: user=%s, content=%s", uid, contentID)
		writeJSON(w, comment)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleUserAction handles /api/v1/users/:id/follow
func (h *SocialHandlers) handleUserAction(w http.ResponseWriter, r *http.Request) {
	// Parse path: /api/v1/users/{userId}/{action}
	path := strings.TrimPrefix(r.URL.Path, "/api/v1/users/")

	// Skip "me" and "profile" as they're handled by other routes
	if path == "me" || path == "profile" {
		return
	}

	parts := strings.SplitN(path, "/", 2)
	if len(parts) < 2 {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	targetUserID := parts[0]
	action := parts[1]

	if action != "follow" {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	uid := GetFirebaseUID(r)
	if uid == "" {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case http.MethodPost:
		isFollowing := h.store.IsFollowing(uid, targetUserID)
		if !isFollowing {
			h.store.ToggleFollow(uid, targetUserID)
		}
		writeJSON(w, map[string]interface{}{
			"following": true,
		})

	case http.MethodDelete:
		isFollowing := h.store.IsFollowing(uid, targetUserID)
		if isFollowing {
			h.store.ToggleFollow(uid, targetUserID)
		}
		writeJSON(w, map[string]interface{}{
			"following": false,
		})

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func writeJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding JSON response: %v", err)
	}
}
