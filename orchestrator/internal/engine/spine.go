package engine

import (
	"fmt"
	"math/rand"
	"sync"
	"time"

	"github.com/gavigo/orchestrator/internal/models"
)

// ContentTimeline tracks the activation phases for a single content item
type ContentTimeline struct {
	ContentID   string
	SessionID   string
	IntentTime  time.Time
	Phases      []models.ActivationSpineEvent
	PreviousHot bool
}

// ActivationSpine tracks activation timelines for all content items
type ActivationSpine struct {
	mu        sync.RWMutex
	timelines map[string]*ContentTimeline
	onEmit    func(event *models.ActivationSpineEvent)
}

// NewActivationSpine creates a new activation spine tracker
func NewActivationSpine(onEmit func(event *models.ActivationSpineEvent)) *ActivationSpine {
	return &ActivationSpine{
		timelines: make(map[string]*ContentTimeline),
		onEmit:    onEmit,
	}
}

// RecordPhase records an activation phase event for a content item
func (s *ActivationSpine) RecordPhase(contentID, sessionID string, phase models.ActivationPhase, triggerSource string, weight models.ResourceWeight, isSimulated bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	tl, exists := s.timelines[contentID]
	if !exists {
		tl = &ContentTimeline{
			ContentID: contentID,
		}
		s.timelines[contentID] = tl
	}

	if sessionID != "" {
		tl.SessionID = sessionID
	}

	now := time.Now()

	if phase == models.PhaseIntent {
		tl.IntentTime = now
	}

	var elapsed int64
	if !tl.IntentTime.IsZero() {
		elapsed = now.Sub(tl.IntentTime).Milliseconds()
	}

	event := models.ActivationSpineEvent{
		EventID:          fmt.Sprintf("spine-%d-%s", now.UnixNano(), phase),
		ContentID:        contentID,
		SessionID:        tl.SessionID,
		Phase:            phase,
		Timestamp:        now,
		ElapsedFromStart: elapsed,
		ResourceWeight:   weight,
		TriggerSource:    triggerSource,
		IsSimulated:      isSimulated,
	}

	tl.Phases = append(tl.Phases, event)

	if s.onEmit != nil {
		s.onEmit(&event)
	}
}

// GetTimeline returns the timeline for a content item
func (s *ActivationSpine) GetTimeline(contentID string) *ContentTimeline {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.timelines[contentID]
}

// MarkPreviousHot marks a content item as having been previously HOT
func (s *ActivationSpine) MarkPreviousHot(contentID string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	tl, exists := s.timelines[contentID]
	if !exists {
		tl = &ContentTimeline{ContentID: contentID}
		s.timelines[contentID] = tl
	}
	tl.PreviousHot = true
}

// HasIntent returns whether an INTENT has been recorded for this content
func (s *ActivationSpine) HasIntent(contentID string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	tl, exists := s.timelines[contentID]
	if !exists {
		return false
	}
	for _, p := range tl.Phases {
		if p.Phase == models.PhaseIntent {
			return true
		}
	}
	return false
}

// IsPreviousHot returns whether content was previously in HOT state
func (s *ActivationSpine) IsPreviousHot(contentID string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	tl, exists := s.timelines[contentID]
	if !exists {
		return false
	}
	return tl.PreviousHot
}

// Reset clears all timelines
func (s *ActivationSpine) Reset() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.timelines = make(map[string]*ContentTimeline)
}

// SimulatedStartupDelay returns a jittered startup delay based on content type
func SimulatedStartupDelay(contentType models.ContentType) time.Duration {
	switch contentType {
	case models.ContentTypeAIService:
		return time.Duration(800+rand.Intn(400)) * time.Millisecond
	default: // GAME
		return time.Duration(1500+rand.Intn(1000)) * time.Millisecond
	}
}

// SimulatedRestoreDelay returns a jittered restore delay (faster than cold start)
func SimulatedRestoreDelay() time.Duration {
	return time.Duration(200+rand.Intn(300)) * time.Millisecond
}
