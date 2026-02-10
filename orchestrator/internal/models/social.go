package models

import (
	"sync"
	"time"

	"github.com/google/uuid"
)

// UserProfile represents a user's profile
type UserProfile struct {
	ID             string `json:"id"`
	FirebaseUID    string `json:"firebase_uid"`
	Username       string `json:"username"`
	AvatarURL      string `json:"avatar_url,omitempty"`
	Bio            string `json:"bio"`
	FollowersCount int    `json:"followers_count"`
	FollowingCount int    `json:"following_count"`
	LikesCount     int    `json:"likes_count"`
	CreatedAt      time.Time `json:"created_at"`
}

// Comment represents a comment on content
type Comment struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	ContentID string    `json:"content_id"`
	Text      string    `json:"text"`
	Username  string    `json:"username"`
	AvatarURL string    `json:"avatar_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// Like represents a user liking content
type Like struct {
	UserID    string    `json:"user_id"`
	ContentID string    `json:"content_id"`
	CreatedAt time.Time `json:"created_at"`
}

// Follow represents a follow relationship
type Follow struct {
	FollowerID  string    `json:"follower_id"`
	FollowingID string    `json:"following_id"`
	CreatedAt   time.Time `json:"created_at"`
}

// SocialStore is an in-memory social data store
// For production, replace with PostgreSQL
type SocialStore struct {
	mu       sync.RWMutex
	users    map[string]*UserProfile // firebase_uid -> profile
	likes    map[string]map[string]bool // content_id -> user_id -> liked
	comments map[string][]*Comment       // content_id -> comments
	follows  map[string]map[string]bool // user_id -> followed_user_id -> following
}

// NewSocialStore creates a new in-memory social store
func NewSocialStore() *SocialStore {
	return &SocialStore{
		users:    make(map[string]*UserProfile),
		likes:    make(map[string]map[string]bool),
		comments: make(map[string][]*Comment),
		follows:  make(map[string]map[string]bool),
	}
}

// GetOrCreateUser returns an existing user or creates one from Firebase data
func (s *SocialStore) GetOrCreateUser(firebaseUID, username, avatarURL string) *UserProfile {
	s.mu.Lock()
	defer s.mu.Unlock()

	if user, ok := s.users[firebaseUID]; ok {
		return user
	}

	user := &UserProfile{
		ID:          uuid.New().String(),
		FirebaseUID: firebaseUID,
		Username:    username,
		AvatarURL:   avatarURL,
		CreatedAt:   time.Now(),
	}
	s.users[firebaseUID] = user
	return user
}

// GetUser returns a user by Firebase UID
func (s *SocialStore) GetUser(firebaseUID string) *UserProfile {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.users[firebaseUID]
}

// UpdateUser updates a user profile
func (s *SocialStore) UpdateUser(firebaseUID string, update *UserProfile) *UserProfile {
	s.mu.Lock()
	defer s.mu.Unlock()

	user, ok := s.users[firebaseUID]
	if !ok {
		return nil
	}

	if update.Username != "" {
		user.Username = update.Username
	}
	if update.AvatarURL != "" {
		user.AvatarURL = update.AvatarURL
	}
	if update.Bio != "" {
		user.Bio = update.Bio
	}

	return user
}

// ToggleLike toggles a like on content. Returns (isLiked, totalCount).
func (s *SocialStore) ToggleLike(userID, contentID string) (bool, int) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.likes[contentID] == nil {
		s.likes[contentID] = make(map[string]bool)
	}

	if s.likes[contentID][userID] {
		delete(s.likes[contentID], userID)
		return false, len(s.likes[contentID])
	}

	s.likes[contentID][userID] = true
	return true, len(s.likes[contentID])
}

// SetLike ensures a like exists. Returns totalCount.
func (s *SocialStore) SetLike(userID, contentID string) int {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.likes[contentID] == nil {
		s.likes[contentID] = make(map[string]bool)
	}
	s.likes[contentID][userID] = true
	return len(s.likes[contentID])
}

// RemoveLike ensures a like is removed. Returns totalCount.
func (s *SocialStore) RemoveLike(userID, contentID string) int {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.likes[contentID] != nil {
		delete(s.likes[contentID], userID)
	}
	return len(s.likes[contentID])
}

// IsLiked checks if a user has liked content
func (s *SocialStore) IsLiked(userID, contentID string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if s.likes[contentID] == nil {
		return false
	}
	return s.likes[contentID][userID]
}

// GetLikeCount returns the like count for content
func (s *SocialStore) GetLikeCount(contentID string) int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.likes[contentID])
}

// AddComment adds a comment to content
func (s *SocialStore) AddComment(userID, contentID, text, username, avatarURL string) *Comment {
	s.mu.Lock()
	defer s.mu.Unlock()

	comment := &Comment{
		ID:        uuid.New().String(),
		UserID:    userID,
		ContentID: contentID,
		Text:      text,
		Username:  username,
		AvatarURL: avatarURL,
		CreatedAt: time.Now(),
	}

	s.comments[contentID] = append(s.comments[contentID], comment)
	return comment
}

// GetComments returns comments for content
func (s *SocialStore) GetComments(contentID string) []*Comment {
	s.mu.RLock()
	defer s.mu.RUnlock()

	comments := s.comments[contentID]
	if comments == nil {
		return []*Comment{}
	}
	return comments
}

// ToggleFollow toggles a follow relationship. Returns isFollowing.
func (s *SocialStore) ToggleFollow(followerID, followingID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.follows[followerID] == nil {
		s.follows[followerID] = make(map[string]bool)
	}

	if s.follows[followerID][followingID] {
		delete(s.follows[followerID], followingID)
		return false
	}

	s.follows[followerID][followingID] = true
	return true
}

// IsFollowing checks if user A follows user B
func (s *SocialStore) IsFollowing(followerID, followingID string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if s.follows[followerID] == nil {
		return false
	}
	return s.follows[followerID][followingID]
}
