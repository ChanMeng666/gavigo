# Activation Spine Proof Signals — Manual Testing Guide

> Comprehensive manual test plan for verifying all Phase 1 requirements on the deployed dashboard.
>
> **Test URL**: https://ire.gavigo.com/
>
> **Last updated**: 2026-02-28

---

## Prerequisites

- Open https://ire.gavigo.com/ in Chrome (recommended) or any modern browser.
- Ensure the top-center of the page shows a **green dot** and **"Connected | \<session-id\>"**. If it shows red or "Disconnected", refresh the page.
- The dashboard layout: **phone mockup** on the left, **panels** on the right.
- The right-side panels (top to bottom): Activation Spine, Telemetry, Proof Signal Log, User Journey, Current Mode, AI Decision Log, Real-time Scores, Service Status, User Engagement, Game Workloads, Resource Allocation, Screen Distribution, Demo Controls.
- You may need to scroll the right panel area to reach different sections.

---

## Test 1: Dashboard Panel Existence

**Spec ref**: Section 13 — Dashboard Requirements

**What to verify**: All required UI panels exist and are visible.

### Steps

1. Load the page at https://ire.gavigo.com/.
2. Wait 3–5 seconds for the WebSocket connection to establish (green dot at top center).
3. Scroll through the right-side panel area and confirm the following panels exist:

| Panel | Expected Location | Purpose |
|-------|-------------------|---------|
| **Activation Spine** | Top of right panels | Ordered milestones with timestamps and durations |
| **Telemetry** | Below Activation Spine | Numeric metrics, trigger type, reasoning |
| **Proof Signal Log** | Below Telemetry | Raw proof signal events grouped by attempt |
| **AI Decision Log** | Middle-bottom area | AI decisions with trigger type badges |
| **Game Workloads** | Middle-left area | Container states (COLD/WARM/HOT badges) |
| **Demo Controls** | Bottom-right (collapsible) | Target content selector, Force WARM/COLD, Viral Score slider |

### Pass Criteria

- [ ] All 6 panels listed above are visible on the page.
- [ ] The "Connected" indicator is green.

---

## Test 2: Initial Warm on Page Load (INITIAL_WARM Trigger)

**Spec ref**: Section 8.1, 8.2, 8.3, 8.4 — Intent, decision, prewarm, warm ready

**What to verify**: Upon page load, the system automatically pre-warms the first content items and emits proof signals.

### Steps

1. **Reload the page** (Ctrl+Shift+R / Cmd+Shift+R for hard refresh).
2. Wait 5–10 seconds.
3. Scroll down to **Game Workloads** panel.

### What to Check

#### Game Workloads Panel
- [ ] At least 1–2 game workloads show **WARM** badge (orange) with a **"Prewarmed"** label next to them.
- [ ] At least 1 workload may show **HOT** badge (red) if the mobile feed scrolled to it.
- [ ] The summary row at the bottom shows counts like "HOT: 1 | WARM: 2 | COLD: 2".

#### Activation Spine Panel (scroll to top)
- [ ] At least 1 timeline entry appears (e.g., "Clicker Heroes").
- [ ] The timeline shows phase dots: **Intent** (gray) → connection line with duration → **Hot** (red) or similar progression.
- [ ] Below the timeline dots, there is an **inline metrics row** showing at least one of: "Decision: Xs", "Prewarm: Xs".
- [ ] The badge in the top-right corner shows "N active" (e.g., "2 active").

#### Proof Signal Log Panel
- [ ] The badge shows a non-zero event count (e.g., "N events").
- [ ] Events are grouped by content name (e.g., "Clicker Heroes", "AI Assistant").
- [ ] Each event row shows: **timestamp** (HH:MM:SS.mmm format), **event type badge** (colored), **trigger type** (with lightning icon), and optionally **state transition** and **source_event_type** (right-aligned, faded).
- [ ] The first event for each group is typically `Intent` with trigger `INITIAL_WARM`.

