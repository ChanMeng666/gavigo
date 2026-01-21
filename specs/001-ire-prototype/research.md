# Research: GAVIGO IRE Visualization Prototype

**Date**: 2025-01-21
**Branch**: `001-ire-prototype`

## Technology Decisions

### 1. Backend Language: Go

**Decision**: Go 1.21+

**Rationale**:
- Official Kubernetes client (client-go) is first-class Go library
- Excellent WebSocket support (gorilla/websocket is battle-tested)
- Low memory footprint ideal for K8s deployment (~10-20MB)
- Single binary deployment simplifies containerization
- Strong concurrency model for handling multiple WebSocket connections

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Node.js | Familiar, fast iteration | Higher memory (~200MB), K8s client less mature | Resource overhead on K8s |
| Python | AI/ML ecosystem, FastAPI | GIL limits concurrency, slower than Go | Performance for real-time |
| Rust | Performance, safety | Steeper learning curve, slower iteration | Prototype timeline constraints |

### 2. Frontend Framework: Vite + React

**Decision**: Vite 5.x + React 18 + TypeScript

**Rationale**:
- Fast development with HMR (Hot Module Replacement)
- React 18 has excellent WebSocket integration patterns
- TypeScript provides type safety for complex event structures
- Large ecosystem of UI components (shadcn/ui)
- Straightforward containerization (nginx serve static build)

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Next.js | SSR, routing | Complex deployment, overkill for SPA | Unnecessary complexity |
| Vue 3 | Simpler reactivity | Smaller ecosystem for charts/dashboards | Fewer dashboard components |
| Svelte | Smaller bundle | Less mature WebSocket patterns | Limited enterprise adoption |

### 3. Kubernetes Platform: DigitalOcean (DOKS)

**Decision**: DigitalOcean Kubernetes

**Rationale**:
- Cost-effective ($12-40/month for small cluster)
- Simple UI for demo/presentation
- Good documentation
- Built-in load balancer provisioning
- Container registry included

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Civo | Cheaper (~$5-20/month), K3s | Less mature, fewer regions | Brand recognition for investors |
| AWS EKS | Enterprise grade | Complex setup, higher cost | Overkill for prototype |
| Minikube | Free, local | Not cloud-accessible for demos | Requires local setup at demo |

### 4. State Management: Redis

**Decision**: Redis 7.x (in-cluster deployment)

**Rationale**:
- Perfect for real-time score storage
- Pub/sub for event distribution
- Low latency reads/writes
- Simple deployment in K8s
- Well-supported Go client (go-redis/redis)

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| PostgreSQL | ACID, complex queries | Overkill for key-value scores | Unnecessary complexity |
| In-memory Go | No external dependency | Lost on restart, no pub/sub | Need persistence for demo |
| etcd | K8s native | Not designed for app data | Wrong use case |

### 5. WebSocket Library: gorilla/websocket

**Decision**: gorilla/websocket v1.5+

**Rationale**:
- Most widely used Go WebSocket library
- Well-documented hub pattern
- Good performance characteristics
- Easy integration with HTTP handlers

**Note**: gorilla/websocket is in maintenance mode but stable for production use. For new projects, consider nhooyr.io/websocket as modern alternative, but gorilla is sufficient for prototype.

### 6. UI Component Library: shadcn/ui + TailwindCSS

**Decision**: shadcn/ui components with TailwindCSS

**Rationale**:
- Not a dependency (copy components into project)
- Highly customizable
- Modern, clean aesthetic
- Includes chart components via recharts integration
- Active community and good documentation

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Material UI | Comprehensive | Heavy bundle, Google aesthetic | Overstyled for prototype |
| Ant Design | Enterprise focused | Chinese documentation primary | Complexity |
| Chakra UI | Accessible | Smaller component set | Fewer chart options |

## Implementation Notes

### K8s Scaling Approach

For demonstrating "proactive scaling", we use native Kubernetes Deployment scaling:

```go
// Pseudocode for scaling
deployment, _ := clientset.AppsV1().Deployments(namespace).Get(ctx, name, metav1.GetOptions{})
deployment.Spec.Replicas = &newReplicas
clientset.AppsV1().Deployments(namespace).Update(ctx, deployment, metav1.UpdateOptions{})
```

The Orchestrator needs RBAC permissions:
- `get`, `list`, `watch` on deployments
- `update`, `patch` on deployments
- `get`, `list`, `watch` on pods (for status monitoring)

### WebSocket Event Flow

```
Frontend → Orchestrator (user events)
    scroll_update: {position, velocity, focused_content}
    focus_event: {content_id, duration_ms}
    activation_request: {content_id}

Orchestrator → Frontend (system events)
    decision_made: {decision_id, reasoning, action, affected_content}
    container_state_change: {content_id, old_state, new_state}
    score_update: {content_id, personal_score, global_score}
    mode_change: {old_mode, new_mode}
    stream_inject: {content_item, position}
    resource_update: {active, warm, background}
```

### Container State Machine

```
COLD (replicas=0) → WARM (replicas=1, not activated) → HOT (replicas=1, activated)
                  ↑___________________________________|
                          (deactivation/timeout)
```

### Engagement Threshold Rules

```
Rule 1: Cross-Domain Recommendation
  IF cumulative_focus_time(theme) > 10s
  AND Personal_Recommendation_Score(related_content) < threshold
  THEN increase Personal_Recommendation_Score(related_content) by 0.3

Rule 2: Swarm Intelligence Boost
  IF Global_Viral_Score(content) > 0.7
  THEN add 0.2 to combined score

Rule 3: Proactive Warming
  IF combined_score(content) > 0.6
  AND container_state(content) == COLD
  THEN scale_to_warm(content)
```
