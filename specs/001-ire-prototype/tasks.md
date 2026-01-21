# Tasks: GAVIGO IRE Visualization Prototype

**Input**: Design documents from `/specs/001-ire-prototype/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directory structure per plan.md (orchestrator/, frontend/, workloads/, k8s/)
- [ ] T002 [P] Initialize Go module in orchestrator/ with go.mod
- [ ] T003 [P] Initialize Vite+React project in frontend/ with package.json
- [ ] T004 [P] Create .gitignore with Go, Node, and K8s patterns
- [ ] T005 [P] Create Dockerfile for orchestrator/Dockerfile (multi-stage Go build)
- [ ] T006 [P] Create Dockerfile for frontend/Dockerfile (Vite build + nginx)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Kubernetes Infrastructure

- [ ] T007 Create k8s/namespace.yaml for gavigo namespace
- [ ] T008 [P] Create k8s/redis/deployment.yaml and service.yaml
- [ ] T009 [P] Create k8s/orchestrator/rbac.yaml with deployment/pod permissions
- [ ] T010 [P] Create k8s/orchestrator/configmap.yaml for configuration
- [ ] T011 Create k8s/orchestrator/deployment.yaml and service.yaml
- [ ] T012 [P] Create k8s/frontend/deployment.yaml, service.yaml, ingress.yaml

### Backend Core Infrastructure

- [ ] T013 Implement orchestrator/internal/config/config.go (env vars, Redis URL, K8s config)
- [ ] T014 [P] Implement orchestrator/internal/redis/client.go (Redis connection)
- [ ] T015 [P] Implement orchestrator/internal/k8s/client.go (K8s client initialization)
- [ ] T016 Implement orchestrator/internal/websocket/hub.go (WebSocket hub pattern)
- [ ] T017 Implement orchestrator/internal/websocket/client.go (client connection management)

### Data Models (Shared)

- [ ] T018 [P] Implement orchestrator/internal/models/content.go (ContentItem struct)
- [ ] T019 [P] Implement orchestrator/internal/models/session.go (UserSession struct)
- [ ] T020 [P] Implement orchestrator/internal/models/decision.go (AIDecision struct)
- [ ] T021 [P] Implement orchestrator/internal/models/events.go (WebSocket event types)

### Frontend Core Infrastructure

- [ ] T022 Install TailwindCSS and shadcn/ui in frontend/
- [ ] T023 [P] Create frontend/src/types/index.ts (TypeScript type definitions from data-model.md)
- [ ] T024 Implement frontend/src/hooks/useWebSocket.ts (WebSocket connection hook)
- [ ] T025 [P] Implement frontend/src/services/api.ts (REST API client)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - AI-Driven Container Orchestration Dashboard (Priority: P1)

**Goal**: Investors can view AI decisions, container states, and Demo Control Panel

**Independent Test**: Dashboard displays meaningful AI decisions with container status changes

### Implementation for User Story 1

- [ ] T026 [US1] Implement orchestrator/internal/redis/scores.go (TrendScore storage)
- [ ] T027 [US1] Implement orchestrator/internal/redis/pubsub.go (event broadcasting)
- [ ] T028 [US1] Implement orchestrator/internal/k8s/watcher.go (pod status watching)
- [ ] T029 [US1] Implement orchestrator/internal/websocket/handlers.go (message routing)
- [ ] T030 [US1] Implement orchestrator/cmd/orchestrator/main.go (HTTP server + WS endpoint)
- [ ] T031 [P] [US1] Create frontend/src/components/dashboard/Dashboard.tsx (main layout)
- [ ] T032 [P] [US1] Create frontend/src/components/dashboard/ContainerStatus.tsx (HOT/WARM/COLD)
- [ ] T033 [P] [US1] Create frontend/src/components/dashboard/AIDecisionLog.tsx (live log)
- [ ] T034 [P] [US1] Create frontend/src/components/dashboard/ScoreDisplay.tsx (scores panel)
- [ ] T035 [P] [US1] Create frontend/src/components/dashboard/ModeIndicator.tsx (current mode)
- [ ] T036 [US1] Create frontend/src/components/dashboard/DemoControlPanel.tsx (trend spike, reset)
- [ ] T037 [US1] Wire Dashboard to WebSocket in frontend/src/App.tsx
- [ ] T038 [US1] Implement REST endpoints in orchestrator for /api/v1/health, /containers, /decisions

**Checkpoint**: Dashboard shows real-time container status and AI decisions

---

## Phase 4: User Story 2 - Cross-Domain Content Recommendation (Priority: P1)

**Goal**: User engagement with themed videos triggers related game recommendations

**Independent Test**: Watching football videos causes Football Game to appear in stream

### Implementation for User Story 2

- [ ] T039 [US2] Implement orchestrator/internal/engine/rules.go (cross-domain rules)
- [ ] T040 [US2] Implement orchestrator/internal/engine/scorer.go (score calculation)
- [ ] T041 [US2] Integrate rule engine with WebSocket hub in orchestrator/
- [ ] T042 [P] [US2] Create frontend/src/components/stream/MediaStream.tsx (scrollable feed)
- [ ] T043 [P] [US2] Create frontend/src/components/stream/ContentCard.tsx (base card)
- [ ] T044 [P] [US2] Create frontend/src/components/stream/VideoCard.tsx (Type C content)
- [ ] T045 [P] [US2] Create frontend/src/components/stream/GamePlaceholder.tsx (Type A IIP)
- [ ] T046 [P] [US2] Create frontend/src/components/stream/AIServiceCard.tsx (Type B content)
- [ ] T047 [US2] Implement frontend/src/hooks/useEngagement.ts (focus time tracking)
- [ ] T048 [US2] Wire MediaStream to send focus_event via WebSocket
- [ ] T049 [US2] Implement stream_inject handler to dynamically add content

**Checkpoint**: Cross-domain injection works based on engagement time

---

## Phase 5: User Story 3 - Seamless Content Activation (Priority: P1)

**Goal**: Clicking pre-warmed IIP instantly shows full-screen view

**Independent Test**: Click Football Game IIP → immediate full-screen (no loading spinner)

### Implementation for User Story 3

- [ ] T050 [US3] Implement orchestrator/internal/k8s/scaler.go (deployment scaling)
- [ ] T051 [US3] Implement orchestrator/internal/engine/mode.go (mode state machine)
- [ ] T052 [US3] Add proactive scaling trigger in rule engine when score > threshold
- [ ] T053 [US3] Implement activation_request handler in WebSocket handlers
- [ ] T054 [P] [US3] Create frontend/src/components/common/FullScreenView.tsx
- [ ] T055 [US3] Add click handler on GamePlaceholder to send activation_request
- [ ] T056 [US3] Handle activation_ready event to show FullScreenView
- [ ] T057 [US3] Update ContainerStatus component to show HOT state on activation

**Checkpoint**: IIP click → instant full-screen with state change to HOT

---

## Phase 6: User Story 4 - Resource Management Visualization (Priority: P2)

**Goal**: Dashboard shows resource allocation shifting when mode changes

**Independent Test**: Activating game shifts resource chart from balanced to game-focused

### Implementation for User Story 4

- [ ] T058 [US4] Implement resource_update broadcasting in orchestrator
- [ ] T059 [US4] Calculate resource allocation based on mode in orchestrator
- [ ] T060 [P] [US4] Create frontend/src/components/dashboard/ResourceChart.tsx (bar chart)
- [ ] T061 [US4] Wire ResourceChart to resource_update WebSocket events

**Checkpoint**: Resource chart updates when mode changes

---

## Phase 7: User Story 5 - Demo Scenario Control (Priority: P2)

**Goal**: Presenter can trigger trend spikes and reset demo

**Independent Test**: Click "Trend Spike" → viral score increases → AI reacts

### Implementation for User Story 5

- [ ] T062 [US5] Implement /api/v1/demo/trend-spike endpoint in orchestrator
- [ ] T063 [US5] Implement /api/v1/demo/reset endpoint in orchestrator
- [ ] T064 [US5] Implement demo_control WebSocket handler
- [ ] T065 [US5] Add trend spike buttons to DemoControlPanel
- [ ] T066 [US5] Add reset demo button to DemoControlPanel
- [ ] T067 [US5] Implement reset logic (scale all to 0, clear scores, reset mode)

**Checkpoint**: Demo can be controlled and reset reliably

---

## Phase 8: Workload Containers

**Purpose**: Create simulated content containers for K8s scaling demonstration

- [ ] T068 [P] Create workloads/game-football/Dockerfile and index.html (static placeholder)
- [ ] T069 [P] Create workloads/game-scifi/Dockerfile and index.html
- [ ] T070 [P] Create workloads/video-server/Dockerfile and index.html
- [ ] T071 [P] Create workloads/background-stress/Dockerfile (stress-ng based)
- [ ] T072 [P] Create k8s/workloads/game-football.yaml (Deployment with replicas=0)
- [ ] T073 [P] Create k8s/workloads/game-scifi.yaml
- [ ] T074 [P] Create k8s/workloads/video-server.yaml
- [ ] T075 [P] Create k8s/workloads/background-stress.yaml
- [ ] T076 Create k8s/kustomization.yaml for all manifests

**Checkpoint**: All workload containers defined and deployable

---

## Phase 9: Polish & Integration

**Purpose**: Final integration and demo preparation

- [ ] T077 Create orchestrator entry point with graceful shutdown
- [ ] T078 Create frontend/src/App.tsx with side-by-side Stream + Dashboard layout
- [ ] T079 [P] Add static assets (placeholder images) to frontend/public/
- [ ] T080 Test full demo scenario per quickstart.md validation scenarios
- [ ] T081 [P] Create README.md with deployment instructions
- [ ] T082 Run quickstart.md validation scenarios 1-6

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Setup - BLOCKS all user stories
- **Phases 3-5 (P1 Stories)**: Depend on Phase 2 - can run in priority order
- **Phases 6-7 (P2 Stories)**: Depend on Phase 2 - can run after P1 or in parallel
- **Phase 8 (Workloads)**: Can run parallel to user stories after Phase 2
- **Phase 9 (Polish)**: Depends on all user stories complete

### User Story Dependencies

| Story | Depends On | Required For |
|-------|------------|--------------|
| US1 (Dashboard) | Foundation | All visualization |
| US2 (Cross-Domain) | Foundation, partial US1 | US3 (activation needs warm content) |
| US3 (Activation) | Foundation, US2 | Full demo flow |
| US4 (Resources) | US1, US3 | Resource visualization |
| US5 (Demo Control) | US1 | Demo reliability |

### Parallel Opportunities

**Phase 1 (Setup)**: T002-T006 all parallel
**Phase 2 (Foundation)**: T008-T012 (K8s), T018-T021 (models), T023-T025 (frontend)
**Phase 3 (US1)**: T031-T035 (dashboard components)
**Phase 4 (US2)**: T042-T046 (stream components)
**Phase 8 (Workloads)**: T068-T075 all parallel

---

## Summary

| Phase | Task Count | Parallel Tasks |
|-------|------------|----------------|
| Setup | 6 | 5 |
| Foundational | 19 | 12 |
| US1 (Dashboard) | 13 | 5 |
| US2 (Cross-Domain) | 11 | 5 |
| US3 (Activation) | 8 | 1 |
| US4 (Resources) | 4 | 1 |
| US5 (Demo Control) | 6 | 0 |
| Workloads | 9 | 8 |
| Polish | 6 | 2 |
| **Total** | **82** | **39** |

### MVP Scope (Recommended)

For minimum investor demo, complete:
- Phase 1: Setup
- Phase 2: Foundational
- Phase 3: US1 (Dashboard) - see AI decisions
- Phase 4: US2 (Cross-Domain) - see recommendation
- Phase 5: US3 (Activation) - see instant switch
- Phase 8: Workloads (minimum: game-football only)

This delivers core demo with ~60 tasks.