#### Telemetry Panel
- [ ] A content item is auto-selected in the dropdown (top-right of the panel).
- [ ] The panel shows:
  - **Cache Hit / Cache Miss** indicator (with checkmark or dash icon)
  - **Trigger type badge** (e.g., "INITIAL_WARM", "CROSS_DOMAIN")
  - **Reasoning text** in italics (e.g., "Initial page load - pre-warming content item 1")
  - **5 metric rows**: Decision Time, Prewarm Duration, Activation Latency, Intent → Ready, Restore Latency
  - At least **Prewarm Duration** should show a non-zero value (e.g., "1.8s").
  - Metrics that haven't occurred show "--".
- [ ] An **attempt ID** is shown at the bottom in small monospace text (e.g., "attempt: game-clicker-heroes-177...").

---

## Test 3: Engagement-Driven Prewarm Path (PROACTIVE_WARM / CROSS_DOMAIN)

**Spec ref**: Section 8.1–8.4, Section 10 — Path classification

**What to verify**: Interacting with the mobile feed generates engagement, triggers AI decisions, and produces prewarm proof signals.

### Steps

1. In the **phone mockup** on the left, scroll (swipe) through the feed to a game content card.
2. **Stay on the content** for 10–15 seconds. The feed sends `focus_event` every second to the backend.
3. Observe the right-side panels as events appear in real-time.

### What to Check

#### AI Decision Log
- [ ] New decisions appear at the top with timestamps.
- [ ] Trigger type badges show colors: green for "Cross Domain", cyan for "Mode Change", red for "Resource Throttle", etc.
- [ ] Each decision shows: trigger badge, reasoning text, content ID, and score percentages (P/G/C).

#### Activation Spine
- [ ] A new timeline entry appears or updates for the focused content.
- [ ] Phase progression is visible (e.g., Intent → Pre-Warm → Ready, or Intent → Hot).
- [ ] Duration labels appear between phase dots (e.g., "32.1s").

#### Proof Signal Log
- [ ] Event count increases as new proof signals arrive.
- [ ] The focused content's group appears at the top (most recent).
- [ ] You should see a sequence like:
  - `Intent` (gray badge) → `Decision` (blue badge) → ... → `Hot` (red badge)
- [ ] Each event shows its `trigger_type` (e.g., CROSS_DOMAIN, RESOURCE_THROTTLE).

#### Telemetry Panel
- [ ] Switch the content dropdown to the content you focused on.
- [ ] **Cache Hit** shows green checkmark if the content was already WARM before activation.
- [ ] **Cache Miss** shows gray dash if the content was COLD.
- [ ] **Trigger type** badge updates to reflect the latest decision.

### Pass Criteria

- [ ] Engagement on a content card produces visible AI decisions.
- [ ] Proof signals stream in real-time to the Proof Signal Log.
- [ ] Activation Spine shows the timeline for the content.

---

## Test 4: Cold Path Activation

**Spec ref**: Section 10 — `COLD_PATH` classification

**What to verify**: A container starting from COLD is classified as cold path with cache miss.

### Steps

1. Scroll down to **Demo Controls** panel (bottom-right). Click the header to expand it if collapsed.
2. In the **Target Content** dropdown, select a content item that is currently **COLD** (check Game Workloads to find one, e.g., "Grindcraft" or "Fray Fight").
   - If no content is COLD, select any content and click **"Force COLD"** to make it cold.
3. Note the current event count in the **Proof Signal Log**.
4. Now **click "Force WARM"** on that same content.

### What to Check

#### Game Workloads Panel
- [ ] The selected content transitions from **COLD** (blue badge) → **WARM** (orange badge).
- [ ] The "Warming..." label may briefly appear during transition, then changes to "Prewarmed".

#### Telemetry Panel
- [ ] Switch the dropdown to the selected content.
- [ ] **Cache Miss** indicator is shown (dash icon, because it was COLD).
- [ ] **Trigger type** badge shows **MANUAL**.
- [ ] **Reasoning** shows "Manual demo control: force warm".
- [ ] **Prewarm Duration** may show "--" or a value depending on timing.

