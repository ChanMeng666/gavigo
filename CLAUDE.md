# GAVIGO IRE Prototype Development Guidelines

> Claude Code project instructions for GAVIGO IRE (Instant Reality Exchange)
>
> Last updated: 2026-01-24

## Project Overview

GAVIGO IRE is an AI-driven container orchestration visualization prototype. It demonstrates intelligent resource management where containers transition between COLD, WARM, and HOT states based on user engagement and AI predictions. The system features a TikTok-style vertical scrolling interface with external iframe games and AI chat integration.

**Live URL**: http://129.212.209.146

## Current Deployment Status

| Resource | Status | Details |
|----------|--------|---------|
| K8s Cluster | Running | gavigo-cluster (2 nodes, sgp1) |
| Redis | Online | Managed Valkey with TLS |
| Frontend | Running | LoadBalancer IP: 129.212.209.146 |
| Orchestrator | Running | ClusterIP service |
| External Games | Active | Kongregate iframe integration |
| AI Service | Ready | OpenAI GPT-4o-mini |

## Active Technologies

| Category | Technology | Version |
|----------|------------|---------|
| Backend Language | Go | 1.21+ |
| Frontend Language | TypeScript | 5.x |
| Frontend Framework | React | 18 |
| Build Tool | Vite | 5 |
| UI Library | TailwindCSS, shadcn/ui | Latest |
| State/Cache | Redis (Valkey) | 7.x |
| Container | Docker | Latest |
| Orchestration | Kubernetes | DOKS (DigitalOcean) |
| WebSocket | gorilla/websocket | 1.5+ |
| K8s Client | client-go | Latest |
| AI Backend | OpenAI API | GPT-4o-mini |

## Project Structure

```text
gavigo/
├── orchestrator/           # Go backend service
│   ├── cmd/orchestrator/   # Entry point (main.go)
│   ├── internal/
│   │   ├── api/            # HTTP handlers
│   │   │   └── handlers.go # REST API endpoints
│   │   ├── config/         # Configuration
│   │   ├── engine/         # Rule-based AI logic
│   │   │   ├── rules.go    # 7 trigger types
│   │   │   └── scorer.go   # Weighted scoring system
│   │   ├── k8s/            # Kubernetes client
│   │   │   ├── client.go   # K8s API client
│   │   │   ├── scaler.go   # Deployment scaling
│   │   │   └── watcher.go  # Pod monitoring
│   │   ├── redis/          # Redis client (TLS support)
│   │   │   ├── client.go   # Connection management
│   │   │   ├── pubsub.go   # Pub/Sub messaging
│   │   │   └── scores.go   # Score storage
│   │   ├── websocket/      # WebSocket hub
│   │   │   ├── handlers.go # Event handlers
│   │   │   └── hub.go      # Client management
│   │   └── models/         # Data models
│   │       ├── content.go  # Content items & cross-domain relations
│   │       ├── decision.go # AI decisions & actions
│   │       ├── events.go   # WebSocket events
│   │       └── session.go  # User sessions
│   ├── Dockerfile          # Multi-stage Go build
│   ├── go.mod
│   └── go.sum
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/  # Dashboard UI components
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── AIDecisionLog.tsx
│   │   │   │   ├── ContainerStatus.tsx
│   │   │   │   ├── ScoreDisplay.tsx
│   │   │   │   ├── ResourceChart.tsx
│   │   │   │   ├── DemoControls.tsx
│   │   │   │   └── ModeIndicator.tsx
│   │   │   ├── stream/     # TikTok-style stream
│   │   │   │   ├── MediaStream.tsx
│   │   │   │   └── TikTokContentView.tsx  # Main content view
│   │   │   ├── layout/     # Layout components
│   │   │   │   ├── AppShell.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── ViewToggle.tsx
│   │   │   │   └── ConnectionStatus.tsx
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useWebSocket.ts  # WebSocket connection
│   │   │   ├── useEngagement.ts # Focus tracking
│   │   │   ├── useMediaQuery.ts
│   │   │   └── useReducedMotion.ts
│   │   ├── services/       # API clients
│   │   │   └── api.ts      # REST API client
│   │   └── types/          # TypeScript types
│   │       └── index.ts    # All type definitions
│   ├── Dockerfile          # Multi-stage Node → Nginx build
│   ├── nginx.conf          # Nginx configuration
│   ├── package.json
│   └── package-lock.json
│
├── workloads/              # Workload containers
│   └── ai-service/         # AI chat service
│       ├── server.js       # Express server with OpenAI
│       ├── public/         # Static assets
│       └── Dockerfile
│
├── k8s/                    # Kubernetes manifests
│   ├── namespace.yaml      # gavigo namespace
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml    # LoadBalancer type
│   │   └── ingress.yaml
│   ├── orchestrator/
│   │   ├── configmap.yaml  # Environment config
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── rbac.yaml       # ServiceAccount + Role
│   └── workloads/
│       └── ai-service.yaml # AI service deployment
│
├── docs/                   # Documentation
│   └── DEMO_GUIDE.md       # Demo walkthrough
│
├── specs/                  # Specification documents
│   └── 001-ire-prototype/  # Current feature spec
│
├── CLAUDE.md               # This file
├── DEPLOYMENT_STATUS.md    # Deployment status doc
├── README.md               # Project README
├── docker-compose.yml      # Local development
└── Makefile                # Build automation
```

