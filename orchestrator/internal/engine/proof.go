package engine

import (
	"fmt"
	"sync"
	"time"

	"github.com/gavigo/orchestrator/internal/config"
	"github.com/gavigo/orchestrator/internal/models"
)

// AttemptState tracks timestamps and metadata for a single activation attempt
type AttemptState struct {
	AttemptID       string
	ContentID       string
	Completed       bool
	PathType        models.ActivationPathType
	CacheHit        bool
	TriggerType     string
	ReasoningShort  string
	CurrentState    models.ContainerStatus

	IntentTs            int64
	DecisionTs          int64
	PrewarmStartTs      int64
	WarmReadyTs         int64
	ActivationRequestTs int64
	HotEnteredTs        int64
	ExecutionReadyTs    int64
	RestoreStartTs      int64
	RestoreCompleteTs   int64
}

// ProofSignalManager tracks proof signals and computes telemetry snapshots
type ProofSignalManager struct {
	mu             sync.Mutex
	enabled        bool
	restoreWindow  int64 // milliseconds
	attempts       map[string]*AttemptState  // content_id -> current attempt
	hotHistory     map[string]int64          // content_id -> last HOT time (UnixMilli)
	focusLossTime  map[string]int64          // content_id -> last focus loss time
	recentSignals  []*models.ProofSignalEvent // circular buffer
	maxSignals     int

	onEmit           func(event *models.ProofSignalEvent)
	onSnapshotUpdate func(snapshot *models.TelemetrySnapshot)
}

// NewProofSignalManager creates a new proof signal manager
func NewProofSignalManager(cfg *config.Config, onEmit func(*models.ProofSignalEvent), onSnapshotUpdate func(*models.TelemetrySnapshot)) *ProofSignalManager {
	return &ProofSignalManager{
		enabled:          cfg.ProofSignalsEnabled,
		restoreWindow:    cfg.RestoreWindowMs,
		attempts:         make(map[string]*AttemptState),
		hotHistory:       make(map[string]int64),
		focusLossTime:    make(map[string]int64),
		recentSignals:    make([]*models.ProofSignalEvent, 0, 200),
		maxSignals:       200,
		onEmit:           onEmit,
		onSnapshotUpdate: onSnapshotUpdate,
	}
}

func (m *ProofSignalManager) nowMs() int64 {
	return time.Now().UnixMilli()
}

func (m *ProofSignalManager) getOrCreateAttempt(contentID string) *AttemptState {
	att, exists := m.attempts[contentID]
	if !exists || att.Completed {
		att = &AttemptState{
			AttemptID:    fmt.Sprintf("%s-%d", contentID, m.nowMs()),
			ContentID:    contentID,
			CurrentState: models.StatusCold,
		}
		m.attempts[contentID] = att
	}
	return att
}

func (m *ProofSignalManager) emit(contentID string, eventType models.ProofEventType, sourceEvent string, extra map[string]any) {
	if !m.enabled {
		return
	}

	att := m.attempts[contentID]
	if att == nil {
		return
	}

	event := &models.ProofSignalEvent{
		EventID:         fmt.Sprintf("proof-%d-%s", time.Now().UnixNano(), eventType),
		ContentID:       contentID,
		AttemptID:       att.AttemptID,
		EventType:       eventType,
		TsServerMs:      m.nowMs(),
		SourceEventType: sourceEvent,
		TriggerType:     att.TriggerType,
		Metadata:        extra,
	}

	// Add to circular buffer
	if len(m.recentSignals) >= m.maxSignals {
		m.recentSignals = m.recentSignals[1:]
	}
	m.recentSignals = append(m.recentSignals, event)

	if m.onEmit != nil {
		m.onEmit(event)
	}

	// Compute and broadcast snapshot
	m.emitSnapshot(att)
}

func (m *ProofSignalManager) emitSnapshot(att *AttemptState) {
	snap := &models.TelemetrySnapshot{
		ContentID:          att.ContentID,
		AttemptID:          att.AttemptID,
		CurrentState:       att.CurrentState,
		ActivationPathType: att.PathType,
		CacheHitIndicator:  att.CacheHit,
		TriggerType:        att.TriggerType,
		LastReasoningShort: att.ReasoningShort,

		IntentTs:            att.IntentTs,
		DecisionTs:          att.DecisionTs,
		PrewarmStartTs:      att.PrewarmStartTs,
		WarmReadyTs:         att.WarmReadyTs,
		ActivationRequestTs: att.ActivationRequestTs,
		HotEnteredTs:        att.HotEnteredTs,
		ExecutionReadyTs:    att.ExecutionReadyTs,
		RestoreStartTs:      att.RestoreStartTs,
		RestoreCompleteTs:   att.RestoreCompleteTs,

		// Computed metrics
		OrchestrationDecisionTimeMs: m.computeLatency(att.IntentTs, att.DecisionTs),
		PrewarmDurationMs:           m.computeLatency(att.PrewarmStartTs, att.WarmReadyTs),
		ActivationLatencyMs:         m.computeLatency(att.ActivationRequestTs, att.HotEnteredTs),
		ExecutionReadyLatencyMs:     m.computeLatency(att.ActivationRequestTs, att.ExecutionReadyTs),
		RestoreLatencyMs:            m.computeLatency(att.RestoreStartTs, att.RestoreCompleteTs),
	}

	if m.onSnapshotUpdate != nil {
		m.onSnapshotUpdate(snap)
	}
}