#### Proof Signal Log
- [ ] A new group for the content appears at the top.
- [ ] Events include:
  - **Decision** badge with **MANUAL** trigger type
  - **Prewarm** badge with state transition **COLD→WARM**
- [ ] Each event has a valid server timestamp (HH:MM:SS.mmm).
- [ ] The **source_event_type** column (right side) shows "decision_made" or "container_state_chan...".

### Pass Criteria

- [ ] Content starting from COLD shows "Cache Miss" in Telemetry.
- [ ] Proof Signal Log shows MANUAL trigger with Decision and Prewarm events.
- [ ] Game Workloads updates from COLD → WARM in real-time.

---

## Test 5: MANUAL Trigger Type via Demo Controls

**Spec ref**: Section 9 — "for manual operations, set MANUAL when demo_control causes state changes"

**What to verify**: Demo control operations emit the MANUAL trigger type in decisions and proof signals.

### Steps

1. Expand **Demo Controls**.
2. Select **any content** from the Target Content dropdown.
3. Click **"Force COLD"** (wait 1 second for the state to update).
4. Click **"Force WARM"**.
5. Scroll up to check the panels.

### What to Check

#### AI Decision Log
- [ ] A new decision appears with trigger type **"Manual"** (gray badge labeled "Manual").

#### Telemetry Panel
- [ ] Select the content item. The trigger badge shows **MANUAL**.
- [ ] Reasoning shows **"Manual demo control: force warm"**.

#### Proof Signal Log
- [ ] A **Decision** event with **MANUAL** trigger type appears.
- [ ] A **Prewarm** event with **COLD→WARM** state transition appears.

### Additional: Trigger Trend Spike

1. Select a content item in Demo Controls.
2. Adjust the **Viral Score** slider to 90%+.
3. Click **"Trigger Trend Spike"**.
4. Check AI Decision Log for a new decision (this may use SWARM_BOOST trigger if viral score exceeds threshold).

### Pass Criteria

- [ ] Force WARM produces MANUAL trigger in all panels.
- [ ] Trigger Trend Spike produces a decision event.

---

## Test 6: All 9 Proof Signal Event Types

**Spec ref**: Section 7 — 9 normalized proof event types

**What to verify**: All 9 event types can appear in the Proof Signal Log.

### Expected Event Types

| # | Event Type | Badge Label | Badge Color | How to Trigger |
|---|-----------|-------------|-------------|----------------|
| 1 | `intent_detected` | Intent | Gray | Focus on content in the feed |
| 2 | `orchestration_decision_made` | Decision | Blue | Any AI decision fires |
| 3 | `prewarm_start` | Prewarm | Amber/Yellow | Content begins warming |
| 4 | `warm_ready` | Warm Ready | Green | Content reaches WARM state |
| 5 | `activation_request_received` | Activate | Orange | Tap/click content in feed |
| 6 | `hot_state_entered` | Hot | Red | Content reaches HOT state |
| 7 | `execution_ready` | Exec Ready | Emerald/Green | Content becomes interactive |
| 8 | `restore_start` | Restore | Cyan | Return to previously HOT content |
| 9 | `restore_complete` | Restored | Light Cyan | Restore finishes |

### Steps to Trigger All Types

**Events 1–7 (Normal activation flow):**

1. Reload the page (fresh state).
2. Scroll through the mobile feed slowly. Focus on a game content card for 10+ seconds.
3. As engagement builds, the system warms and activates the content.
4. Check Proof Signal Log — you should see events 1–4 (Intent, Decision, Prewarm, Warm Ready) appear.
5. When the content becomes HOT, you should see event 6 (Hot).
6. If event 5 (Activate) and 7 (Exec Ready) appear, they indicate the user explicitly tapped content and it became interactive.

**Events 8–9 (Restore flow):**

7. After a content item reaches HOT, scroll away to a different content item in the feed.
8. Wait a few seconds (the container may scale back to WARM).
9. Scroll **back** to the same content within 120 seconds.
10. Check Proof Signal Log for **Restore** (cyan) and **Restored** (light cyan) events.

### Verification via REST API (Supplementary)

