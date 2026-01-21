package engine

import (
	"log"
	"math"
	"sync"
	"time"

	"github.com/gavigo/orchestrator/internal/models"
)

// Scorer calculates and maintains content scores
type Scorer struct {
	mu sync.RWMutex

	// Personal scores per session per content
	personalScores map[string]map[string]float64 // sessionID -> contentID -> score

	// Global scores per content
	globalScores map[string]float64

	// Trend scores (viral/swarm)
	trendScores map[string]*models.TrendScore

	// Configuration
	config *ScorerConfig

	// Callback when scores update
	OnScoreUpdate func(contentID string, scores *models.InputScores)
}

// ScorerConfig holds scorer configuration
type ScorerConfig struct {
	PersonalWeight     float64       // Weight for personal score in combined
	GlobalWeight       float64       // Weight for global score in combined
	TrendWeight        float64       // Weight for trend score in combined
	DecayRate          float64       // Score decay rate per second
	DecayInterval      time.Duration // How often to apply decay
	FocusDurationScale float64       // How much focus duration affects score (per second)
}

// DefaultScorerConfig returns default scorer configuration
func DefaultScorerConfig() *ScorerConfig {
	return &ScorerConfig{
		PersonalWeight:     0.4,
		GlobalWeight:       0.4,
		TrendWeight:        0.2,
		DecayRate:          0.01,
		DecayInterval:      time.Second * 5,
		FocusDurationScale: 0.1,
	}
}

// NewScorer creates a new scorer
func NewScorer(config *ScorerConfig) *Scorer {
	if config == nil {
		config = DefaultScorerConfig()
	}
	return &Scorer{
		personalScores: make(map[string]map[string]float64),
		globalScores:   make(map[string]float64),
		trendScores:    make(map[string]*models.TrendScore),
		config:         config,
	}
}

// StartDecay starts the score decay process
func (s *Scorer) StartDecay() {
	ticker := time.NewTicker(s.config.DecayInterval)
	go func() {
		for range ticker.C {
			s.applyDecay()
		}
	}()
}

// RecordFocusEvent records a user focus event and updates scores
func (s *Scorer) RecordFocusEvent(sessionID, contentID string, durationMS int, theme string) *models.InputScores {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Initialize session scores if needed
	if s.personalScores[sessionID] == nil {
		s.personalScores[sessionID] = make(map[string]float64)
	}

	// Calculate score increase based on focus duration
	durationSeconds := float64(durationMS) / 1000.0
	scoreIncrease := durationSeconds * s.config.FocusDurationScale

	// Update personal score (capped at 1.0)
	currentPersonal := s.personalScores[sessionID][contentID]
	newPersonal := math.Min(1.0, currentPersonal+scoreIncrease)
	s.personalScores[sessionID][contentID] = newPersonal

	// Update global score (aggregated across all sessions)
	currentGlobal := s.globalScores[contentID]
	globalIncrease := scoreIncrease * 0.1 // Smaller increase for global
	newGlobal := math.Min(1.0, currentGlobal+globalIncrease)
	s.globalScores[contentID] = newGlobal

	// Get trend score
	trendScore := 0.0
	if ts := s.trendScores[contentID]; ts != nil {
		trendScore = ts.ViralScore
	}

	// Calculate combined score
	combined := s.calculateCombined(newPersonal, newGlobal, trendScore)

	scores := &models.InputScores{
		PersonalScore: newPersonal,
		GlobalScore:   newGlobal,
		CombinedScore: combined,
	}

	log.Printf("Score update: session=%s, content=%s, personal=%.2f, global=%.2f, combined=%.2f",
		sessionID, contentID, newPersonal, newGlobal, combined)

	if s.OnScoreUpdate != nil {
		s.OnScoreUpdate(contentID, scores)
	}

	return scores
}

