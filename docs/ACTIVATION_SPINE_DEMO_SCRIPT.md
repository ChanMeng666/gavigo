# Activation Spine Proof Signals - Demo Script

This script walks through the three activation paths (Cold, Prewarm, Restore) and shows how to verify each from the dashboard UI.

**Prerequisites**: Open https://ire.gavigo.com/ in a browser. The dashboard should show the phone mockup on the left and panels on the right.

---

## 1. Cold Path Activation

**Goal**: Show a container going from COLD to HOT with no prior warming.

### Steps

1. **Reset demo state**
   - In the **Demo Controls** panel (bottom-right), click **Reset Demo**
   - All container states reset to COLD, scores reset to 0
   - The Activation Spine, Telemetry, and Proof Signal Log panels clear

2. **Force a container cold** (if needed)
   - In Demo Controls, select a content item (e.g., "Clicker Heroes")
   - Click **Force Cold** to ensure it starts from COLD state

3. **Scroll to the content in the phone mockup**
   - In the phone feed, scroll to the game content card
   - The feed sends `activation_request` immediately

4. **Observe the dashboard**
   - **Activation Spine**: A new timeline appears showing: `Intent → Activating → Hot`
   - **Telemetry Panel**: Select the content item to see:
     - Path: **Cold Path** badge
     - Cache Hit: **Cache Miss** (no prior warm state)
     - Activation Latency: time from activation request to HOT
   - **Proof Signal Log**: Events appear grouped by attempt_id:
     - `intent_detected` → `activation_request_received` → `hot_state_entered` → `execution_ready`
     - Each shows `ts_server_ms` timestamp and `source_event_type`
   - **Workload Status**: Container shows **HOT** state

---

## 2. Prewarm Path Activation

**Goal**: Show content being pre-warmed by engagement before explicit activation.

### Steps

1. **Reset demo state** via Demo Controls

2. **Generate engagement on a content item**
   - In the phone feed, scroll to a game card and stay on it
   - The feed sends `focus_event` every second
   - Watch the **Score Display** panel: combined score increases over time

3. **Wait for proactive warming**
   - When `combined_score >= 0.6`, the AI engine triggers `PROACTIVE_WARM`
   - **AI Decision Log**: A new decision appears with trigger `PROACTIVE_WARM`
   - **Activation Spine**: Timeline shows: `Intent → Pre-Warm → Ready`
   - **Workload Status**: Container transitions to **WARM** with "Warming..." label

4. **Activate the content**
   - Tap/click the content card to trigger activation
   - The container goes from WARM to HOT (faster than cold path)

5. **Verify in Telemetry**
   - Path: **Prewarm Path** badge
   - Cache Hit: **Cache Hit** (container was already warm)
   - Prewarm Duration: time spent in WARM state
   - Activation Latency: should be shorter than cold path
   - **Proof Signal Log** shows the full chain:
     - `intent_detected` → `orchestration_decision_made` → `prewarm_start` → `warm_ready` → `activation_request_received` → `hot_state_entered` → `execution_ready`

---

## 3. Restore Path Activation

**Goal**: Show a previously HOT container being quickly restored after the user scrolls away and returns.

### Steps

1. **First, activate content** (follow Cold or Prewarm path above)
   - Ensure a content item reaches HOT state

2. **Scroll away from the content**
   - Navigate to a different content item in the feed
   - The container scales back to WARM
   - **Activation Spine**: Shows `Deactivating → Cooling` phases

3. **Return within 120 seconds**
   - Scroll back to the same content item before the restore window expires
   - The system detects this as a restore operation

4. **Verify restore path**
   - **Activation Spine**: Timeline shows `RESTORED in Xs` badge with cyan highlight
     - Phases: `Restore Start → Restore Complete`
   - **Telemetry Panel**:
     - Path: **Restore Path** badge
     - Restore Latency: time to restore (should be very fast)
   - **Proof Signal Log**: Shows:
     - `restore_start` → `restore_complete`
   - **Inline metrics** on the Activation Spine timeline show restore latency

---

## 4. Manual Trigger (MANUAL type)

**Goal**: Verify that demo controls emit MANUAL trigger type in proof signals.

### Steps

1. In **Demo Controls**, select a content item
2. Click **Force Warm**
3. Check:
   - **AI Decision Log**: New decision with trigger type `MANUAL`
   - **Proof Signal Log**: Events show `trigger_type: MANUAL`
   - **Telemetry Panel**: Trigger badge shows `MANUAL`

---

## Acceptance Criteria Checklist

- [ ] All 9 proof signal event types appear in the Proof Signal Log
- [ ] TelemetryPanel shows all 5 latency metrics for active content
- [ ] Activation path correctly classified as COLD_PATH, PREWARM_PATH, or RESTORE_PATH
- [ ] Cache hit indicator shows correctly (miss for cold, hit for prewarm/restore)
- [ ] Activation Spine shows inline metrics (decision time, prewarm duration, etc.)
- [ ] Demo control "Force Warm" emits MANUAL trigger type
- [ ] Restore path completes within the configurable window (default 120s)
- [ ] All events include `source_event_type` for debugging traceability