If some events are hard to trigger via the UI alone, you can verify the backend generates all types:

```
Open in browser: https://ire.gavigo.com/api/v1/proof-signals
```

Search the JSON response for each `event_type` string to confirm the backend produces them.

### Pass Criteria

- [ ] At least events 1–4 and 6 (Intent, Decision, Prewarm, Warm Ready, Hot) appear in the Proof Signal Log during normal interaction.
- [ ] Events 5 and 7 (Activate, Exec Ready) appear when content is explicitly activated.
- [ ] Events 8–9 (Restore, Restored) appear when returning to previously HOT content.

---

## Test 7: Telemetry Panel — 5 Latency Metrics

**Spec ref**: Section 3, Section 12 — Core timing metrics and telemetry snapshot

**What to verify**: The Telemetry panel displays all 5 latency metrics.

### Steps

1. Interact with the feed for 30+ seconds to generate multiple activation attempts.
2. Scroll to the **Telemetry** panel.
3. Use the content dropdown (top-right of the panel) to switch between different content items.

### What to Check

For each content item:

| Metric | Label in UI | What It Measures | Expected |
|--------|-------------|------------------|----------|
| `orchestration_decision_time_ms` | Decision Time | intent → decision | Numeric value or "--" |
| `prewarm_duration_ms` | Prewarm Duration | prewarm start → warm ready | Non-zero value (e.g., "1.8s") |
| `activation_latency_ms` | Activation Latency | activation request → HOT | Numeric value or "--" |
| `execution_ready_latency_ms` | Intent → Ready | Full flow time | Numeric value or "--" |
| `restore_latency_ms` | Restore Latency | restore start → complete | Non-zero only for restore path |

### Additional Fields to Check

- [ ] **Cache Hit** (green checkmark) or **Cache Miss** (gray dash) indicator.
- [ ] **Trigger type badge** (e.g., INITIAL_WARM, CROSS_DOMAIN, MANUAL, PROACTIVE_WARM).
- [ ] **Reasoning text** (italicized line below the trigger badge).
- [ ] **Attempt ID** at the bottom in monospace font.

### Color Coding

- Green values: latency < 500ms (fast)
- Yellow/amber values: latency 500ms–2000ms (moderate)
- Red values: latency > 2000ms (slow)
- Gray "--": metric not yet measured for this attempt

### Pass Criteria

- [ ] At least **Prewarm Duration** shows a non-zero value for warmed content.
- [ ] **Decision Time** shows a value for content that went through the decision flow.
- [ ] All 5 metric rows are visible for every content item.
- [ ] Switching content via dropdown updates all displayed values.

---

## Test 8: Activation Path Classification

**Spec ref**: Section 10 — Cache and path classification

**What to verify**: The Telemetry panel correctly classifies activation paths.

### Test 8A: Cold Path

1. In Demo Controls, select a content item.
2. Click **"Force COLD"**.
3. Click **"Force WARM"**.
4. In Telemetry, select that content.
5. Verify: **Cache Miss** is shown (the content was COLD when activated).

### Test 8B: Prewarm Path

1. Let the system naturally warm a content item through engagement (scroll to a game, wait 10+ seconds).
2. Once the content reaches WARM (shown in Game Workloads), the next activation should show:
   - Telemetry: **Cache Hit** (green checkmark) — content was already WARM.

### Test 8C: Restore Path

1. Let a content item reach HOT.
2. Scroll away, wait a few seconds.
3. Scroll back to the same content within 120 seconds.
4. In Telemetry, check for:
   - **Restore Path** badge (if applicable)
   - **Restore Latency** with a non-zero value.

### Pass Criteria

- [ ] Cold activation shows "Cache Miss".
- [ ] Prewarm activation shows "Cache Hit".
- [ ] Activation paths are correctly classified based on prior state.

---

## Test 9: Activation Spine Inline Metrics

**Spec ref**: Section 13 — "show durations between milestones"

**What to verify**: The Activation Spine panel shows inline latency metrics below each timeline.

### Steps

