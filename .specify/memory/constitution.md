<!--
Sync Impact Report:
- Version change: 0.0.0 → 1.0.0
- Initial constitution creation for GAVIGO IRE Prototype
- All principles newly defined
- Templates: Pending review after initial setup
-->

# GAVIGO IRE Prototype Constitution

## Core Principles

### I. Investor Demonstration First

All development decisions MUST prioritize investor comprehension and demonstration impact. The Orchestration Dashboard is the primary artifact for conveying GAVIGO's value proposition.

- Every AI decision MUST be logged with human-readable explanations
- Container state transitions (COLD→WARM→HOT) MUST be visually represented in real-time
- Cross-domain recommendation triggers MUST be clearly articulated in the decision log
- The "magic" of proactive orchestration MUST be observable, not hidden

### II. Real-Time Responsiveness

WebSocket-first architecture for all dynamic interactions. HTTP REST is secondary and used only for initial loads or configuration.

- User behavior events (scroll, focus, click) MUST propagate to backend within 100ms
- AI decisions MUST reflect on Dashboard within 200ms of being made
- Container scaling events MUST be visible on Dashboard immediately upon K8s acknowledgment
- No polling; all updates MUST be push-based via WebSocket

### III. Kubernetes-Native Design

Leverage Kubernetes primitives directly. Do not abstract away K8s concepts—they are the demonstration.

- Use native Kubernetes Deployments for workload simulation
- Scale replicas (0↔1) via client-go, not custom abstractions
- Resource quotas and limits MUST be used for throttling demonstrations
- All simulated workloads MUST be real K8s pods (stress-ng for background load)

### IV. Prototype Simplicity (YAGNI)

This is a 2-4 week prototype. Functionality over polish. Working demo over perfect architecture.

- No authentication/authorization for prototype phase
- UI styling uses existing component libraries (Tailwind, shadcn/ui) without customization
- Rule-based AI only—no ML model training or inference
- Placeholder content acceptable (static images, looping videos)
- Hardcoded demo scenarios permitted for investor presentations

### V. Technology Stack Standards

The following stack is NON-NEGOTIABLE for this prototype:

- **Backend**: Go 1.21+ with client-go (K8s), gorilla/websocket, Redis client
- **Frontend**: Vite + React 18 + TypeScript
- **Infrastructure**: DigitalOcean Kubernetes (DOKS), Redis (in-cluster)
- **Containerization**: Docker with multi-stage builds
- **Communication**: WebSocket (primary), REST (configuration only)

## Architectural Constraints

### Service Boundaries

| Service | Responsibility | Language |
|---------|---------------|----------|
| orchestrator | AI logic, K8s control, WebSocket hub | Go |
| frontend | User Stream + Dashboard | React/TS |
| redis | State, scores, pub/sub | Redis 7.x |
| workload-* | Simulated content pods | Docker |

### Data Flow Requirements

1. User actions → WebSocket → Orchestrator → Rule Engine
2. Rule Engine → K8s API (scaling) + Redis (state) + WebSocket (broadcast)
3. Dashboard subscribes to all orchestrator events via WebSocket

### Forbidden Patterns

- No gRPC (WebSocket + REST sufficient for prototype)
- No message queues (Redis pub/sub is enough)
- No service mesh (direct pod communication)
- No custom operators (simple Deployment scaling only)

## Quality Gates

### Before Merge

- [ ] Code compiles without errors
- [ ] Docker image builds successfully
- [ ] Basic functionality manually verified
- [ ] No hardcoded secrets in code

### Before Demo

- [ ] Full demo scenario runs end-to-end
- [ ] Dashboard accurately reflects all AI decisions
- [ ] Container scaling visually confirmed
- [ ] Cross-domain recommendation triggers correctly

## Governance

This constitution governs all development decisions for the GAVIGO IRE Prototype. When in conflict:

1. Constitution principles override developer preference
2. Investor demonstration value overrides technical elegance
3. Working functionality overrides comprehensive testing (prototype phase only)

Amendments to this constitution require explicit discussion and documentation of rationale.

**Version**: 1.0.0 | **Ratified**: 2025-01-21 | **Last Amended**: 2025-01-21
