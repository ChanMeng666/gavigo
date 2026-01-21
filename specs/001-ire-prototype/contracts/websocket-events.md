# WebSocket Events Contract

**Version**: 1.0.0
**Protocol**: WebSocket (wss://)
**Endpoint**: `/ws`

## Connection

### Handshake
```
GET /ws HTTP/1.1
Upgrade: websocket
Connection: Upgrade
```

### Connection Established
Server sends initial state:
```json
{
  "type": "connection_established",
  "payload": {
    "session_id": "uuid-string",
    "initial_content": [...],
    "current_mode": "MIXED_STREAM_BROWSING",
    "container_states": {...}
  }
}
```

---

## Client → Server Events

### scroll_update
Sent when user scrolls the stream.

```json
{
  "type": "scroll_update",
  "payload": {
    "position": 1500,
    "velocity": 120.5,
    "visible_content": ["video-football-1", "video-football-2", "game-football"]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| position | int | yes | Scroll position in pixels |
| velocity | float | yes | Scroll speed (px/sec), negative = up |
| visible_content | []string | yes | Content IDs currently in viewport |

---

### focus_event
Sent when user dwells on content item.

```json
{
  "type": "focus_event",
  "payload": {
    "content_id": "video-football-1",
    "duration_ms": 3500,
    "theme": "football"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content_id | string | yes | ID of focused content |
| duration_ms | int | yes | Focus duration in milliseconds |
| theme | string | yes | Content theme for cross-domain |

---

### activation_request
Sent when user clicks an IIP (Instant Interaction Point).

```json
{
  "type": "activation_request",
  "payload": {
    "content_id": "game-football"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content_id | string | yes | ID of content to activate |

---

### deactivation
Sent when user exits full-screen view.

```json
{
  "type": "deactivation",
  "payload": {
    "content_id": "game-football"
  }
}
```

---

### demo_control (Dashboard only)
Sent from demo control panel.

```json
{
  "type": "demo_control",
  "payload": {
    "action": "trigger_trend_spike",
    "target_content_id": "game-football",
    "value": 0.85
  }
}
```

| Action | Description |
|--------|-------------|
| trigger_trend_spike | Set viral score to value |
| reset_demo | Reset all states to initial |
| force_warm | Force container to WARM state |
| force_cold | Force container to COLD state |

---

## Server → Client Events

### decision_made
Broadcast when AI Orchestrator makes a decision.

```json
{
  "type": "decision_made",
  "payload": {
    "decision_id": "uuid-string",
    "timestamp": "2025-01-21T10:30:00Z",
    "trigger_type": "CROSS_DOMAIN",
    "affected_content_id": "game-football",
    "reasoning_text": "User watching Football Video. Cross-Domain trigger activated.",
    "input_scores": {
      "personal_score": 0.72,
      "global_score": 0.45,
      "combined_score": 0.65
    },
    "resulting_action": "INJECT_CONTENT"
  }
}
```

---

### container_state_change
Broadcast when container status changes.

```json
{
  "type": "container_state_change",
  "payload": {
    "content_id": "game-football",
    "old_state": "COLD",
    "new_state": "WARM",
    "deployment_name": "game-football",
    "timestamp": "2025-01-21T10:30:05Z"
  }
}
```

---

### score_update
Broadcast when scores are recalculated.

```json
{
  "type": "score_update",
  "payload": {
    "content_id": "game-football",
    "personal_score": 0.72,
    "global_score": 0.85,
    "combined_score": 0.78,
    "threshold_exceeded": true
  }
}
```

---

### mode_change
Broadcast when operational mode changes.

```json
{
  "type": "mode_change",
  "payload": {
    "old_mode": "MIXED_STREAM_BROWSING",
    "new_mode": "GAME_FOCUS_MODE",
    "reason": "User activated game-football",
    "timestamp": "2025-01-21T10:30:10Z"
  }
}
```

---

### stream_inject
Sent to stream client when content should be injected.

```json
{
  "type": "stream_inject",
  "payload": {
    "content": {
      "id": "game-football",
      "type": "GAME",
      "theme": "football",
      "title": "Football Game",
      "thumbnail_url": "/assets/football-game-thumb.png",
      "container_status": "WARM"
    },
    "insert_position": 5,
    "reason": "Cross-domain recommendation based on football video engagement"
  }
}
```

---

### resource_update
Broadcast when resource allocation changes.

```json
{
  "type": "resource_update",
  "payload": {
    "timestamp": "2025-01-21T10:30:15Z",
    "active_allocation": 70,
    "warm_allocation": 20,
    "background_allocation": 10,
    "mode": "GAME_FOCUS_MODE"
  }
}
```

---

### activation_ready
Sent in response to activation_request when content is ready.

```json
{
  "type": "activation_ready",
  "payload": {
    "content_id": "game-football",
    "endpoint_url": "http://game-football.gavigo.svc.cluster.local",
    "status": "HOT"
  }
}
```

---

### error
Sent when an error occurs.

```json
{
  "type": "error",
  "payload": {
    "code": "SCALING_FAILED",
    "message": "Failed to scale deployment: game-football",
    "details": "Kubernetes API timeout"
  }
}
```

| Error Code | Description |
|------------|-------------|
| SCALING_FAILED | K8s scaling operation failed |
| CONTENT_NOT_FOUND | Requested content doesn't exist |
| ALREADY_ACTIVE | Content already in HOT state |
| RATE_LIMITED | Too many requests |