1. Interact with the feed for 20+ seconds to generate activation data.
2. Scroll to the **Activation Spine** panel at the top.

### What to Check

- [ ] Each timeline entry (e.g., "Clicker Heroes") shows:
  - **Phase dots** connected by lines (Intent → Hot, or Pre-Warm → Ready, etc.)
  - **Duration labels** between dots (e.g., "32.1s").
  - **Resource weight labels** below each dot (e.g., "idle", "preview", "full").
- [ ] Below the phase timeline, an **inline metrics row** appears with a thin top border, showing:
  - "Decision: Xs" — orchestration decision time
  - "Prewarm: Xs" — prewarm duration
  - "Activation: Xs" — activation latency
  - "Restore: Xs" — only if restore occurred
  - "CACHE HIT" label in green — if cache hit
- [ ] If a restore occurred, the timeline entry has:
  - A **cyan ring** border around the card.
  - A **"RESTORED in Xs"** badge with a lightning icon.
- [ ] The **"N active"** badge in the top-right corner reflects the number of active timelines.

### Pass Criteria

- [ ] At least one timeline shows inline metrics (Decision/Prewarm values).
- [ ] Duration labels between phase dots are correct and non-zero.
- [ ] Resource weight labels (idle/preview/full) appear below each phase dot.

---

## Test 10: Proof Signal Log — Event Details

**Spec ref**: Section 7, 14 — Normalized events with source_event_type for debugging

**What to verify**: Each proof signal event contains all required fields.

### Steps

1. After generating events (Tests 2–5), scroll to the **Proof Signal Log** panel.

### What to Check for Each Event Row

| Field | Location | Format |
|-------|----------|--------|
| **Timestamp** | Left side | `HH:MM:SS.mmm` (server time) |
| **Event Type Badge** | After timestamp | Colored badge (Intent/Decision/Prewarm/etc.) |
| **Trigger Type** | After badge | Lightning icon + type name (e.g., "INITIAL_WARM") |
| **State Transition** | After trigger | "COLD→WARM" or "WARM→HOT" (only for state change events) |
| **Source Event Type** | Right-aligned | Faded text showing original event (e.g., "decision_made", "container_state_chan...") |

### Grouping

- [ ] Events are grouped by content name (bold header text).
- [ ] Each group shows an **attempt ID** in small monospace text (top-right of the group header, first 8 characters).
- [ ] Groups are sorted by most recent activity (newest first).
- [ ] Events within each group are sorted chronologically (oldest first).
- [ ] Maximum 8 groups are shown.

### Pass Criteria

- [ ] Every event has a valid server timestamp.
- [ ] Every event has a colored event type badge.
- [ ] Decision events show a trigger type.
- [ ] State-change events (Prewarm, Warm Ready, Hot) show state_from → state_to.
- [ ] The source_event_type is visible (hoverable for full text) for debugging traceability.

---

## Test 11: Prewarm/Cache Visual Indicator (Game Workloads)

**Spec ref**: Section 13 — "distinguish at least: cold, warming, prewarmed, hot"

**What to verify**: The Game Workloads panel shows 4 distinct visual states driven by real backend signals.

### Steps

1. Scroll to the **Game Workloads** panel.

### Visual States

| State | Badge | Additional Label | How to Produce |
|-------|-------|------------------|----------------|
| **COLD** | Blue "COLD" badge | None | Force COLD via Demo Controls |
| **Warming** | Orange "WARM" badge | "Warming..." text | Force WARM immediately after Force COLD |
| **Prewarmed** | Orange "WARM" badge | "Prewarmed" text | Wait a few seconds after warming completes |
| **HOT** | Red "HOT" badge | None | Content activated through engagement |

### Steps to Test All 4 States

1. **COLD**: In Demo Controls, select a content item, click "Force COLD". Verify blue COLD badge in Game Workloads.
2. **Warming**: Immediately click "Force WARM". Look quickly at Game Workloads — you may briefly see "Warming..." label.
3. **Prewarmed**: After 1–2 seconds, the label changes to "Prewarmed" next to the orange WARM badge.
4. **HOT**: Scroll in the feed to a game card and focus for 10+ seconds until it reaches HOT. Verify red HOT badge.