## Commands

### Go (Backend)

```bash
# Run locally
cd orchestrator && go run ./cmd/orchestrator

# Test
cd orchestrator && go test ./...

# Build
cd orchestrator && go build -o bin/orchestrator ./cmd/orchestrator

# Docker build (for DigitalOcean registry)
docker build -t registry.digitalocean.com/gavigo-registry/orchestrator:latest -f orchestrator/Dockerfile orchestrator/
docker push registry.digitalocean.com/gavigo-registry/orchestrator:latest
```

### React (Frontend)

```bash
# Install dependencies
cd frontend && npm install

# Development server
cd frontend && npm run dev

# Build
cd frontend && npm run build

# Docker build (for DigitalOcean registry)
docker build -t registry.digitalocean.com/gavigo-registry/frontend:latest -f frontend/Dockerfile frontend/
docker push registry.digitalocean.com/gavigo-registry/frontend:latest
```

### Kubernetes (DigitalOcean)

```bash
# Configure kubectl
doctl kubernetes cluster kubeconfig save gavigo-cluster

# Check cluster status
kubectl get nodes
kubectl -n gavigo get pods,svc,deployments

# Deploy/Update
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/orchestrator/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/workloads/

# Restart deployments
kubectl -n gavigo rollout restart deployment/orchestrator
kubectl -n gavigo rollout restart deployment/frontend

# View logs
kubectl -n gavigo logs -l app=orchestrator -f
kubectl -n gavigo logs -l app=frontend -f

# Get external IP
kubectl -n gavigo get svc frontend
```

### Docker Registry (DigitalOcean)

```bash
# Login
doctl registry login

# List images
doctl registry repository list-v2

# Build and push all images
docker build -t registry.digitalocean.com/gavigo-registry/orchestrator:latest -f orchestrator/Dockerfile orchestrator/
docker build -t registry.digitalocean.com/gavigo-registry/frontend:latest -f frontend/Dockerfile frontend/
docker push registry.digitalocean.com/gavigo-registry/orchestrator:latest
docker push registry.digitalocean.com/gavigo-registry/frontend:latest
```

## Key Configuration

### Orchestrator Environment Variables

| Variable | Production Value | Description |
|----------|------------------|-------------|
| `PORT` | 8080 | Server port |
| `REDIS_URL` | `rediss://...` | DigitalOcean Managed Redis (TLS) |
| `LOG_LEVEL` | info | Log level |
| `ENGAGEMENT_THRESHOLD_MS` | 10000 | Engagement threshold |
| `RECOMMENDATION_THRESHOLD` | 0.6 | Score threshold for warming |
| `PERSONAL_SCORE_WEIGHT` | 0.4 | Personal score weight |
| `GLOBAL_SCORE_WEIGHT` | 0.4 | Global score weight |

### Container Images

| Component | Image Path |
|-----------|------------|
| Orchestrator | `registry.digitalocean.com/gavigo-registry/orchestrator:latest` |
| Frontend | `registry.digitalocean.com/gavigo-registry/frontend:latest` |
| ai-service | `registry.digitalocean.com/gavigo-registry/ai-service:latest` |

## Code Style

### Go
- Use `gofmt` for formatting
- Follow standard Go project layout
- Error handling: return errors, don't panic
- Use context for cancellation
- Redis client supports TLS (`rediss://` scheme)

### TypeScript/React
- Use functional components with hooks
- Use TypeScript strict mode
- Follow React 18 best practices
- Use TailwindCSS for styling
- Use shadcn/ui components

## Architecture Notes

### Content Types (11 items)

**Videos (5):**
- video-football-1, video-football-2, video-football-3 (theme: football)
- video-scifi-1, video-scifi-2 (theme: scifi)

**Games - External iframes (5):**
- game-clicker-heroes (theme: idle) - Kongregate
- game-mrmine (theme: mining)
- game-poker-quest (theme: cards)
- game-grindcraft (theme: craft)
- game-fray-fight (theme: fighting)

