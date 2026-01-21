package models

import "time"

type OperationalMode string

const (
	ModeMixedStreamBrowsing OperationalMode = "MIXED_STREAM_BROWSING"
	ModeGameFocus           OperationalMode = "GAME_FOCUS_MODE"
	ModeAIServiceFocus      OperationalMode = "AI_SERVICE_MODE"
)

type UserSession struct {
	SessionID        string                 `json:"session_id"`
	CurrentMode      OperationalMode        `json:"current_mode"`
	ScrollPosition   int                    `json:"scroll_position"`
	ScrollVelocity   float64                `json:"scroll_velocity"`
	FocusTimes       map[string]int         `json:"focus_times"` // theme -> milliseconds
	ActiveContentID  string                 `json:"active_content_id,omitempty"`
	LastActivity     time.Time              `json:"last_activity"`
	InjectedContent  []string               `json:"injected_content"`
	VisibleContent   []string               `json:"visible_content"`
}

// NewSession creates a new user session with default values
func NewSession(sessionID string) *UserSession {
	return &UserSession{
		SessionID:       sessionID,
		CurrentMode:     ModeMixedStreamBrowsing,
		ScrollPosition:  0,
		ScrollVelocity:  0,
		FocusTimes:      make(map[string]int),
		ActiveContentID: "",
		LastActivity:    time.Now(),
		InjectedContent: []string{},
		VisibleContent:  []string{},
	}
}

// GetFocusTime returns the focus time for a theme in milliseconds
func (s *UserSession) GetFocusTime(theme string) int {
	if time, ok := s.FocusTimes[theme]; ok {
		return time
	}
	return 0
}

// AddFocusTime adds focus time for a theme
func (s *UserSession) AddFocusTime(theme string, ms int) {
	if s.FocusTimes == nil {
		s.FocusTimes = make(map[string]int)
	}
	s.FocusTimes[theme] += ms
}

// HasInjected checks if content has already been injected
func (s *UserSession) HasInjected(contentID string) bool {
	for _, id := range s.InjectedContent {
		if id == contentID {
			return true
		}
	}
	return false
}

// MarkInjected marks content as injected
func (s *UserSession) MarkInjected(contentID string) {
	s.InjectedContent = append(s.InjectedContent, contentID)
}