### Pass Criteria

- [ ] At least COLD, WARM (with "Prewarmed"), and HOT states are visually distinct.
- [ ] "Warming..." label appears briefly during state transition.
- [ ] Labels are driven by real telemetry data (not static).
- [ ] The summary count row (HOT: N | WARM: N | COLD: N) updates in real-time.

---

## Test 12: Server Timestamps (ts_server_ms)

**Spec ref**: Section 6 — "all proof measurements must use backend time"

**What to verify**: Timestamps come from the server, not the client clock.

### Steps

1. Open the REST API endpoint in a new browser tab:
   ```
   https://ire.gavigo.com/api/v1/proof-signals
   ```
2. Examine the JSON response.

### What to Check

- [ ] Every event object has a `ts_server_ms` field with a valid Unix timestamp in milliseconds (e.g., `1772194164680`).
- [ ] The `ts_server_ms` values are monotonically increasing within the same attempt.
- [ ] Timestamps are consistent across events (i.e., `warm_ready.ts_server_ms` > `prewarm_start.ts_server_ms` for the same content).

### Pass Criteria

- [ ] All events have `ts_server_ms` populated (non-zero).
- [ ] Latency calculations in the Telemetry panel are derived from server timestamps (confirmed by matching the displayed ms values with REST API data).

---

## Test 13: Feature Flag

**Spec ref**: Section 14 — "keep changes reversible via a feature flag: proof_signals_enabled"

### Verification

Open in browser:
```
https://ire.gavigo.com/api/v1/health
```

Or check the orchestrator configuration:
- The Go backend has `ProofSignalsEnabled` config field (default: `true`).
- When `false`, no proof signals would be emitted.
- This is an internal config — no UI toggle is exposed.

### Pass Criteria

- [ ] The health endpoint responds successfully (confirming the orchestrator is running with proof signals enabled).

---

## Test 14: Restore Behavior

**Spec ref**: Section 11 — Restore behavior with configurable window (120s)

**What to verify**: Returning to a previously HOT item within 120 seconds triggers restore path.

### Steps

1. Ensure a content item reaches **HOT** state (via natural engagement or Demo Controls).
2. Scroll away to a different content item in the mobile feed.
3. Wait 5–10 seconds (the container may cool down).
4. Scroll **back** to the same content item within 120 seconds.

### What to Check

#### Activation Spine
- [ ] The timeline entry shows **"RESTORED in Xs"** badge (cyan highlight with lightning icon).
- [ ] The timeline card has a **cyan ring border**.
- [ ] Phases show: **Restore Start → Restore Complete**.

#### Proof Signal Log
- [ ] **Restore** event (cyan badge) appears with `restore_start` type.
- [ ] **Restored** event (light cyan badge) appears with `restore_complete` type.

#### Telemetry Panel
- [ ] **Restore Latency** shows a non-zero value (should be very fast, < 1s).
- [ ] **Cache Hit** indicator may be shown.

### Pass Criteria

- [ ] Restore events appear in the Proof Signal Log.
- [ ] Restore latency is displayed in the Telemetry panel.
- [ ] The Activation Spine visually highlights restored items.

---

## Test 15: WebSocket Real-Time Delivery

**Spec ref**: General requirement — all events delivered in real-time

**What to verify**: All panels update in real-time without page reload.

### Steps

1. Keep the dashboard open and watch the panels.
2. Interact with the mobile feed (scroll, focus on content).
3. Use Demo Controls to trigger state changes.

### What to Check

- [ ] **AI Decision Log** counter increments as new decisions are made.
- [ ] **Proof Signal Log** event counter increments as new proof signals arrive.
- [ ] **Activation Spine** timelines update with new phases in real-time.
- [ ] **Game Workloads** badges update (COLD/WARM/HOT) without refresh.
- [ ] **Real-time Scores** percentages change as engagement builds.
- [ ] **Resource Allocation** chart updates.
- [ ] No JSON parsing errors in the browser console (F12 → Console tab).

