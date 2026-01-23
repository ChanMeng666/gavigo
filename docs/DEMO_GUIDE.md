# GAVIGO IRE Demo Guide

> A comprehensive guide to testing and understanding all features of the GAVIGO IRE prototype.

**Live Demo**: http://129.212.209.146

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Interface Overview](#interface-overview)
4. [Feature Demonstrations](#feature-demonstrations)
   - [TikTok-Style Content Stream](#1-tiktok-style-content-stream)
   - [Container State Visualization](#2-container-state-visualization)
   - [AI Decision Log](#3-ai-decision-log)
   - [Engagement Scoring](#4-engagement-scoring)
   - [Cross-Domain Recommendations](#5-cross-domain-recommendations)
   - [Proactive Warming](#6-proactive-warming)
   - [Trend Spike (Swarm Intelligence)](#7-trend-spike-swarm-intelligence)
   - [Mode Transitions](#8-mode-transitions)
   - [Game Activation](#9-game-activation)
   - [AI Chat Service](#10-ai-chat-service)
5. [Demo Controls Panel](#demo-controls-panel)
6. [Technical Architecture](#technical-architecture)
7. [Troubleshooting](#troubleshooting)

---

## Introduction

GAVIGO IRE (Instant Reality Exchange) demonstrates AI-driven container orchestration for mixed-media content delivery. The system intelligently manages computing resources by transitioning containers between COLD, WARM, and HOT states based on user engagement patterns and AI predictions.

### What This Demo Showcases

- **Intelligent Resource Management**: Containers scale up/down based on predicted user intent
- **Cross-Domain Content Discovery**: AI recommends related content across different media types
- **Real-Time Decision Making**: See AI decisions with full reasoning explanations
- **TikTok-Style UX**: Modern vertical scrolling interface with inline content activation

### Target Audience

- DevOps engineers interested in intelligent orchestration
- Product managers exploring AI-driven UX patterns
- Developers learning about WebSocket-based real-time systems

---

## Quick Start

### Access the Demo

1. Open your browser and navigate to: **http://129.212.209.146**
2. The page will automatically connect via WebSocket
3. Look for the green "Connected" indicator in the header

### First Things to Try

1. **Scroll through content** - Watch the container states change
2. **Focus on a video for 5+ seconds** - See cross-domain recommendations appear
3. **Open the Demo Controls** - Try triggering a trend spike
4. **Activate a game** - Watch the inline iframe load

---

## Interface Overview

The interface has three main views, accessible via the toggle in the header:

### Split View (Default)

```
┌────────────────────────────────────────────────────────────┐
│  Header: Connection Status | View Toggle                    │
├──────────────────────┬─────────────────────────────────────┤
│                      │                                      │
│   Content Stream     │         Dashboard                    │
│   (TikTok-style)     │   ┌──────────────────────────────┐  │
│                      │   │  Mode Indicator              │  │
│   ┌──────────────┐   │   ├──────────────────────────────┤  │
│   │              │   │   │  Demo Controls               │  │
│   │   Content    │   │   ├──────────────────────────────┤  │
│   │    Card      │   │   │  AI Decision Log             │  │
│   │              │   │   ├──────────────────────────────┤  │
│   └──────────────┘   │   │  Score Display               │  │
│                      │   ├──────────────────────────────┤  │
│   • • • (dots)       │   │  Resource Chart              │  │
│                      │   └──────────────────────────────┘  │
└──────────────────────┴─────────────────────────────────────┘
```

### Stream Only View

Full-width TikTok-style content stream for mobile or focused viewing.

### Dashboard Only View

Full-width dashboard for monitoring AI decisions and system state.

---

## Feature Demonstrations

### 1. TikTok-Style Content Stream

#### How to Test

1. Navigate to the content stream (left panel or stream-only view)
2. Scroll up/down through the content cards
3. Notice the snap scrolling behavior
4. Observe the pagination dots on the right side

#### What to Observe

- Content cards snap to full height
- Smooth scrolling with momentum
- Pagination dots indicate current position
- Swipe hint animation appears initially

#### Technical Principle

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant CSS
    participant JS

    User->>Browser: Scroll gesture
    Browser->>CSS: Apply scroll-snap
    CSS->>Browser: Snap to nearest card
    Browser->>JS: IntersectionObserver fires
    JS->>JS: Update visible content
    JS->>WebSocket: Send scroll_update event
```

**Key Technologies:**
- **CSS scroll-snap**: `scroll-snap-type: y mandatory` ensures cards snap to full height
- **IntersectionObserver**: Detects which content is visible with 200px root margin
- **Touch events**: Handles swipe gestures on mobile

---

### 2. Container State Visualization

#### How to Test

1. Look at the container status cards in the dashboard
2. Observe the colored badges: COLD (blue), WARM (yellow), HOT (red)
3. Scroll through content and watch states change

#### What to Observe

- COLD: Container not running (0 replicas)
- WARM: Standby instance ready (1 replica)
- HOT: Active with full resources (2+ replicas)
- Replica count shown next to each state

#### Technical Principle

```mermaid
stateDiagram-v2
    [*] --> COLD: Initial State

    COLD --> WARM: Score >= 0.6
    COLD --> WARM: Trend >= 0.7
    COLD --> WARM: Page Load (first 2)
    COLD --> WARM: Scroll Ahead

    WARM --> HOT: User Activation
    WARM --> HOT: Score >= 0.8
    WARM --> COLD: Inactivity Timeout

    HOT --> WARM: User Deactivates
    HOT --> COLD: Extended Inactivity
```

**State Mapping to Kubernetes:**
- COLD: `replicas: 0` - No pods running
- WARM: `replicas: 1` - Single pod in standby
- HOT: `replicas: 2` - Multiple pods for active service

---

### 3. AI Decision Log

#### How to Test

1. Open the dashboard view
2. Watch the AI Decision Log panel
3. Scroll through content or use demo controls
4. See new decisions appear with animations

#### What to Observe

- **Trigger Type**: What caused the decision (CROSS_DOMAIN, SWARM_BOOST, etc.)
- **Action**: What the AI did (INJECT_CONTENT, SCALE_WARM, etc.)
- **Reasoning**: Human-readable explanation
- **Scores**: Input scores that triggered the decision
- **Timestamp**: When the decision was made

#### Technical Principle

```mermaid
flowchart TD
    subgraph "7 Trigger Types"
        T1[CROSS_DOMAIN]
        T2[SWARM_BOOST]
        T3[PROACTIVE_WARM]
        T4[MODE_CHANGE]
        T5[RESOURCE_THROTTLE]
        T6[INITIAL_WARM]
        T7[LOOKAHEAD_WARM]
    end

    subgraph "Rules Engine"
        RE[Evaluate All Triggers]
        GD[Generate Decision]
    end

    subgraph "Output"
        LOG[Decision Log]
        ACT[Execute Action]
    end

    T1 --> RE
    T2 --> RE
    T3 --> RE
    T4 --> RE
    T5 --> RE
    T6 --> RE
    T7 --> RE
    RE --> GD
    GD --> LOG
    GD --> ACT
```

**Decision Structure:**
```json
{
  "decision_id": "1706123456789",
  "trigger_type": "PROACTIVE_WARM",
  "affected_content_id": "game-clicker-heroes",
  "reasoning_text": "User engagement score exceeded threshold...",
  "input_scores": {
    "personal_score": 0.45,
    "global_score": 0.20,
    "combined_score": 0.62
  },
  "resulting_action": "SCALE_WARM",
  "success": true
}
```

---

### 4. Engagement Scoring

#### How to Test

1. Open the Score Display panel in the dashboard
2. Focus on any content item for several seconds
3. Watch the score bars fill up
4. Notice when scores exceed the 0.6 threshold

#### What to Observe

- **Personal Score**: Your individual engagement (green bar)
- **Global Score**: Aggregate across all users (blue bar)
- **Combined Score**: Weighted combination (purple bar)
- **Threshold Line**: Shows 0.6 warming threshold

#### Technical Principle

```mermaid
flowchart LR
    subgraph "Input"
        FE[Focus Event<br/>duration_ms]
    end

    subgraph "Score Calculation"
        PS[Personal<br/>+0.1/sec]
        GS[Global<br/>+0.01/sec]
        TS[Trend<br/>0.0-1.0]
    end

    subgraph "Weights"
        W1[× 0.4]
        W2[× 0.4]
        W3[× 0.2]
    end

    subgraph "Output"
        CS[Combined Score]
        TH{>= 0.6?}
        WARM[WARM]
    end

    FE --> PS
    FE --> GS
    PS --> W1
    GS --> W2
    TS --> W3
    W1 --> CS
    W2 --> CS
    W3 --> CS
    CS --> TH
    TH -->|Yes| WARM
```

**Formula:**
```
Combined = (Personal × 0.4) + (Global × 0.4) + (Trend × 0.2)
```

**Score Decay:**
- All scores decay by 1% every 5 seconds
- Prevents stale engagement from triggering actions

---

### 5. Cross-Domain Recommendations

#### How to Test

1. Find a video content item (e.g., "Football Highlights")
2. Focus on it for **5+ seconds** (keep it visible in viewport)
3. Watch for a new content item to appear in the stream
4. Check the AI Decision Log for CROSS_DOMAIN trigger

#### What to Observe

- Related content is injected into the stream
- Decision log shows reasoning: "Cross-domain recommendation..."
- The recommended content is pre-warmed to WARM state

#### Technical Principle

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Orchestrator
    participant ContentStore

    User->>Frontend: Focus on video-football-1
    Note over Frontend: Duration > 5 seconds
    Frontend->>Orchestrator: focus_event (content_id, 5500ms, "football")
    Orchestrator->>ContentStore: Find related content by theme

    Note over ContentStore: Cross-Domain Relations:<br/>football → game-clicker-heroes<br/>scifi → game-mrmine<br/>tech → ai-service-tech

    ContentStore-->>Orchestrator: game-clicker-heroes
    Orchestrator->>Orchestrator: Generate CROSS_DOMAIN decision
    Orchestrator->>Orchestrator: Pre-warm container (COLD → WARM)
    Orchestrator->>Frontend: stream_inject event
    Frontend->>User: New game card appears
```

**Cross-Domain Mapping:**
| Video Theme | Recommended Content |
|-------------|-------------------|
| football | game-clicker-heroes |
| scifi | game-mrmine |
| tech | ai-service-tech |

---

### 6. Proactive Warming

#### How to Test

1. Find a COLD content item (blue badge)
2. Focus on it by keeping it visible
3. Watch the Score Display - wait for combined score to exceed 0.6
4. Observe the container transition from COLD to WARM

#### What to Observe

- Score bars gradually fill as you engage
- When combined score crosses 0.6, container warms
- AI Decision Log shows PROACTIVE_WARM trigger
- "Activate" button becomes available faster

#### Technical Principle

```mermaid
flowchart TD
    FE[Focus Event] --> SC[Score Update]
    SC --> CB{Combined >= 0.6?}
    CB -->|No| WAIT[Continue Tracking]
    CB -->|Yes| DEC[Generate Decision]
    DEC --> K8S[Scale Deployment]
    K8S --> WARM[Replicas: 0 → 1]
    WARM --> BC[Broadcast State Change]
    BC --> UI[Update UI Badge]
```

**Thresholds:**
- **0.6**: Trigger WARM state (1 replica)
- **0.8**: Trigger HOT state (2+ replicas)

---

### 7. Trend Spike (Swarm Intelligence)

#### How to Test

1. Open the Demo Controls panel (click to expand)
2. Find the "Viral Score" slider
3. Drag it to 0.7 or higher
4. Click "Apply Trend Spike"
5. Watch containers immediately warm

#### What to Observe

- Multiple containers may warm simultaneously
- AI Decision Log shows SWARM_BOOST trigger
- Reasoning mentions "viral trend detected"
- Fast response regardless of personal engagement

#### Technical Principle

```mermaid
sequenceDiagram
    participant Admin
    participant DemoControls
    participant Orchestrator
    participant RulesEngine
    participant K8s

    Admin->>DemoControls: Set viral_score = 0.85
    DemoControls->>Orchestrator: demo_control (trigger_trend_spike)
    Orchestrator->>RulesEngine: ProcessTrendSpike(0.85)

    Note over RulesEngine: viral_score >= 0.7<br/>triggers SWARM_BOOST

    RulesEngine->>K8s: Scale affected deployments
    K8s->>K8s: Replicas: 0 → 1
    RulesEngine->>Orchestrator: decision_made
    Orchestrator->>DemoControls: Broadcast to all clients
```

**Swarm Intelligence Logic:**
- Simulates viral content detection
- Threshold: `viral_score >= 0.7`
- Proactively warms containers before user demand
- Useful for live events, trending topics

---

### 8. Mode Transitions

#### How to Test

1. Find a game content item
2. Focus on it for **10+ seconds**
3. Watch the Mode Indicator change
4. Observe resource allocation chart

#### What to Observe

- Mode changes from MIXED_STREAM_BROWSING to GAME_FOCUS_MODE
- Resource allocation shifts (70% active, 20% warm, 10% background)
- AI Decision Log shows MODE_CHANGE trigger
- Other containers may be throttled

#### Technical Principle

```mermaid
flowchart TD
    subgraph "Trigger"
        FE[Focus Event > 10s]
        CT{Content Type?}
    end

    subgraph "Mode Detection"
        GM[GAME_FOCUS_MODE]
        AI[AI_SERVICE_MODE]
        MX[MIXED_STREAM_BROWSING]
    end

    subgraph "Resource Allocation"
        GA[70% Active<br/>20% Warm<br/>10% Background]
        AA[70% Active<br/>20% Warm<br/>10% Background]
        MA[0% Active<br/>40% Warm<br/>60% Background]
    end

    FE --> CT
    CT -->|GAME| GM
    CT -->|AI_SERVICE| AI
    CT -->|VIDEO/Other| MX
    GM --> GA
    AI --> AA
    MX --> MA
```

**Operational Modes:**
| Mode | Active | Warm | Background |
|------|--------|------|------------|
| MIXED_STREAM_BROWSING | 0% | 40% | 60% |
| GAME_FOCUS_MODE | 70% | 20% | 10% |
| AI_SERVICE_MODE | 70% | 20% | 10% |

---

### 9. Game Activation

#### How to Test

1. Find a game content item (e.g., "Clicker Heroes")
2. Wait for it to reach WARM state (or use demo controls)
3. Click the "Activate" button
4. Watch the game load inline

#### What to Observe

- Loading state with animated icon while waiting
- Game loads in an iframe within the content card
- No popup or modal - plays inline
- Container transitions to HOT state

#### Technical Principle

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Orchestrator
    participant External

    User->>Frontend: Click "Activate"
    Frontend->>Orchestrator: activation_request (game-clicker-heroes)
    Orchestrator->>Orchestrator: Update state to HOT
    Orchestrator->>Frontend: activation_ready (endpoint_url)
    Frontend->>External: Load iframe (Kongregate)
    External-->>Frontend: Game content
    Frontend->>User: Display inline game
```

**External Game Sources:**
| Game | Source |
|------|--------|
| Clicker Heroes | Kongregate |
| Mr.Mine | Kongregate |
| Poker Quest | External |
| Grindcraft | External |
| Fray Fight | External |

---

### 10. AI Chat Service

#### How to Test

1. Find the "AI Assistant" content item
2. Activate it
3. Type a message in the chat input
4. Wait for AI response

#### What to Observe

- Chat interface with message history
- "Thinking..." indicator while waiting
- AI response appears in chat
- Works with fallback if OpenAI not configured

#### Technical Principle

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AIService
    participant OpenAI

    User->>Frontend: Type message
    Frontend->>AIService: POST /api/chat
    AIService->>OpenAI: GPT-4o-mini request

    alt OpenAI Available
        OpenAI-->>AIService: AI response
    else Fallback Mode
        AIService->>AIService: Generate fallback response
    end

    AIService-->>Frontend: Response JSON
    Frontend->>User: Display message
```

**Fallback Responses:**
When OpenAI API is not configured, the service provides helpful preset responses about GAVIGO IRE's features.

---

## Demo Controls Panel

The Demo Controls panel allows you to manually trigger scenarios for testing.

### Available Controls

| Control | Function |
|---------|----------|
| **Viral Score Slider** | Set trend/viral score (0.0 - 1.0) |
| **Apply Trend Spike** | Trigger SWARM_BOOST with current viral score |
| **Force WARM** | Manually set a content's state to WARM |
| **Force COLD** | Manually set a content's state to COLD |
| **Reset Demo** | Clear all scores and reset to initial state |

### Recommended Test Sequence

1. **Reset Demo** - Start fresh
2. **Observe Initial Warm** - First 2 items should warm automatically
3. **Scroll** - Watch lookahead warming
4. **Focus on Video** - See cross-domain after 5s
5. **Apply Trend Spike (0.85)** - See swarm intelligence
6. **Focus on Game (10s)** - See mode change
7. **Activate Game** - See inline loading

---

## Technical Architecture

### System Overview

```mermaid
graph TB
    subgraph "Client"
        BR[Browser]
        WS[WebSocket]
        REST[REST API]
    end

    subgraph "Frontend"
        REACT[React 18]
        HOOKS[Custom Hooks]
        UI[shadcn/ui]
    end

    subgraph "Backend"
        ORCH[Orchestrator<br/>Go 1.21]
        HUB[WebSocket Hub]
        ENGINE[Rules Engine]
        SCORER[Scorer]
    end

    subgraph "Infrastructure"
        REDIS[(Redis/Valkey)]
        K8S[Kubernetes API]
    end

    subgraph "External"
        KONG[Kongregate]
        OAI[OpenAI]
    end

    BR --> REACT
    REACT --> WS
    REACT --> REST
    WS --> HUB
    REST --> ORCH
    HUB --> ORCH
    ORCH --> ENGINE
    ORCH --> SCORER
    ORCH --> REDIS
    ORCH --> K8S
    REACT --> KONG
    ORCH --> OAI
```

### Data Flow

```mermaid
flowchart LR
    subgraph "User Actions"
        SC[Scroll]
        FO[Focus]
        AC[Activate]
        DC[Demo Control]
    end

    subgraph "WebSocket Events"
        SU[scroll_update]
        FE[focus_event]
        AR[activation_request]
        DM[demo_control]
    end

    subgraph "Processing"
        SCR[Scorer]
        RE[Rules Engine]
    end

    subgraph "Outputs"
        DEC[decision_made]
        CSC[container_state_change]
        SUD[score_update]
        MC[mode_change]
        SI[stream_inject]
    end

    SC --> SU
    FO --> FE
    AC --> AR
    DC --> DM
    SU --> SCR
    FE --> SCR
    AR --> RE
    DM --> RE
    SCR --> RE
    RE --> DEC
    RE --> CSC
    RE --> SUD
    RE --> MC
    RE --> SI
```

---

## Troubleshooting

### WebSocket Not Connecting

**Symptoms:**
- "Disconnected" shown in header
- No AI decisions appearing
- Scores not updating

**Solutions:**
1. Check browser console for errors
2. Refresh the page
3. Check if backend is running: `kubectl -n gavigo get pods`

### Game Not Loading

**Symptoms:**
- Blank iframe after activation
- Loading spinner stuck

**Solutions:**
1. Some games block iframe embedding - try a different game
2. Check browser console for CORS/CSP errors
3. Try disabling ad blockers

### Scores Not Updating

**Symptoms:**
- Score bars not filling
- No decisions generated

**Solutions:**
1. Ensure WebSocket is connected
2. Try scrolling or clicking on content
3. Check if focus events are being sent (browser console)

### Slow Performance

**Symptoms:**
- UI lag
- Delayed responses

**Solutions:**
1. Close other browser tabs
2. Switch to "Stream Only" view
3. Check network latency to server

---

## Summary

GAVIGO IRE demonstrates several key concepts:

1. **Intelligent Orchestration**: AI makes real-time decisions about resource allocation
2. **Predictive Scaling**: Containers warm before users need them
3. **Cross-Domain Discovery**: Content recommendations across media types
4. **Real-Time Communication**: WebSocket-based instant updates
5. **Modern UX**: TikTok-style interface with inline activation

For technical details, see [README.md](../README.md) and [CLAUDE.md](../CLAUDE.md).
