package models

import "time"

// WebSocket Event Types

// Client -> Server Events

type ScrollUpdateEvent struct {
	Type    string   `json:"type"` // "scroll_update"
	Payload struct {
		Position       int      `json:"position"`
		Velocity       float64  `json:"velocity"`
		VisibleContent []string `json:"visible_content"`
	} `json:"payload"`
}

type FocusEvent struct {
	Type    string `json:"type"` // "focus_event"
	Payload struct {
		ContentID  string `json:"content_id"`
		DurationMS int    `json:"duration_ms"`
		Theme      string `json:"theme"`
	} `json:"payload"`
}

type ActivationRequestEvent struct {
	Type    string `json:"type"` // "activation_request"
	Payload struct {
		ContentID string `json:"content_id"`
	} `json:"payload"`
}

type DeactivationEvent struct {
	Type    string `json:"type"` // "deactivation"
	Payload struct {
		ContentID string `json:"content_id"`
	} `json:"payload"`
}

type DemoControlEvent struct {
	Type    string `json:"type"` // "demo_control"
	Payload struct {
		Action          string  `json:"action"` // trigger_trend_spike, reset_demo, force_warm, force_cold
		TargetContentID string  `json:"target_content_id"`
		Value           float64 `json:"value,omitempty"`
	} `json:"payload"`
}

// Server -> Client Events

type ConnectionEstablishedEvent struct {
	Type    string `json:"type"` // "connection_established"
	Payload struct {
		SessionID       string                   `json:"session_id"`
		InitialContent  []ContentItem            `json:"initial_content"`
		CurrentMode     OperationalMode          `json:"current_mode"`
		ContainerStates map[string]ContainerStatus `json:"container_states"`
	} `json:"payload"`
}

type DecisionMadeEvent struct {
	Type    string      `json:"type"` // "decision_made"
	Payload *AIDecision `json:"payload"`
}

type ContainerStateChangeEvent struct {
	Type    string `json:"type"` // "container_state_change"
	Payload struct {
		ContentID      string          `json:"content_id"`
		OldState       ContainerStatus `json:"old_state"`
		NewState       ContainerStatus `json:"new_state"`
		DeploymentName string          `json:"deployment_name"`
		Timestamp      time.Time       `json:"timestamp"`
	} `json:"payload"`
}

type ScoreUpdateEvent struct {
	Type    string `json:"type"` // "score_update"
	Payload struct {
		ContentID         string  `json:"content_id"`
		PersonalScore     float64 `json:"personal_score"`
		GlobalScore       float64 `json:"global_score"`
		CombinedScore     float64 `json:"combined_score"`
		ThresholdExceeded bool    `json:"threshold_exceeded"`
	} `json:"payload"`
}

type ModeChangeEvent struct {
	Type    string `json:"type"` // "mode_change"
	Payload struct {
		OldMode   OperationalMode `json:"old_mode"`
		NewMode   OperationalMode `json:"new_mode"`
		Reason    string          `json:"reason"`
		Timestamp time.Time       `json:"timestamp"`
	} `json:"payload"`
}

type StreamInjectEvent struct {
	Type    string `json:"type"` // "stream_inject"
	Payload struct {
		Content        ContentItem `json:"content"`
		InsertPosition int         `json:"insert_position"`
		Reason         string      `json:"reason"`
	} `json:"payload"`
}

type ResourceUpdateEvent struct {
	Type    string             `json:"type"` // "resource_update"
	Payload ResourceAllocation `json:"payload"`
}

type ActivationReadyEvent struct {
	Type    string `json:"type"` // "activation_ready"
	Payload struct {
		ContentID   string          `json:"content_id"`
		EndpointURL string          `json:"endpoint_url"`
		Status      ContainerStatus `json:"status"`
	} `json:"payload"`
}

type ErrorEvent struct {
	Type    string `json:"type"` // "error"
	Payload struct {
		Code    string `json:"code"`
		Message string `json:"message"`
		Details string `json:"details,omitempty"`
	} `json:"payload"`
}

// Generic event for parsing type first
type GenericEvent struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}
