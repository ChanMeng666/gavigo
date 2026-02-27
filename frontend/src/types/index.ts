// Content Types
export type ContentType = 'GAME' | 'AI_SERVICE';
export type ContainerStatus = 'COLD' | 'WARM' | 'HOT';
export type OperationalMode = 'MIXED_STREAM_BROWSING' | 'GAME_FOCUS_MODE' | 'AI_SERVICE_MODE';
export type TriggerType = 'CROSS_DOMAIN' | 'SWARM_BOOST' | 'PROACTIVE_WARM' | 'MODE_CHANGE' | 'RESOURCE_THROTTLE' | 'INITIAL_WARM' | 'LOOKAHEAD_WARM' | 'MANUAL';
export type ActionType = 'INJECT_CONTENT' | 'SCALE_WARM' | 'SCALE_HOT' | 'THROTTLE_BACKGROUND' | 'CHANGE_MODE';

// Activation Spine Types
export type ActivationPhase =
  | 'INTENT'
  | 'PRE_WARM'
  | 'PREVIEW_READY'
  | 'ACTIVATING'
  | 'HOT'
  | 'DEACTIVATING'
  | 'COOLING'
  | 'RESTORE_START'
  | 'RESTORE_COMPLETE';

export type ResourceWeight = 'IDLE_MINIMAL' | 'PREVIEW_LOW' | 'FULL_HIGH';

export interface ActivationSpineEvent {
  event_id: string;
  content_id: string;
  session_id: string;
  phase: ActivationPhase;
  timestamp: string;
  elapsed_from_start_ms: number;
  resource_weight: ResourceWeight;
  estimated_load_ms?: number;
  trigger_source: string;
  is_simulated: boolean;
  metadata?: Record<string, unknown>;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  theme: string;
  title: string;
  description: string;
  thumbnail_url: string;
  container_status: ContainerStatus;
  deployment_name: string;
  personal_score: number;
  global_score: number;
  combined_score: number;
}

export interface InputScores {
  personal_score: number;
  global_score: number;
  combined_score: number;
}

export interface AIDecision {
  decision_id: string;
  timestamp: string;
  trigger_type: TriggerType;
  affected_content_id: string;
  reasoning_text: string;
  input_scores: InputScores;
  resulting_action: ActionType;
  success: boolean;
}

export interface TrendScore {
  content_id: string;
  viral_score: number;
  trend_direction: 'RISING' | 'STABLE' | 'FALLING';
  last_updated: string;
  manual_override: boolean;
}

export interface ResourceAllocation {
  timestamp: string;
  active_allocation: number;
  warm_allocation: number;
  background_allocation: number;
  mode: string;
}

// WebSocket Event Types

// Client -> Server
export interface ScrollUpdatePayload {
  position: number;
  velocity: number;
  visible_content: string[];
}

export interface FocusEventPayload {
  content_id: string;
  duration_ms: number;
  theme: string;
}

export interface ActivationRequestPayload {
  content_id: string;
}

export interface DeactivationPayload {
  content_id: string;
}

export interface DemoControlPayload {
  action: 'trigger_trend_spike' | 'reset_demo' | 'force_warm' | 'force_cold';
  target_content_id: string;
  value?: number;
}

// Server -> Client
export interface ConnectionEstablishedPayload {
  session_id: string;
  initial_content: ContentItem[];
  current_mode: OperationalMode;
  container_states: Record<string, ContainerStatus>;
}

export interface ContainerStateChangePayload {
  content_id: string;
  old_state: ContainerStatus;
  new_state: ContainerStatus;
  deployment_name: string;
  timestamp: string;
}

export interface ScoreUpdatePayload {
  content_id: string;
  personal_score: number;
  global_score: number;
  combined_score: number;
  threshold_exceeded: boolean;
}

export interface ModeChangePayload {
  old_mode: OperationalMode;
  new_mode: OperationalMode;
  reason: string;
  timestamp: string;
}

export interface StreamInjectPayload {
  content: ContentItem;
  insert_position: number;
  reason: string;
}

export interface ActivationReadyPayload {
  content_id: string;
  endpoint_url: string;
  status: ContainerStatus;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: string;
}

// Social event from WebSocket
export interface SocialEvent {
  event_type: 'like' | 'unlike' | 'comment' | 'follow' | 'unfollow';
  user_id: string;
  username: string;
  content_id?: string;
  target_user?: string;
  text?: string;
  count?: number;
  timestamp: string;
}

// Engagement summary from WebSocket
export interface EngagementSummary {
  session_id: string;
  active_content_id: string;
  active_content_title: string;
  focus_duration_ms: number;
  theme: string;
  scroll_position: number;
  scroll_velocity: number;
  theme_focus_times: Record<string, number>;
  timestamp: string;
}

// User activity event from WebSocket
export interface UserActivityEvent {
  session_id: string;
  event_type: string;
  screen_name?: string;
  action?: string;
  value?: string;
  timestamp: string;
}

// Proof Signal Types
export type ProofEventType =
  | 'intent_detected'
  | 'orchestration_decision_made'
  | 'prewarm_start'
  | 'warm_ready'
  | 'activation_request_received'
  | 'hot_state_entered'
  | 'execution_ready'
  | 'restore_start'
  | 'restore_complete';

export type ActivationPathType = 'COLD_PATH' | 'PREWARM_PATH' | 'RESTORE_PATH';

export interface ProofSignalEvent {
  event_id: string;
  content_id: string;
  attempt_id: string;
  event_type: ProofEventType;
  ts_server_ms: number;
  source_event_type: string;
  trigger_type?: string;
  state_from?: string;
  state_to?: string;
  metadata?: Record<string, unknown>;
}

export interface TelemetrySnapshot {
  content_id: string;
  attempt_id: string;
  current_state: ContainerStatus;
  activation_path_type: ActivationPathType;
  cache_hit_indicator: boolean;
  trigger_type?: string;
  last_reasoning_short?: string;
  intent_ts: number;
  decision_ts: number;
  prewarm_start_ts: number;
  warm_ready_ts: number;
  activation_request_ts: number;
  hot_entered_ts: number;
  execution_ready_ts: number;
  restore_start_ts: number;
  restore_complete_ts: number;
  orchestration_decision_time_ms: number;
  prewarm_duration_ms: number;
  activation_latency_ms: number;
  execution_ready_latency_ms: number;
  restore_latency_ms: number;
}

// Generic WebSocket message
export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
}

// WebSocket event types
export type WSEventType =
  | 'connection_established'
  | 'decision_made'
  | 'container_state_change'
  | 'score_update'
  | 'mode_change'
  | 'stream_inject'
  | 'resource_update'
  | 'activation_ready'
  | 'activation_spine'
  | 'social_event'
  | 'engagement_update'
  | 'user_activity'
  | 'proof_signal'
  | 'telemetry_update'
  | 'error';

// Application State
export interface AppState {
  sessionId: string | null;
  connected: boolean;
  currentMode: OperationalMode;
  content: ContentItem[];
  containerStates: Record<string, ContainerStatus>;
  scores: Record<string, InputScores>;
  decisions: AIDecision[];
  resources: ResourceAllocation | null;
  activeContentId: string | null;
  activationSpine: ActivationSpineEvent[];
  proofSignals: ProofSignalEvent[];
  telemetrySnapshots: Record<string, TelemetrySnapshot>;
}