### Pass Criteria

- [ ] All panels update in real-time during interaction.
- [ ] No WebSocket disconnections during normal usage (green dot stays green).
- [ ] Browser console shows no `SyntaxError: Unexpected non-whitespace character` errors.

---

## Test 16: REST API Verification (Supplementary)

**Spec ref**: Backend deliverables — proof signal normalization layer + telemetry snapshot

These endpoints can be opened directly in the browser to verify backend data.

### Proof Signals API

```
https://ire.gavigo.com/api/v1/proof-signals
```

**Check**: Returns a JSON array of ProofSignalEvent objects with fields:
- `event_id` (string, UUID)
- `content_id` (string)
- `attempt_id` (string)
- `event_type` (one of the 9 types)
- `ts_server_ms` (int64, Unix ms)
- `source_event_type` (string)
- `trigger_type` (string, optional)
- `state_from` (string, optional)
- `state_to` (string, optional)
- `metadata` (object, optional)

### Telemetry API

```
https://ire.gavigo.com/api/v1/telemetry
```

**Check**: Returns a JSON object keyed by content_id, each containing:
- `content_id`, `attempt_id`, `current_state`
- `activation_path_type`, `cache_hit_indicator`, `trigger_type`
- `last_reasoning_short`
- 9 timestamp fields (`intent_ts`, `decision_ts`, etc.)
- 5 metric fields (`orchestration_decision_time_ms`, `prewarm_duration_ms`, etc.)

### Container States API

```
https://ire.gavigo.com/api/v1/containers
```

**Check**: Returns container states matching what Game Workloads panel displays.

### Pass Criteria

- [ ] `/api/v1/proof-signals` returns events with all required fields.
- [ ] `/api/v1/telemetry` returns snapshots with 9 timestamps and 5 metrics.
- [ ] Data in REST APIs matches what the dashboard displays.

---

## Acceptance Criteria Checklist (Spec Section 16)

After completing all tests above, verify you can answer these questions from the UI for any activated content:

| # | Question | Where to Find the Answer |
|---|----------|--------------------------|
| 1 | What triggered the warm/activation decision? | Telemetry → trigger_type badge + reasoning text |
| 2 | How long intent → decision took? | Telemetry → "Decision Time" metric |
| 3 | How long prewarm took? | Telemetry → "Prewarm Duration" metric |
| 4 | How long click → hot took? | Telemetry → "Activation Latency" metric |
| 5 | How long click → execution ready took? | Telemetry → "Intent → Ready" metric |
| 6 | Was it cold, prewarmed, or restore? | Telemetry → Cache Hit/Miss + path context from Proof Signal Log |
| 7 | Was warm already present at activation? | Telemetry → "Cache Hit" (green checkmark) or "Cache Miss" (dash) |
| 8 | If re-entered, what was restore latency? | Telemetry → "Restore Latency" metric; Activation Spine → "RESTORED in Xs" |

### Final Pass Criteria

- [ ] All 8 questions above can be answered from the dashboard UI.
- [ ] All proof signal event types appear in the Proof Signal Log.
- [ ] Telemetry panel shows all 5 latency metrics for active content.
- [ ] Activation path correctly classified as cold, prewarm, or restore.
- [ ] Cache hit indicator shows correctly.
- [ ] Activation Spine shows inline metrics.
- [ ] Demo control "Force Warm" emits MANUAL trigger type.
- [ ] All events include source_event_type for debugging traceability.
- [ ] Real-time updates work via WebSocket without errors.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Panels show "No data" | Interact with the mobile feed (scroll, focus) for 10+ seconds |
| WebSocket disconnects | Refresh the page; check if the orchestrator pod is running |
| Proof Signal Log stays empty | Check browser console (F12) for errors; refresh page |
| Demo Controls not responding | Verify green "Connected" indicator at top; try refreshing |
| REST API returns empty | The orchestrator may have restarted; interact with the feed to generate new events |
| Timestamps look wrong | Timestamps are UTC server time; they may differ from your local clock |
