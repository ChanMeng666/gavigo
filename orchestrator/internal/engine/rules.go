package engine

import (
	"fmt"
	"log"
	"time"

	"github.com/gavigo/orchestrator/internal/models"
)

// RulesEngine implements the rule-based AI decision system
type RulesEngine struct {
	config *EngineConfig

	// Callbacks
	OnDecision        func(decision *models.AIDecision)
	OnModeChange      func(oldMode, newMode models.OperationalMode, reason string)
	OnScaleAction     func(contentID string, targetState models.ContainerStatus)
	OnInject          func(content *models.ContentItem, position int, reason string)
	OnThrottleAction  func(activeContentID string, mode models.OperationalMode)
}

// EngineConfig holds configuration for the rules engine
type EngineConfig struct {
	// Thresholds for container state changes
	WarmThreshold float64 // Score threshold to trigger WARM state
	HotThreshold  float64 // Score threshold to trigger HOT state

	// Cross-domain recommendation settings
	CrossDomainFocusThresholdMS int     // Focus duration to trigger cross-domain
	CrossDomainScoreBoost       float64 // Score boost for related content

	// Swarm intelligence settings
	SwarmTrendThreshold float64 // Viral score threshold for swarm boost

	// Mode change settings
	ModeFocusThresholdMS int // Focus duration to trigger mode change
}

// DefaultConfig returns default engine configuration
func DefaultConfig() *EngineConfig {
	return &EngineConfig{
		WarmThreshold:               0.6,
		HotThreshold:                0.8,
		CrossDomainFocusThresholdMS: 5000,
		CrossDomainScoreBoost:       0.2,
		SwarmTrendThreshold:         0.7,
		ModeFocusThresholdMS:        10000,
	}
}

// NewRulesEngine creates a new rules engine
func NewRulesEngine(config *EngineConfig) *RulesEngine {
	if config == nil {
		config = DefaultConfig()
	}
	return &RulesEngine{config: config}
}

// ProcessFocusEvent handles user focus events and may trigger decisions
func (e *RulesEngine) ProcessFocusEvent(
	session *models.UserSession,
	focusedContent *models.ContentItem,
	durationMS int,
	allContent []*models.ContentItem,
	scores map[string]*models.InputScores,
) {
	log.Printf("Processing focus event: content=%s, duration=%dms", focusedContent.ID, durationMS)

	// Rule 1: Cross-Domain Recommendation
	if durationMS >= e.config.CrossDomainFocusThresholdMS {
		e.checkCrossDomainRecommendation(session, focusedContent, allContent, scores)
	}

	// Rule 2: Proactive Warming based on engagement
	e.checkProactiveWarming(focusedContent, scores)

	// Rule 3: Mode Change Detection
	if durationMS >= e.config.ModeFocusThresholdMS {
		e.checkModeChange(session, focusedContent)
	}
}

// ProcessScoreUpdate handles score updates and may trigger scaling decisions
func (e *RulesEngine) ProcessScoreUpdate(
	contentID string,
	scores *models.InputScores,
	currentState models.ContainerStatus,
) {
	log.Printf("Processing score update: content=%s, combined=%.2f, state=%s",
		contentID, scores.CombinedScore, currentState)

	// Rule: Scale based on combined score
	if scores.CombinedScore >= e.config.HotThreshold && currentState != models.StatusHot {
		e.makeDecision(models.TriggerCrossDomain, contentID, *scores,
			models.ActionScaleHot,
			fmt.Sprintf("Combined score %.2f exceeds hot threshold %.2f",
				scores.CombinedScore, e.config.HotThreshold))
	} else if scores.CombinedScore >= e.config.WarmThreshold && currentState == models.StatusCold {
		e.makeDecision(models.TriggerProactiveWarm, contentID, *scores,
			models.ActionScaleWarm,
			fmt.Sprintf("Combined score %.2f exceeds warm threshold %.2f",
				scores.CombinedScore, e.config.WarmThreshold))
	}
}

// ProcessTrendSpike handles viral/trending content detection
func (e *RulesEngine) ProcessTrendSpike(
	contentID string,
	viralScore float64,
	scores *models.InputScores,
	currentState models.ContainerStatus,
) {
	log.Printf("Processing trend spike: content=%s, viral=%.2f", contentID, viralScore)

	if viralScore >= e.config.SwarmTrendThreshold {
		// Swarm intelligence: boost score and potentially scale
		if currentState == models.StatusCold {
			e.makeDecision(models.TriggerSwarmBoost, contentID, *scores,
				models.ActionScaleWarm,
				fmt.Sprintf("Swarm intelligence detected viral trend (score: %.2f)", viralScore))
		}
	}
}

