package models

// ProofEventType represents the type of proof signal event
type ProofEventType string

const (
	ProofIntentDetected              ProofEventType = "intent_detected"
	ProofOrchestrationDecisionMade   ProofEventType = "orchestration_decision_made"
	ProofPrewarmStart                ProofEventType = "prewarm_start"
	ProofWarmReady                   ProofEventType = "warm_ready"
	ProofActivationRequestReceived   ProofEventType = "activation_request_received"
	ProofHotStateEntered             ProofEventType = "hot_state_entered"
	ProofExecutionReady              ProofEventType = "execution_ready"
	ProofRestoreStart                ProofEventType = "restore_start"
	ProofRestoreComplete             ProofEventType = "restore_complete"
)

// ActivationPathType classifies how content reached activation
type ActivationPathType string

const (
	PathCold    ActivationPathType = "COLD_PATH"
	PathPrewarm ActivationPathType = "PREWARM_PATH"
	PathRestore ActivationPathType = "RESTORE_PATH"
)

// ProofSignalEvent is a normalized, timestamped proof event
type ProofSignalEvent struct {
	EventID         string         `json:"event_id"`
	ContentID       string         `json:"content_id"`
	AttemptID       string         `json:"attempt_id"`
	EventType       ProofEventType `json:"event_type"`
	TsServerMs      int64          `json:"ts_server_ms"`
	SourceEventType string         `json:"source_event_type"`
	TriggerType     string         `json:"trigger_type,omitempty"`
	StateFrom       string         `json:"state_from,omitempty"`
	StateTo         string         `json:"state_to,omitempty"`
	Metadata        map[string]any `json:"metadata,omitempty"`
}

// TelemetrySnapshot aggregates all metrics for a content item's current attempt
type TelemetrySnapshot struct {
	ContentID          string             `json:"content_id"`
	AttemptID          string             `json:"attempt_id"`
	CurrentState       ContainerStatus    `json:"current_state"`
	ActivationPathType ActivationPathType `json:"activation_path_type"`
	CacheHitIndicator  bool               `json:"cache_hit_indicator"`
	TriggerType        string             `json:"trigger_type,omitempty"`
	LastReasoningShort string             `json:"last_reasoning_short,omitempty"`

	// Timestamps (0 = not yet reached)
	IntentTs            int64 `json:"intent_ts"`
	DecisionTs          int64 `json:"decision_ts"`
	PrewarmStartTs      int64 `json:"prewarm_start_ts"`
	WarmReadyTs         int64 `json:"warm_ready_ts"`
	ActivationRequestTs int64 `json:"activation_request_ts"`
	HotEnteredTs        int64 `json:"hot_entered_ts"`
	ExecutionReadyTs    int64 `json:"execution_ready_ts"`
	RestoreStartTs      int64 `json:"restore_start_ts"`
	RestoreCompleteTs   int64 `json:"restore_complete_ts"`

	// Computed metrics (-1 = not applicable)
	OrchestrationDecisionTimeMs int64 `json:"orchestration_decision_time_ms"`
	PrewarmDurationMs           int64 `json:"prewarm_duration_ms"`
	ActivationLatencyMs         int64 `json:"activation_latency_ms"`
	ExecutionReadyLatencyMs     int64 `json:"execution_ready_latency_ms"`
	RestoreLatencyMs            int64 `json:"restore_latency_ms"`
}
