package models

import (
	"time"

	"github.com/google/uuid"
)

type TriggerType string

const (
	TriggerCrossDomain      TriggerType = "CROSS_DOMAIN"
	TriggerSwarmBoost       TriggerType = "SWARM_BOOST"
	TriggerProactiveWarm    TriggerType = "PROACTIVE_WARM"
	TriggerModeChange       TriggerType = "MODE_CHANGE"
	TriggerResourceThrottle TriggerType = "RESOURCE_THROTTLE"
)

type ActionType string

const (
	ActionInjectContent     ActionType = "INJECT_CONTENT"
	ActionScaleWarm         ActionType = "SCALE_WARM"
	ActionScaleHot          ActionType = "SCALE_HOT"
	ActionThrottleBackground ActionType = "THROTTLE_BACKGROUND"
	ActionChangeMode        ActionType = "CHANGE_MODE"
)

type InputScores struct {
	PersonalScore float64 `json:"personal_score"`
	GlobalScore   float64 `json:"global_score"`
	CombinedScore float64 `json:"combined_score"`
}

type AIDecision struct {
	DecisionID        string      `json:"decision_id"`
	Timestamp         time.Time   `json:"timestamp"`
	TriggerType       TriggerType `json:"trigger_type"`
	AffectedContentID string      `json:"affected_content_id"`
	ReasoningText     string      `json:"reasoning_text"`
	InputScores       InputScores `json:"input_scores"`
	ResultingAction   ActionType  `json:"resulting_action"`
	Success           bool        `json:"success"`
}

// NewDecision creates a new AI decision with a generated ID
func NewDecision(trigger TriggerType, contentID, reasoning string, scores InputScores, action ActionType) *AIDecision {
	return &AIDecision{
		DecisionID:        uuid.New().String(),
		Timestamp:         time.Now(),
		TriggerType:       trigger,
		AffectedContentID: contentID,
		ReasoningText:     reasoning,
		InputScores:       scores,
		ResultingAction:   action,
		Success:           false, // Set to true after action completes
	}
}

type TrendScore struct {
	ContentID      string    `json:"content_id"`
	ViralScore     float64   `json:"viral_score"`
	TrendDirection string    `json:"trend_direction"` // RISING, STABLE, FALLING
	LastUpdated    time.Time `json:"last_updated"`
	ManualOverride bool      `json:"manual_override"`
}

type ResourceAllocation struct {
	Timestamp            time.Time `json:"timestamp"`
	ActiveAllocation     float64   `json:"active_allocation"`
	WarmAllocation       float64   `json:"warm_allocation"`
	BackgroundAllocation float64   `json:"background_allocation"`
	Mode                 string    `json:"mode"`
}

// DefaultResourceAllocation returns resource allocation based on mode
func DefaultResourceAllocation(mode OperationalMode) ResourceAllocation {
	allocation := ResourceAllocation{
		Timestamp: time.Now(),
		Mode:      string(mode),
	}

	switch mode {
	case ModeGameFocus, ModeAIServiceFocus:
		allocation.ActiveAllocation = 70
		allocation.WarmAllocation = 20
		allocation.BackgroundAllocation = 10
	default: // ModeMixedStreamBrowsing
		allocation.ActiveAllocation = 0
		allocation.WarmAllocation = 40
		allocation.BackgroundAllocation = 60
	}

	return allocation
}
