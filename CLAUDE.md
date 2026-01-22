# GAVIGO IRE Prototype Development Guidelines

> Claude Code project instructions for GAVIGO IRE (Instant Reality Exchange)
>
> Last updated: 2026-01-22

## Project Overview

GAVIGO IRE is an AI-driven container orchestration visualization prototype. It demonstrates intelligent resource management where containers transition between COLD, WARM, and HOT states based on user engagement and AI predictions.

**Live URL**: http://129.212.209.146

## Current Deployment Status

| Resource | Status | Details |
|----------|--------|---------|
| K8s Cluster | ✅ Running | gavigo-cluster (2 nodes, sgp1) |
| Redis | ✅ Online | Managed Valkey with TLS |
| Frontend | ✅ Running | LoadBalancer IP: 129.212.209.146 |
| Orchestrator | ✅ Running | ClusterIP service |
| Workloads | ✅ Ready | Cold start (0 replicas) |

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

## Project Structure

```text
gavigo/
├── orchestrator/           # Go backend service
│   ├── cmd/orchestrator/   # Entry point (main.go)
│   ├── internal/
│   │   ├── api/            # HTTP handlers
│   │   ├── config/         # Configuration
│   │   ├── engine/         # Rule-based AI logic
│   │   │   ├── engine.go   # Rules engine
│   │   │   └── scorer.go   # Scoring system
│   │   ├── k8s/            # Kubernetes client
│   │   │   ├── client.go   # K8s API client
│   │   │   ├── scaler.go   # Deployment scaling
│   │   │   └── watcher.go  # Pod monitoring
│   │   ├── redis/          # Redis client (TLS support)
│   │   │   ├── client.go   # Connection management
│   │   │   ├── pubsub.go   # Pub/Sub messaging
│   │   │   └── scores.go   # Score storage
│   │   ├── websocket/      # WebSocket hub
│   │   └── models/         # Data models
│   ├── Dockerfile          # Multi-stage Go build
│   ├── go.mod
│   └── go.sum
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/  # Dashboard UI components
│   │   │   └── stream/     # Media stream components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API clients
│   │   └── types/          # TypeScript types
│   ├── Dockerfile          # Multi-stage Node → Nginx build
│   ├── nginx.conf          # Nginx configuration
│   ├── package.json
│   └── package-lock.json
│
├── workloads/              # Simulated content containers
│   ├── game-football/      # Football game workload
│   ├── game-scifi/         # Sci-Fi game workload
│   └── ai-service/         # AI service workload
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
│       ├── game-football.yaml  # replicas: 0
│       ├── game-scifi.yaml     # replicas: 0
│       └── ai-service.yaml     # replicas: 0
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
| `RECOMMENDATION_THRESHOLD` | 0.6 | Score threshold |
| `PERSONAL_SCORE_WEIGHT` | 0.6 | Personal score weight |
| `GLOBAL_SCORE_WEIGHT` | 0.4 | Global score weight |

### Container Images

| Component | Image Path |
|-----------|------------|
| Orchestrator | `registry.digitalocean.com/gavigo-registry/orchestrator:latest` |
| Frontend | `registry.digitalocean.com/gavigo-registry/frontend:latest` |
| game-football | `registry.digitalocean.com/gavigo-registry/game-football:latest` |
| game-scifi | `registry.digitalocean.com/gavigo-registry/game-scifi:latest` |
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

### Container States
- **COLD**: 0 replicas, no resources
- **WARM**: 1 replica, minimal resources, standby
- **HOT**: 2+ replicas, full resources, active

### WebSocket Events
Client → Server:
- `scroll_update`, `focus_event`, `activation_request`, `deactivation`, `demo_control`

Server → Client:
- `connection_established`, `decision_made`, `container_state_change`, `score_update`, `mode_change`, `activation_ready`

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

## Documentation Links

- [README.md](./README.md) - Project overview with diagrams
- [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) - Current deployment status
- [specs/001-ire-prototype/](./specs/001-ire-prototype/) - Feature specification

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
