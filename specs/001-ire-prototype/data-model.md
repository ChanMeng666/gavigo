# Data Model: GAVIGO IRE Visualization Prototype

**Date**: 2025-01-21
**Branch**: `001-ire-prototype`

## Entity Definitions

### ContentItem

Represents a piece of content that can appear in the stream.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (e.g., "football-game", "scifi-video-1") |
| type | enum | GAME, AI_SERVICE, VIDEO |
| theme | string | Content theme (e.g., "football", "scifi", "tech") |
| title | string | Display title |
| description | string | Short description |
| thumbnail_url | string | Preview image URL |
| container_status | enum | COLD, WARM, HOT |
| deployment_name | string | K8s deployment name |
| personal_score | float | Personal recommendation score (0.0-1.0) |
| global_score | float | Global viral score (0.0-1.0) |
| combined_score | float | Weighted combination of scores |

**State Transitions**:
```
COLD → WARM: Triggered by proactive scaling (combined_score > threshold)
WARM → HOT: Triggered by user activation (click on IIP)
HOT → WARM: Triggered by deactivation (user exits full-screen)
WARM → COLD: Triggered by timeout or resource pressure
```

**Cross-Domain Relationships**:
```
football-video-* → football-game (Type C → Type A)
scifi-video-* → scifi-game (Type C → Type A)
```

---

### UserSession

Tracks engagement metrics for a single user session.

| Field | Type | Description |
|-------|------|-------------|
| session_id | string | Unique session identifier |
| current_mode | enum | MIXED_STREAM_BROWSING, GAME_FOCUS_MODE, AI_SERVICE_MODE |
| scroll_position | int | Current scroll position in stream |
| scroll_velocity | float | Scroll speed (pixels/second) |
| focus_times | map[string]int | Cumulative focus time per theme (ms) |
| active_content_id | string | Currently activated content (null if browsing) |
| last_activity | timestamp | Last user interaction time |
| injected_content | []string | List of content IDs injected this session |

**Mode Transitions**:
```
MIXED_STREAM_BROWSING → GAME_FOCUS_MODE: User activates a game
MIXED_STREAM_BROWSING → AI_SERVICE_MODE: User activates an AI service
GAME_FOCUS_MODE → MIXED_STREAM_BROWSING: User exits game
AI_SERVICE_MODE → MIXED_STREAM_BROWSING: User exits AI service
```

---

### AIDecision

Captures an orchestrator decision for logging and dashboard display.

| Field | Type | Description |
|-------|------|-------------|
| decision_id | string | Unique decision identifier (UUID) |
| timestamp | timestamp | When decision was made |
| trigger_type | enum | CROSS_DOMAIN, SWARM_BOOST, PROACTIVE_WARM, MODE_CHANGE, RESOURCE_THROTTLE |
| affected_content_id | string | Content affected by this decision |
| reasoning_text | string | Human-readable explanation |
| input_scores | object | Scores that influenced decision |
| resulting_action | enum | INJECT_CONTENT, SCALE_WARM, SCALE_HOT, THROTTLE_BACKGROUND, CHANGE_MODE |
| success | bool | Whether action completed successfully |

**Example Decision Log Entries**:
```
"User watching Football Video. Cross-Domain trigger activated."
"High Global_Viral_Score (0.85) for 'Football Game'. Combined Score: High."
"Injecting 'Football Game' into stream and initiating WARM process (Scaling Deployment to 1)."
"User activated 'Football Game'. Switching to Game_Focus_Mode. Throttling background workloads."
```

---

### TrendScore

Global popularity metric for content (Swarm Intelligence simulation).

| Field | Type | Description |
|-------|------|-------------|
| content_id | string | Reference to ContentItem |
| viral_score | float | Global popularity (0.0-1.0) |
| trend_direction | enum | RISING, STABLE, FALLING |
| last_updated | timestamp | Last score update |
| manual_override | bool | True if set via Demo Control Panel |

**Redis Storage**:
```
Key: trend:{content_id}
Value: {viral_score, trend_direction, last_updated, manual_override}
TTL: None (persistent for demo duration)
```

---

### ResourceAllocation

Current resource distribution for visualization.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | timestamp | Measurement time |
| active_allocation | float | Percentage for active content (0-100) |
| warm_allocation | float | Percentage for warm containers (0-100) |
| background_allocation | float | Percentage for background workloads (0-100) |
| mode | string | Current operational mode |

**Example Allocations**:
```
MIXED_STREAM_BROWSING: active=0, warm=40, background=60
GAME_FOCUS_MODE: active=70, warm=20, background=10
```

---

## WebSocket Event Types

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `scroll_update` | `{position: int, velocity: float, visible_content: []string}` | Scroll position changed |
| `focus_event` | `{content_id: string, duration_ms: int, theme: string}` | User focused on content |
| `activation_request` | `{content_id: string}` | User clicked IIP |
| `deactivation` | `{content_id: string}` | User exited full-screen |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `decision_made` | `AIDecision` | New AI decision logged |
| `container_state_change` | `{content_id, old_state, new_state}` | Container status changed |
| `score_update` | `{content_id, personal_score, global_score, combined_score}` | Scores updated |
| `mode_change` | `{old_mode, new_mode, reason}` | Operational mode changed |
| `stream_inject` | `{content: ContentItem, insert_position: int}` | Inject content into stream |
| `resource_update` | `ResourceAllocation` | Resource distribution changed |
| `activation_ready` | `{content_id, endpoint_url}` | Content ready for full-screen |

---

## Redis Data Structures

### Content State
```
Key: content:{content_id}
Type: Hash
Fields: type, theme, title, container_status, deployment_name, personal_score, global_score
```

### Session State
```
Key: session:{session_id}
Type: Hash
Fields: current_mode, scroll_position, active_content_id, last_activity
```

### Theme Focus Times
```
Key: session:{session_id}:focus
Type: Hash
Fields: football, scifi, tech, etc. (values in milliseconds)
```

### Global Trends
```
Key: trend:{content_id}
Type: Hash
Fields: viral_score, trend_direction, last_updated, manual_override
```

### Decision Log (recent)
```
Key: decisions:recent
Type: List (capped at 50 entries)
Values: JSON-encoded AIDecision objects
```
