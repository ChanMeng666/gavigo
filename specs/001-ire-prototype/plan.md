# Implementation Plan: GAVIGO IRE Visualization Prototype

**Branch**: `001-ire-prototype` | **Date**: 2025-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ire-prototype/spec.md`

## Summary

Build an investor demonstration prototype showcasing GAVIGO's "Instant Reality Exchange" concept. The prototype displays a Mixed-Media Stream (frontend) alongside an Orchestration Dashboard, with a Go-based AI Orchestrator managing Kubernetes workloads in real-time. The system demonstrates cross-domain content recommendations, proactive container warming, and intelligent resource management—all visible to investors through a comprehensive dashboard.

## Technical Context

**Language/Version**: Go 1.21+ (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**:
- Backend: client-go (K8s), gorilla/websocket, go-redis/redis
- Frontend: React 18, Vite 5, TailwindCSS, shadcn/ui, recharts
**Storage**: Redis 7.x (in-cluster, for state and pub/sub)
**Testing**: go test (backend), Vitest (frontend)
**Target Platform**: DigitalOcean Kubernetes (DOKS), Linux containers
**Project Type**: Web application (frontend + backend in K8s)
**Performance Goals**: <200ms AI decision to dashboard, <500ms IIP activation
**Constraints**: Minimal resource usage for cost efficiency, WebSocket-first architecture
**Scale/Scope**: Single demo user, 6-8 content items, 3-5 background workloads

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Investor Demonstration First
- [x] All AI decisions logged with human-readable explanations
- [x] Container states (COLD/WARM/HOT) visually represented
- [x] Cross-domain triggers clearly articulated in logs
- [x] Dashboard is primary visualization artifact

### Principle II: Real-Time Responsiveness
- [x] WebSocket-first architecture planned
- [x] Push-based updates, no polling
- [x] Target latencies defined (<200ms AI decisions, <500ms activation)

### Principle III: Kubernetes-Native Design
- [x] Using native K8s Deployments
- [x] client-go for scaling operations
- [x] Real K8s pods for all workloads
- [x] Resource quotas for throttling demo

### Principle IV: Prototype Simplicity
- [x] No authentication
- [x] Standard UI libraries (TailwindCSS, shadcn/ui)
- [x] Rule-based AI only
- [x] Placeholder content acceptable
- [x] ≤3 main services (orchestrator, frontend, redis)

### Principle V: Technology Stack Standards
- [x] Go backend with client-go
- [x] Vite + React frontend
- [x] DigitalOcean Kubernetes
- [x] Redis for state

**Gate Status**: PASSED

## Project Structure

### Documentation (this feature)

```text
specs/001-ire-prototype/
├── plan.md              # This file
├── research.md          # Technology decisions
├── data-model.md        # Entity definitions
├── quickstart.md        # Validation scenarios
├── contracts/           # API specifications
│   ├── websocket-events.md
│   └── rest-api.yaml
└── tasks.md             # Task breakdown (via /speckit.tasks)
```

### Source Code (repository root)

```text
orchestrator/                    # Go backend service
├── cmd/
│   └── orchestrator/
│       └── main.go              # Entry point
├── internal/
│   ├── config/
│   │   └── config.go            # Configuration
│   ├── engine/
│   │   ├── rules.go             # Rule-based AI logic
│   │   ├── scorer.go            # Score calculation
│   │   └── mode.go              # Operational mode management
│   ├── k8s/
│   │   ├── client.go            # K8s client wrapper
│   │   ├── scaler.go            # Deployment scaling
│   │   └── watcher.go           # Pod status watcher
│   ├── redis/
│   │   ├── client.go            # Redis connection
│   │   ├── scores.go            # Score storage
│   │   └── pubsub.go            # Pub/sub for events
│   ├── websocket/
│   │   ├── hub.go               # WebSocket hub
│   │   ├── client.go            # Client connection
│   │   └── handlers.go          # Message handlers
│   └── models/
│       ├── content.go           # ContentItem
│       ├── session.go           # UserSession
│       ├── decision.go          # AIDecision
│       └── events.go            # WebSocket events
├── Dockerfile
├── go.mod
└── go.sum

