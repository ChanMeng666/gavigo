# GAVIGO IRE - Instant Reality Exchange

<div align="center">

![GAVIGO](https://img.shields.io/badge/GAVIGO-IRE-blue?style=for-the-badge)
![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![DigitalOcean](https://img.shields.io/badge/DigitalOcean-0080FF?style=for-the-badge&logo=digitalocean&logoColor=white)

**AI-Driven Container Orchestration Visualization Prototype**

[Live Demo](http://129.212.209.146) | [Demo Guide](./docs/DEMO_GUIDE.md) | [Architecture](#architecture)

</div>

---

## Overview

GAVIGO IRE (Instant Reality Exchange) is a visualization prototype demonstrating AI-driven container orchestration for mixed-media content delivery. The system features a **TikTok-style vertical scrolling interface** where containers transition between COLD, WARM, and HOT states based on user engagement patterns and AI-driven predictions.

### Key Highlights

- **TikTok-Style Content Stream**: Full-screen vertical scroll with snap points and inline content activation
- **External Game Integration**: Iframe-based games from Kongregate and other platforms
- **AI Chat Service**: OpenAI GPT-4o-mini powered chat interface
- **Real-Time AI Decisions**: 7 trigger types for intelligent resource management
- **Weighted Scoring System**: Personal, global, and trend scores combined for predictions

## Live Deployment

| Environment | URL | Status |
|-------------|-----|--------|
| Production | http://129.212.209.146  ⭐ https://gavigo.chanmeng.org/ | Running |

**Infrastructure**: DigitalOcean Kubernetes (DOKS) in Singapore (sgp1)

---

## Key Features

### AI-Driven Orchestration

- **Cross-Domain Recommendations**: Automatically suggests related content across different media types based on theme matching (e.g., football video -> idle game)
- **Swarm Intelligence**: Detects trending content (viral score >= 0.7) and proactively warms containers
- **Proactive Warming**: Predicts user intent and prepares containers before activation when engagement score exceeds 0.6

### TikTok-Style Content Stream

- **Vertical Scroll**: Full-height content cards with CSS scroll-snap
- **Inline Activation**: Content plays directly in the stream (no modal popups)
- **External Game iframes**: Load games from Kongregate and other platforms
- **AI Chat Interface**: Inline chat with OpenAI integration
- **Pagination Dots**: Visual navigation indicator

### Real-Time Dashboard

- Live AI decision log with reasoning explanations
- Container state visualization (COLD -> WARM -> HOT)
- Personal, global, and combined score tracking
- Resource allocation charts
- Operational mode indicators

### Interactive Demo Controls

- Viral score slider for testing swarm intelligence
- Force state buttons (WARM/COLD)
- Trend spike trigger
- Reset demo button

---

## Architecture

### System Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[React Frontend<br/>TypeScript + Vite]
        TT[TikTok-Style Stream]
        DASH[Dashboard]
    end

    subgraph "Backend Layer"
        ORCH[Orchestrator<br/>Go 1.21+]
        WS[WebSocket Hub]
        API[REST API]
        ENGINE[Rules Engine]
        SCORER[Scorer]
    end

    subgraph "Data Layer"
        REDIS[(Redis/Valkey<br/>State Store)]
    end

    subgraph "External Content"
        KG[Kongregate Games]
        OAI[OpenAI API]
    end

    subgraph "Infrastructure"
        K8S[Kubernetes API]
        LB[LoadBalancer]
    end

    FE --> TT
    FE --> DASH
    TT -->|WebSocket| WS
    DASH -->|HTTP| API
    WS --> ORCH
    API --> ORCH
    ORCH --> ENGINE
    ORCH --> SCORER
    ORCH --> REDIS
    ORCH --> K8S
    TT -->|iframe| KG
    TT -->|API| OAI
    LB --> FE
```

### AI Decision Pipeline

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant WebSocket
    participant Scorer
    participant RulesEngine
    participant Kubernetes

    User->>Frontend: View/Focus on content
    Frontend->>WebSocket: focus_event (content_id, duration_ms)
    WebSocket->>Scorer: UpdateScores()
    Note over Scorer: Personal: +0.1/sec<br/>Global: +0.01/sec
    Scorer->>RulesEngine: OnScoreUpdate callback
    RulesEngine->>RulesEngine: Evaluate 7 trigger types

    alt Combined Score > 0.6
        RulesEngine->>Kubernetes: ScaleDeployment(WARM)
        RulesEngine->>WebSocket: decision_made event
    end

    WebSocket->>Frontend: Broadcast to all clients
    Frontend->>User: Update UI
```

### Scoring Algorithm

```mermaid
flowchart TD
    subgraph "Input Events"
        FE[Focus Event<br/>duration_ms]
        TS[Trend Spike<br/>viral_score]
    end

    subgraph "Score Calculation"
        PS[Personal Score<br/>+0.1 per second]
        GS[Global Score<br/>+0.01 per second]
        VS[Viral Score<br/>0.0 - 1.0]
    end

    subgraph "Weighted Combination"
        W1[Personal x 0.4]
        W2[Global x 0.4]
        W3[Trend x 0.2]
        CS[Combined Score]
    end

    subgraph "Actions"
        TH{Score >= 0.6?}
        WARM[Scale to WARM]
        HOT[Scale to HOT]
    end

    FE --> PS
    FE --> GS
    TS --> VS
    PS --> W1
    GS --> W2
    VS --> W3
    W1 --> CS
    W2 --> CS
    W3 --> CS
    CS --> TH
    TH -->|Yes, < 0.8| WARM
    TH -->|Yes, >= 0.8| HOT
```

### Container State Machine

```mermaid
stateDiagram-v2
    [*] --> COLD: Initial
    COLD --> WARM: Score > 0.6 OR Trend >= 0.7
    COLD --> HOT: Direct activation
    WARM --> HOT: User activation OR Score > 0.8
    WARM --> COLD: Timeout (no activity)
    HOT --> WARM: User leaves
    HOT --> COLD: Extended inactivity

    note right of COLD
        Replicas: 0
        Resources: None
    end note

    note right of WARM
        Replicas: 1
        Resources: Minimal
    end note

    note right of HOT
        Replicas: 2+
        Resources: Full
    end note
```

### AI Trigger Types

```mermaid
graph LR
    subgraph "7 Trigger Types"
        T1[CROSS_DOMAIN<br/>5s focus -> inject related]
        T2[SWARM_BOOST<br/>viral >= 0.7 -> warm]
        T3[PROACTIVE_WARM<br/>score >= 0.6 -> warm]
        T4[MODE_CHANGE<br/>10s focus -> change mode]
        T5[RESOURCE_THROTTLE<br/>mode-based allocation]
        T6[INITIAL_WARM<br/>page load -> warm first 2]
        T7[LOOKAHEAD_WARM<br/>scroll -> warm next 2]
    end

    subgraph "Actions"
        A1[INJECT_CONTENT]
        A2[SCALE_WARM]
        A3[SCALE_HOT]
        A4[CHANGE_MODE]
        A5[THROTTLE_BACKGROUND]
    end

    T1 --> A1
    T1 --> A2
    T2 --> A2
    T3 --> A2
    T4 --> A4
    T5 --> A5
    T6 --> A2
    T7 --> A2
```

### Cross-Domain Content Injection

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant RulesEngine
    participant ContentStore

    User->>Frontend: Focus on video (football theme)
    Note over Frontend: Duration > 5 seconds
    Frontend->>RulesEngine: focus_event
    RulesEngine->>ContentStore: Find related content
    Note over ContentStore: Match: football -> game-clicker-heroes
    ContentStore-->>RulesEngine: Related game found
    RulesEngine->>RulesEngine: Generate CROSS_DOMAIN decision
    RulesEngine->>Frontend: stream_inject event
    Frontend->>User: Game card appears in stream
```

### Deployment Architecture (DigitalOcean)

```mermaid
graph TB
    subgraph "DigitalOcean Cloud - Singapore (sgp1)"
        subgraph "DOKS Cluster (gavigo-cluster)"
            subgraph "gavigo namespace"
                FE_POD[Frontend Pod<br/>nginx:alpine]
                ORCH_POD[Orchestrator Pod<br/>Go binary]
            end

            FE_SVC[Frontend Service<br/>LoadBalancer :80]
            ORCH_SVC[Orchestrator Service<br/>ClusterIP :8080]
        end

        REDIS_DB[(Managed Redis<br/>Valkey + TLS)]
        REGISTRY[Container Registry<br/>gavigo-registry]
    end

    subgraph "External Services"
        KONG[Kongregate<br/>Game iframes]
        OPENAI[OpenAI API<br/>GPT-4o-mini]
    end

    INTERNET((Internet)) --> FE_SVC
    FE_SVC --> FE_POD
    FE_POD --> ORCH_SVC
    ORCH_SVC --> ORCH_POD
    ORCH_POD --> REDIS_DB
    FE_POD -.->|iframe| KONG
    ORCH_POD -.->|API| OPENAI
    REGISTRY -.->|Pull images| FE_POD
    REGISTRY -.->|Pull images| ORCH_POD
```

---

## Content Items

The demo includes 11 content items across 3 types:

### Videos (5 items)

| ID | Theme | Title | Description |
|----|-------|-------|-------------|
| video-football-1 | football | Football Highlights | Amazing football moments |
| video-football-2 | football | Top Goals 2024 | Best goals of the season |
| video-football-3 | football | Championship Finals | The ultimate showdown |
| video-scifi-1 | scifi | Space Documentary | Exploring the cosmos |
| video-scifi-2 | scifi | Deep Space Journey | Venturing into the unknown |

### Games - External iframes (5 items)

| ID | Theme | Title | Source |
|----|-------|-------|--------|
| game-clicker-heroes | idle | Clicker Heroes | Kongregate (150M+ plays) |
| game-mrmine | mining | Mr.Mine | Kongregate (20M+ plays) |
| game-poker-quest | cards | Poker Quest | Roguelike poker |
| game-grindcraft | craft | Grindcraft | Minecraft-style idle (10M+ plays) |
| game-fray-fight | fighting | Fray Fight | Action fighting |

### AI Service (1 item)

| ID | Theme | Title | Backend |
|----|-------|-------|---------|
| ai-service-tech | tech | AI Assistant | OpenAI GPT-4o-mini |

### Cross-Domain Relations

When users engage with content for 5+ seconds, the system recommends related content:

| Video Theme | Recommended Game |
|-------------|-----------------|
| football | game-clicker-heroes |
| scifi | game-mrmine |
| tech | ai-service-tech |

---

## Container States

| State | Replicas | Description | Resource Usage |
|-------|----------|-------------|----------------|
| **COLD** | 0 | No running instances | None |
| **WARM** | 1 | Standby instance ready | Minimal |
| **HOT** | 2+ | Active with full resources | Full |

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Go | 1.21+ | Orchestrator service |
| gorilla/websocket | 1.5+ | Real-time communication |
| client-go | Latest | Kubernetes API |
| go-redis | v9 | State management |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5 | Build tool |
| Tailwind CSS | Latest | Styling |
| shadcn/ui | Latest | UI components |
| Recharts | Latest | Data visualization |

### Infrastructure
| Technology | Provider | Purpose |
|------------|----------|---------|
| Kubernetes | DigitalOcean DOKS | Container orchestration |
| Redis | DigitalOcean Managed (Valkey) | State store + TLS |
| Container Registry | DigitalOcean | Image storage |
| LoadBalancer | DigitalOcean | External access |

---

## Project Structure

```
gavigo/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── AIDecisionLog.tsx
│   │   │   │   ├── ScoreDisplay.tsx
│   │   │   │   ├── ResourceChart.tsx
│   │   │   │   ├── DemoControls.tsx
│   │   │   │   └── ModeIndicator.tsx
│   │   │   ├── stream/      # TikTok-style stream
│   │   │   │   ├── MediaStream.tsx
│   │   │   │   └── TikTokContentView.tsx
│   │   │   ├── layout/      # Layout components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useWebSocket.ts
│   │   │   └── useEngagement.ts
│   │   ├── services/        # API client
│   │   └── types/           # TypeScript definitions
│   ├── Dockerfile           # Multi-stage build (node -> nginx)
│   └── nginx.conf           # Frontend routing config
│
├── orchestrator/            # Go backend service
│   ├── cmd/orchestrator/    # Application entry point
│   └── internal/
│       ├── api/             # HTTP handlers
│       ├── config/          # Configuration management
│       ├── engine/          # Rules engine & scorer
│       │   ├── rules.go     # 7 trigger types
│       │   └── scorer.go    # Weighted scoring
│       ├── k8s/             # Kubernetes client
│       ├── models/          # Data models
│       ├── redis/           # Redis client (TLS support)
│       └── websocket/       # WebSocket hub
│
├── workloads/               # Workload containers
│   └── ai-service/          # AI chat service (OpenAI)
│
├── k8s/                     # Kubernetes manifests
│   ├── namespace.yaml       # gavigo namespace
│   ├── frontend/            # Frontend deployment + service
│   ├── orchestrator/        # Orchestrator deployment + RBAC
│   └── workloads/           # Workload deployments
│
├── docs/                    # Documentation
│   └── DEMO_GUIDE.md        # Demo walkthrough
│
├── specs/                   # Specification documents
│   └── 001-ire-prototype/   # IRE prototype specification
│
├── CLAUDE.md                # Claude Code instructions
├── DEPLOYMENT_STATUS.md     # Current deployment status
├── docker-compose.yml       # Local development setup
└── Makefile                 # Build automation
```

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)
- Go 1.21+ (for development)
- kubectl (for Kubernetes deployment)
- doctl (for DigitalOcean deployment)

### Local Development with Docker Compose

```bash
# Clone the repository
git clone https://github.com/ChanMeng666/gavigo.git
cd gavigo

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:8080
```

### Development Mode

```bash
# Terminal 1: Start backend
cd orchestrator
go run cmd/orchestrator/main.go

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev
```

### Kubernetes Deployment (DigitalOcean)

```bash
# Configure kubectl
doctl kubernetes cluster kubeconfig save gavigo-cluster

# Deploy all components
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/orchestrator/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/workloads/

# Check status
kubectl -n gavigo get pods,svc,deployments

# Get frontend external IP
kubectl -n gavigo get svc frontend
```

---

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/content` | List all content items |
| GET | `/api/v1/containers` | Get container states |
| GET | `/api/v1/decisions` | Get AI decision history |
| GET | `/api/v1/scores` | Get content scores |
| GET | `/api/v1/mode` | Get current operational mode |
| GET | `/api/v1/resources` | Get resource allocation |
| POST | `/api/v1/demo/reset` | Reset demo state |
| POST | `/api/v1/demo/trend-spike` | Trigger trend spike |

### WebSocket Events

```mermaid
sequenceDiagram
    participant Client
    participant Server

    Note over Client,Server: Client -> Server Events
    Client->>Server: scroll_update (position, velocity, visible_content)
    Client->>Server: focus_event (content_id, duration_ms, theme)
    Client->>Server: activation_request (content_id)
    Client->>Server: deactivation (content_id)
    Client->>Server: demo_control (action, target, value)

    Note over Client,Server: Server -> Client Events
    Server->>Client: connection_established (session_id, content, mode)
    Server->>Client: decision_made (trigger, action, reasoning)
    Server->>Client: container_state_change (content_id, old, new)
    Server->>Client: score_update (content_id, scores)
    Server->>Client: mode_change (old_mode, new_mode, reason)
    Server->>Client: stream_inject (content, position, reason)
    Server->>Client: resource_update (allocation)
    Server->>Client: activation_ready (content_id, endpoint_url)
```

---

## Demo Scenarios

| Scenario | Trigger | Expected Behavior |
|----------|---------|-------------------|
| Cross-Domain Recommendation | Watch football video for 5s+ | System injects game-clicker-heroes |
| Trend Spike | Click "Trend Spike" button | Swarm intelligence warms containers |
| Proactive Warming | Extended engagement (score > 0.6) | Container transitions COLD -> WARM |
| Mode Transition | Focus on game for 10s+ | System enters GAME_FOCUS_MODE |
| Lookahead Warming | Scroll through content | Next 2 items pre-warmed |

---

## Configuration

### Environment Variables (Orchestrator)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8080 | Server port |
| `REDIS_URL` | redis://redis:6379 | Redis connection URL |
| `LOG_LEVEL` | info | Log level (debug/info/warn/error) |
| `ENGAGEMENT_THRESHOLD_MS` | 10000 | Engagement threshold in ms |
| `RECOMMENDATION_THRESHOLD` | 0.6 | Score threshold for warming |
| `PERSONAL_SCORE_WEIGHT` | 0.4 | Personal score weight |
| `GLOBAL_SCORE_WEIGHT` | 0.4 | Global score weight |

---

## Deployment Information

### DigitalOcean Resources

| Resource | Name | Specification |
|----------|------|---------------|
| K8s Cluster | gavigo-cluster | 2 nodes, s-2vcpu-4gb |
| Redis | gavigo-redis | Valkey, TLS enabled |
| Registry | gavigo-registry | Basic tier (5 repos) |
| Region | sgp1 | Singapore |

### Container Images

| Image | Registry Path |
|-------|---------------|
| Orchestrator | registry.digitalocean.com/gavigo-registry/orchestrator:latest |
| Frontend | registry.digitalocean.com/gavigo-registry/frontend:latest |
| ai-service | registry.digitalocean.com/gavigo-registry/ai-service:latest |

### Monthly Cost Estimate

| Service | Cost |
|---------|------|
| Kubernetes (2 nodes) | ~$24/month |
| Managed Redis (Valkey) | ~$15/month |
| Container Registry (Basic) | ~$5/month |
| Load Balancer (auto-created) | ~$12/month |
| **Total** | **~$56/month** |

---

## Troubleshooting

### Check Pod Status
```bash
kubectl -n gavigo get pods
kubectl -n gavigo describe pod <pod-name>
```

### View Logs
```bash
kubectl -n gavigo logs -l app=orchestrator
kubectl -n gavigo logs -l app=frontend
```

### Restart Deployment
```bash
kubectl -n gavigo rollout restart deployment/orchestrator
kubectl -n gavigo rollout restart deployment/frontend
```

### Check Redis Connection
```bash
kubectl -n gavigo exec -it deployment/orchestrator -- sh
# Inside container:
# Check REDIS_URL environment variable
```

---

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guidelines for Claude Code
- [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) - Current deployment status
- [docs/DEMO_GUIDE.md](./docs/DEMO_GUIDE.md) - Demo walkthrough and technical explanations
- [specs/001-ire-prototype/](./specs/001-ire-prototype/) - Feature specification

---

## License

This project is proprietary software. All rights reserved.

## Contributing

This is a private prototype. Please contact the repository owner for contribution guidelines.