// computeLatency returns the difference in ms, or -1 if either timestamp is 0
func (m *ProofSignalManager) computeLatency(from, to int64) int64 {
	if from == 0 || to == 0 {
		return -1
	}
	return to - from
}

// OnIntentDetected records an intent signal for a content item
func (m *ProofSignalManager) OnIntentDetected(contentID string) {
	if !m.enabled {
		return
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	att := m.getOrCreateAttempt(contentID)
	if att.IntentTs != 0 {
		return // Already have intent for this attempt
	}
	att.IntentTs = m.nowMs()
	m.emit(contentID, models.ProofIntentDetected, "focus_event", nil)
}

// OnDecisionMade records an orchestration decision
func (m *ProofSignalManager) OnDecisionMade(decision *models.AIDecision) {
	if !m.enabled {
		return
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	contentID := decision.AffectedContentID
	att := m.getOrCreateAttempt(contentID)
	att.DecisionTs = m.nowMs()
	att.TriggerType = string(decision.TriggerType)

	// Truncate reasoning to short form
	reasoning := decision.ReasoningText
	if len(reasoning) > 80 {
		reasoning = reasoning[:77] + "..."
	}
	att.ReasoningShort = reasoning

	m.emit(contentID, models.ProofOrchestrationDecisionMade, "decision_made", map[string]any{
		"trigger_type": decision.TriggerType,
		"action":       decision.ResultingAction,
	})
}

// OnContainerStateChange records container state transitions
func (m *ProofSignalManager) OnContainerStateChange(contentID string, oldState, newState models.ContainerStatus) {
	if !m.enabled {
		return
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	att := m.getOrCreateAttempt(contentID)
	att.CurrentState = newState

	switch {
	case newState == models.StatusWarm && oldState == models.StatusCold:
		att.PrewarmStartTs = m.nowMs()
		event := &models.ProofSignalEvent{
			EventID:         fmt.Sprintf("proof-%d-%s", time.Now().UnixNano(), models.ProofPrewarmStart),
			ContentID:       contentID,
			AttemptID:       att.AttemptID,
			EventType:       models.ProofPrewarmStart,
			TsServerMs:      m.nowMs(),
			SourceEventType: "container_state_change",
			TriggerType:     att.TriggerType,
			StateFrom:       string(oldState),
			StateTo:         string(newState),
		}
		if len(m.recentSignals) >= m.maxSignals {
			m.recentSignals = m.recentSignals[1:]
		}
		m.recentSignals = append(m.recentSignals, event)
		if m.onEmit != nil {
			m.onEmit(event)
		}
		m.emitSnapshot(att)

	case newState == models.StatusHot:
		att.HotEnteredTs = m.nowMs()
		event := &models.ProofSignalEvent{
			EventID:         fmt.Sprintf("proof-%d-%s", time.Now().UnixNano(), models.ProofHotStateEntered),
			ContentID:       contentID,
			AttemptID:       att.AttemptID,
			EventType:       models.ProofHotStateEntered,
			TsServerMs:      m.nowMs(),
			SourceEventType: "container_state_change",
			TriggerType:     att.TriggerType,
			StateFrom:       string(oldState),
			StateTo:         string(newState),
		}
		if len(m.recentSignals) >= m.maxSignals {
			m.recentSignals = m.recentSignals[1:]
		}
		m.recentSignals = append(m.recentSignals, event)
		if m.onEmit != nil {
			m.onEmit(event)
		}
		m.emitSnapshot(att)
	}
}

// OnPreviewReady records that a prewarmed container is ready
func (m *ProofSignalManager) OnPreviewReady(contentID string) {
	if !m.enabled {
		return
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	att, exists := m.attempts[contentID]
	if !exists {
		return
	}
	att.WarmReadyTs = m.nowMs()
	m.emit(contentID, models.ProofWarmReady, "preview_ready", nil)
}

// OnActivationRequest classifies the path and records the activation request
func (m *ProofSignalManager) OnActivationRequest(contentID string, currentState models.ContainerStatus) {
	if !m.enabled {
		return
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	att := m.getOrCreateAttempt(contentID)
	att.ActivationRequestTs = m.nowMs()

	// Classify path
	now := m.nowMs()
	hotTime, wasHot := m.hotHistory[contentID]
	lossTime, hadLoss := m.focusLossTime[contentID]

	if wasHot && hadLoss && (now-lossTime) < m.restoreWindow && (now-hotTime) < m.restoreWindow {
		att.PathType = models.PathRestore
		att.CacheHit = true
	} else if currentState == models.StatusWarm || currentState == models.StatusHot {
		att.PathType = models.PathPrewarm
		att.CacheHit = true
	} else {
		att.PathType = models.PathCold
		att.CacheHit = false
	}

	m.emit(contentID, models.ProofActivationRequestReceived, "activation_request", map[string]any{
		"path_type":     att.PathType,
		"cache_hit":     att.CacheHit,
		"current_state": currentState,
	})
}

// OnExecutionReady marks the attempt as complete (cold/prewarm paths)
func (m *ProofSignalManager) OnExecutionReady(contentID string) {
	if !m.enabled {
		return
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	att, exists := m.attempts[contentID]
	if !exists {
		return
	}
	att.ExecutionReadyTs = m.nowMs()
	att.Completed = true
	m.emit(contentID, models.ProofExecutionReady, "activation_ready", nil)
}

// OnRestoreStart records a restore start
func (m *ProofSignalManager) OnRestoreStart(contentID string) {
	if !m.enabled {
		return
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	att := m.getOrCreateAttempt(contentID)
	att.RestoreStartTs = m.nowMs()
	att.PathType = models.PathRestore
	att.CacheHit = true
	m.emit(contentID, models.ProofRestoreStart, "activation_request", nil)
}

// OnRestoreComplete marks the restore attempt as complete
func (m *ProofSignalManager) OnRestoreComplete(contentID string) {
	if !m.enabled {
		return
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	att, exists := m.attempts[contentID]
	if !exists {
		return
	}
	att.RestoreCompleteTs = m.nowMs()
	att.Completed = true
	m.emit(contentID, models.ProofRestoreComplete, "restore_complete", nil)
}

// OnDeactivation records HOT time and focus loss time for restore eligibility
func (m *ProofSignalManager) OnDeactivation(contentID string) {
	if !m.enabled {
		return
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	now := m.nowMs()
	m.hotHistory[contentID] = now
	m.focusLossTime[contentID] = now
}

// InvalidateAttempt clears the current attempt for a content item (used for force_warm/force_cold)
func (m *ProofSignalManager) InvalidateAttempt(contentID string) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if att, exists := m.attempts[contentID]; exists {
		att.Completed = true
	}
}

// Reset clears all proof signal state
func (m *ProofSignalManager) Reset() {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.attempts = make(map[string]*AttemptState)
	m.hotHistory = make(map[string]int64)
	m.focusLossTime = make(map[string]int64)
	m.recentSignals = make([]*models.ProofSignalEvent, 0, 200)
}

// GetAllSnapshots returns telemetry snapshots for all active attempts
func (m *ProofSignalManager) GetAllSnapshots() map[string]*models.TelemetrySnapshot {
	m.mu.Lock()
	defer m.mu.Unlock()

	snapshots := make(map[string]*models.TelemetrySnapshot)
	for contentID, att := range m.attempts {
		snapshots[contentID] = &models.TelemetrySnapshot{
			ContentID:          att.ContentID,
			AttemptID:          att.AttemptID,
			CurrentState:       att.CurrentState,
			ActivationPathType: att.PathType,
			CacheHitIndicator:  att.CacheHit,
			TriggerType:        att.TriggerType,
			LastReasoningShort: att.ReasoningShort,

			IntentTs:            att.IntentTs,
			DecisionTs:          att.DecisionTs,
			PrewarmStartTs:      att.PrewarmStartTs,
			WarmReadyTs:         att.WarmReadyTs,
			ActivationRequestTs: att.ActivationRequestTs,
			HotEnteredTs:        att.HotEnteredTs,
			ExecutionReadyTs:    att.ExecutionReadyTs,
			RestoreStartTs:      att.RestoreStartTs,
			RestoreCompleteTs:   att.RestoreCompleteTs,

			OrchestrationDecisionTimeMs: m.computeLatency(att.IntentTs, att.DecisionTs),
			PrewarmDurationMs:           m.computeLatency(att.PrewarmStartTs, att.WarmReadyTs),
			ActivationLatencyMs:         m.computeLatency(att.ActivationRequestTs, att.HotEnteredTs),
			ExecutionReadyLatencyMs:     m.computeLatency(att.ActivationRequestTs, att.ExecutionReadyTs),
			RestoreLatencyMs:            m.computeLatency(att.RestoreStartTs, att.RestoreCompleteTs),
		}
	}
	return snapshots
}

// GetRecentSignals returns the most recent proof signals up to the limit
func (m *ProofSignalManager) GetRecentSignals(limit int) []*models.ProofSignalEvent {
	m.mu.Lock()
	defer m.mu.Unlock()

	if limit <= 0 || limit > len(m.recentSignals) {
		limit = len(m.recentSignals)
	}

	// Return most recent first
	result := make([]*models.ProofSignalEvent, limit)
	for i := 0; i < limit; i++ {
		result[i] = m.recentSignals[len(m.recentSignals)-1-i]
	}
	return result
}