frontend/                        # React frontend
├── src/
│   ├── components/
│   │   ├── stream/
│   │   │   ├── MediaStream.tsx      # Main stream container
│   │   │   ├── ContentCard.tsx      # Individual content item
│   │   │   ├── GamePlaceholder.tsx  # Type A content
│   │   │   ├── AIServiceCard.tsx    # Type B content
│   │   │   └── VideoCard.tsx        # Type C content
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx        # Main dashboard
│   │   │   ├── ContainerStatus.tsx  # HOT/WARM/COLD display
│   │   │   ├── AIDecisionLog.tsx    # Live decision log
│   │   │   ├── ScoreDisplay.tsx     # Recommendation scores
│   │   │   ├── ResourceChart.tsx    # Resource allocation
│   │   │   ├── ModeIndicator.tsx    # Current mode display
│   │   │   └── DemoControlPanel.tsx # Manual controls
│   │   └── common/
│   │       ├── FullScreenView.tsx   # Activated content view
│   │       └── StatusBadge.tsx      # Status indicators
│   ├── hooks/
│   │   ├── useWebSocket.ts          # WebSocket connection
│   │   └── useEngagement.ts         # Engagement tracking
│   ├── services/
│   │   └── api.ts                   # REST API client
│   ├── types/
│   │   └── index.ts                 # TypeScript definitions
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── package.json
└── Dockerfile

workloads/                       # Simulated content containers
├── game-football/
│   ├── Dockerfile
│   └── index.html               # Static placeholder
├── game-scifi/
│   ├── Dockerfile
│   └── index.html
├── video-server/
│   ├── Dockerfile
│   └── index.html
└── background-stress/
    └── Dockerfile               # stress-ng based

k8s/                             # Kubernetes manifests
├── namespace.yaml
├── redis/
│   ├── deployment.yaml
│   └── service.yaml
├── orchestrator/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── rbac.yaml                # For K8s API access
│   └── configmap.yaml
├── frontend/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── workloads/
│   ├── game-football.yaml
│   ├── game-scifi.yaml
│   ├── video-server.yaml
│   └── background-stress.yaml
└── kustomization.yaml
```

**Structure Decision**: Web application structure with Go backend (orchestrator/) and React frontend (frontend/). Additional workloads/ directory for simulated content containers. All K8s manifests in k8s/ directory for easy deployment.

## Complexity Tracking

> No violations - staying within 3 main projects (orchestrator, frontend, redis).

| Component | Count | Justification |
|-----------|-------|---------------|
| Main Services | 3 | orchestrator, frontend, redis (within limit) |
| Workload Containers | 4 | Minimum needed to demonstrate variety |
| K8s Manifests | 12 | Standard deployment artifacts |

## Implementation Phases

### Phase 1: Infrastructure Setup
1. Set up DigitalOcean Kubernetes cluster
2. Deploy Redis
3. Create namespace and RBAC
4. Verify cluster connectivity

### Phase 2: Backend Core
1. Implement WebSocket hub
2. Implement K8s client and scaler
3. Implement Redis state management
4. Implement rule engine (basic version)

### Phase 3: Frontend Core
1. Set up Vite + React project
2. Implement MediaStream component
3. Implement Dashboard layout
4. Implement WebSocket connection

### Phase 4: Integration
1. Connect frontend to orchestrator
2. Implement engagement tracking
3. Implement cross-domain injection
4. Implement container status display

### Phase 5: Workload Simulation
1. Create placeholder content containers
2. Create background stress containers
3. Deploy workloads to K8s
4. Implement proactive scaling

### Phase 6: Demo Polish
1. Implement Demo Control Panel
2. Add resource visualization
3. Test full demo scenario
4. Document demo procedure