// checkCrossDomainRecommendation looks for related content to inject
func (e *RulesEngine) checkCrossDomainRecommendation(
	session *models.UserSession,
	focusedContent *models.ContentItem,
	allContent []*models.ContentItem,
	scores map[string]*models.InputScores,
) {
	// Find related content with different type but same theme
	for _, content := range allContent {
		if content.ID == focusedContent.ID {
			continue
		}

		// Skip if already injected
		if session.HasInjected(content.ID) {
			continue
		}

		// Cross-domain: same theme, different type
		if content.Theme == focusedContent.Theme && content.Type != focusedContent.Type {
			contentScores := scores[content.ID]
			if contentScores == nil {
				contentScores = &models.InputScores{}
			}

			// Boost the score for cross-domain content
			boostedScores := models.InputScores{
				PersonalScore: contentScores.PersonalScore + e.config.CrossDomainScoreBoost,
				GlobalScore:   contentScores.GlobalScore,
				CombinedScore: contentScores.CombinedScore + e.config.CrossDomainScoreBoost*0.5,
			}

			e.makeDecision(models.TriggerCrossDomain, content.ID, boostedScores,
				models.ActionInjectContent,
				fmt.Sprintf("Cross-domain recommendation: user engaged with %s %s, suggesting related %s",
					focusedContent.Type, focusedContent.Theme, content.Type))

			if e.OnInject != nil {
				e.OnInject(content, 1, "Cross-domain recommendation based on theme affinity")
			}

			session.MarkInjected(content.ID)
			break // Only inject one recommendation at a time
		}
	}
}

// checkProactiveWarming decides if content should be warmed based on engagement
func (e *RulesEngine) checkProactiveWarming(
	content *models.ContentItem,
	scores map[string]*models.InputScores,
) {
	contentScores := scores[content.ID]
	if contentScores == nil {
		return
	}

	if contentScores.CombinedScore >= e.config.WarmThreshold && content.ContainerStatus == models.StatusCold {
		e.makeDecision(models.TriggerProactiveWarm, content.ID, *contentScores,
			models.ActionScaleWarm,
			fmt.Sprintf("Proactive warming: engagement score %.2f indicates likely activation",
				contentScores.CombinedScore))
	}
}

// checkModeChange determines if the operational mode should change
func (e *RulesEngine) checkModeChange(session *models.UserSession, content *models.ContentItem) {
	var newMode models.OperationalMode
	var reason string

	switch content.Type {
	case models.ContentTypeGame:
		newMode = models.ModeGameFocus
		reason = "Extended engagement with gaming content"
	case models.ContentTypeAIService:
		newMode = models.ModeAIServiceFocus
		reason = "Extended engagement with AI service"
	default:
		newMode = models.ModeMixedStreamBrowsing
		reason = "Mixed content browsing"
	}

	if session.CurrentMode != newMode {
		oldMode := session.CurrentMode

		e.makeDecision(models.TriggerModeChange, content.ID, models.InputScores{},
			models.ActionChangeMode,
			fmt.Sprintf("Mode change from %s to %s: %s", oldMode, newMode, reason))

		if e.OnModeChange != nil {
			e.OnModeChange(oldMode, newMode, reason)
		}

		// Trigger resource throttling when mode changes to focused mode
		if e.OnThrottleAction != nil {
			if newMode == models.ModeGameFocus || newMode == models.ModeAIServiceFocus {
				e.makeDecision(models.TriggerResourceThrottle, content.ID, models.InputScores{},
					models.ActionThrottleBackground,
					fmt.Sprintf("Throttling background workloads for %s focus mode", content.Type))
				e.OnThrottleAction(content.ID, newMode)
			} else if newMode == models.ModeMixedStreamBrowsing {
				// Restore resources when returning to mixed browsing
				e.makeDecision(models.TriggerResourceThrottle, "", models.InputScores{},
					models.ActionRestoreResources,
					"Restoring resources for mixed stream browsing")
				e.OnThrottleAction("", newMode)
			}
		}

		session.CurrentMode = newMode
	}
}

// makeDecision creates and records an AI decision
func (e *RulesEngine) makeDecision(
	trigger models.TriggerType,
	contentID string,
	scores models.InputScores,
	action models.ActionType,
	reasoning string,
) {
	decision := &models.AIDecision{
		DecisionID:        fmt.Sprintf("dec-%d", time.Now().UnixNano()),
		Timestamp:         time.Now(),
		TriggerType:       trigger,
		AffectedContentID: contentID,
		ReasoningText:     reasoning,
		InputScores:       scores,
		ResultingAction:   action,
		Success:           true,
	}

	log.Printf("AI Decision: [%s] %s -> %s: %s",
		trigger, contentID, action, reasoning)

	if e.OnDecision != nil {
		e.OnDecision(decision)
	}

	// Trigger scaling action if needed
	if e.OnScaleAction != nil {
		switch action {
		case models.ActionScaleWarm:
			e.OnScaleAction(contentID, models.StatusWarm)
		case models.ActionScaleHot:
			e.OnScaleAction(contentID, models.StatusHot)
		}
	}
}