// SetTrendScore sets the trend/viral score for content
func (s *Scorer) SetTrendScore(contentID string, viralScore float64, direction string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.trendScores[contentID] = &models.TrendScore{
		ContentID:      contentID,
		ViralScore:     viralScore,
		TrendDirection: direction,
		LastUpdated:    time.Now(),
		ManualOverride: true,
	}

	log.Printf("Trend score set: content=%s, viral=%.2f, direction=%s",
		contentID, viralScore, direction)
}

// GetScores returns current scores for a content item
func (s *Scorer) GetScores(sessionID, contentID string) *models.InputScores {
	s.mu.RLock()
	defer s.mu.RUnlock()

	personal := 0.0
	if sessionScores := s.personalScores[sessionID]; sessionScores != nil {
		personal = sessionScores[contentID]
	}

	global := s.globalScores[contentID]

	trend := 0.0
	if ts := s.trendScores[contentID]; ts != nil {
		trend = ts.ViralScore
	}

	return &models.InputScores{
		PersonalScore: personal,
		GlobalScore:   global,
		CombinedScore: s.calculateCombined(personal, global, trend),
	}
}

// GetAllScores returns all scores for all content
func (s *Scorer) GetAllScores(sessionID string) map[string]*models.InputScores {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make(map[string]*models.InputScores)

	// Collect all content IDs
	contentIDs := make(map[string]bool)
	for id := range s.globalScores {
		contentIDs[id] = true
	}
	if sessionScores := s.personalScores[sessionID]; sessionScores != nil {
		for id := range sessionScores {
			contentIDs[id] = true
		}
	}
	for id := range s.trendScores {
		contentIDs[id] = true
	}

	// Build scores for each content
	for contentID := range contentIDs {
		personal := 0.0
		if sessionScores := s.personalScores[sessionID]; sessionScores != nil {
			personal = sessionScores[contentID]
		}

		global := s.globalScores[contentID]

		trend := 0.0
		if ts := s.trendScores[contentID]; ts != nil {
			trend = ts.ViralScore
		}

		result[contentID] = &models.InputScores{
			PersonalScore: personal,
			GlobalScore:   global,
			CombinedScore: s.calculateCombined(personal, global, trend),
		}
	}

	return result
}

// GetTrendScore returns the trend score for content
func (s *Scorer) GetTrendScore(contentID string) *models.TrendScore {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.trendScores[contentID]
}

// calculateCombined computes the combined score
func (s *Scorer) calculateCombined(personal, global, trend float64) float64 {
	combined := personal*s.config.PersonalWeight +
		global*s.config.GlobalWeight +
		trend*s.config.TrendWeight
	return math.Min(1.0, combined)
}

// applyDecay reduces scores over time
func (s *Scorer) applyDecay() {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Decay personal scores
	for sessionID, contentScores := range s.personalScores {
		for contentID, score := range contentScores {
			newScore := score * (1 - s.config.DecayRate)
			if newScore < 0.01 {
				delete(contentScores, contentID)
			} else {
				s.personalScores[sessionID][contentID] = newScore
			}
		}
	}

	// Decay global scores
	for contentID, score := range s.globalScores {
		newScore := score * (1 - s.config.DecayRate)
		if newScore < 0.01 {
			delete(s.globalScores, contentID)
		} else {
			s.globalScores[contentID] = newScore
		}
	}

	// Decay trend scores (slower decay)
	for contentID, ts := range s.trendScores {
		if !ts.ManualOverride {
			newScore := ts.ViralScore * (1 - s.config.DecayRate*0.5)
			if newScore < 0.01 {
				delete(s.trendScores, contentID)
			} else {
				ts.ViralScore = newScore
			}
		}
	}
}

// Reset clears all scores
func (s *Scorer) Reset() {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.personalScores = make(map[string]map[string]float64)
	s.globalScores = make(map[string]float64)
	s.trendScores = make(map[string]*models.TrendScore)

	log.Println("Scorer reset: all scores cleared")
}