**AI Service (1):**
- ai-service-tech (theme: tech) - OpenAI GPT-4o-mini

### Scoring Algorithm

```
Combined Score = (Personal × 0.4) + (Global × 0.4) + (Trend × 0.2)
```

- Personal: +0.1 per second of focus
- Global: +0.01 per second (shared across sessions)
- Trend: 0.0-1.0 viral score
- Decay: 1% every 5 seconds

### 7 AI Trigger Types

| Trigger | Condition | Action |
|---------|-----------|--------|
| CROSS_DOMAIN | 5s focus on content | Inject related content |
| SWARM_BOOST | viral_score >= 0.7 | Scale to WARM |
| PROACTIVE_WARM | combined >= 0.6 | Scale to WARM |
| MODE_CHANGE | 10s focus on game/AI | Change operational mode |
| RESOURCE_THROTTLE | Mode change | Adjust resource allocation |
| INITIAL_WARM | Page load | Warm first 2 items |
| LOOKAHEAD_WARM | Scroll | Warm next 2 items |

### Cross-Domain Relations

```
football → game-clicker-heroes
scifi    → game-mrmine
tech     → ai-service-tech
```

### Container States
- **COLD**: 0 replicas, no resources
- **WARM**: 1 replica, minimal resources, standby
- **HOT**: 2+ replicas, full resources, active

### Operational Modes
- **MIXED_STREAM_BROWSING**: Default browsing mode
- **GAME_FOCUS_MODE**: Focused on game content
- **AI_SERVICE_MODE**: Focused on AI service

### WebSocket Events

**Client → Server:**
- `scroll_update` - Position, velocity, visible_content
- `focus_event` - content_id, duration_ms, theme
- `activation_request` - content_id
- `deactivation` - content_id
- `demo_control` - action, target_content_id, value

**Server → Client:**
- `connection_established` - session_id, initial_content, current_mode
- `decision_made` - Full AIDecision object with reasoning
- `container_state_change` - content_id, old_state, new_state
- `score_update` - content_id, personal_score, global_score, combined_score
- `mode_change` - old_mode, new_mode, reason
- `stream_inject` - content item, insert_position, reason
- `resource_update` - ResourceAllocation object
- `activation_ready` - content_id, endpoint_url, status

### Redis Usage
- **State Store**: Container states, scores, decisions
- **Pub/Sub**: Real-time event distribution
- **TLS**: Required for DigitalOcean Managed Redis

### Kubernetes RBAC
The orchestrator service account has permissions to:
- Get/list/watch/update/patch Deployments
- Get/list/watch Pods
- Scale deployments (update Deployments/scale)

## Recent Changes

### 2026-01-24
- Replaced local games with external iframe games (Kongregate)
- Implemented TikTok-style inline content display
- Added AI chat integration with OpenAI GPT-4o-mini
- Added demo controls panel (viral slider, force state, trend spike)
- Updated documentation with mermaid diagrams

### 2026-01-22
- Deployed to DigitalOcean Kubernetes (DOKS)
- Configured DigitalOcean Managed Redis (Valkey + TLS)
- Upgraded container registry to Basic tier (5 repos)
- Updated K8s manifests with correct registry paths
- Frontend accessible via LoadBalancer IP

### 2025-01-21
- Initial prototype specification
- Go backend with K8s orchestration
- React frontend with real-time dashboard
- WebSocket-based communication

## Troubleshooting

### Pod not starting
```bash
kubectl -n gavigo describe pod <pod-name>
kubectl -n gavigo logs <pod-name>
```

### Redis connection issues
- Verify REDIS_URL in configmap uses `rediss://` (TLS)
- Check orchestrator logs for connection errors

### Image pull errors
```bash
# Re-apply registry secret
doctl registry kubernetes-manifest | kubectl apply -f -
kubectl get secret -n gavigo
```

### Service not accessible
```bash
# Check service and endpoints
kubectl -n gavigo get svc
kubectl -n gavigo get endpoints
```

### WebSocket connection issues
- Check browser console for WebSocket errors
- Verify nginx.conf has proper WebSocket proxy configuration
- Check orchestrator logs for connection attempts

### Game iframe not loading
- Games are external (Kongregate) - check browser console for CORS/CSP errors
- Some games may block iframe embedding
- Verify network connectivity to game servers

## Documentation Links

- [README.md](./README.md) - Project overview with diagrams
- [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) - Current deployment status
- [docs/DEMO_GUIDE.md](./docs/DEMO_GUIDE.md) - Demo walkthrough
- [specs/001-ire-prototype/](./specs/001-ire-prototype/) - Feature specification

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
