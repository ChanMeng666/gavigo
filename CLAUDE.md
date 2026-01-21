# GAVIGO IRE Prototype Development Guidelines

Auto-generated from feature plans. Last updated: 2025-01-21

## Active Technologies

| Category | Technology | Version |
|----------|------------|---------|
| Backend Language | Go | 1.21+ |
| Frontend Language | TypeScript | 5.x |
| Frontend Framework | React | 18 |
| Build Tool | Vite | 5 |
| UI Library | TailwindCSS, shadcn/ui | Latest |
| State/Cache | Redis | 7.x |
| Container | Docker | Latest |
| Orchestration | Kubernetes | DOKS |
| WebSocket | gorilla/websocket | 1.5+ |
| K8s Client | client-go | Latest |

## Project Structure

```text
gavigo/
├── orchestrator/           # Go backend service
│   ├── cmd/orchestrator/   # Entry point
│   ├── internal/           # Internal packages
│   │   ├── config/         # Configuration
│   │   ├── engine/         # Rule-based AI logic
│   │   ├── k8s/            # Kubernetes client
│   │   ├── redis/          # Redis client
│   │   ├── websocket/      # WebSocket hub
│   │   └── models/         # Data models
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API clients
│   │   └── types/          # TypeScript types
│   └── Dockerfile
├── workloads/              # Simulated content containers
├── k8s/                    # Kubernetes manifests
└── specs/                  # Specifications
    └── 001-ire-prototype/  # Current feature spec
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

# Docker build
docker build -t gavigo-orchestrator ./orchestrator
```

### React (Frontend)

```bash
# Install dependencies
cd frontend && npm install

# Development server
cd frontend && npm run dev

# Build
cd frontend && npm run build

# Docker build
docker build -t gavigo-frontend ./frontend
```

### Kubernetes

```bash
# Apply all manifests
kubectl apply -k k8s/

# Check status
kubectl get pods -n gavigo

# Port forward for local testing
kubectl port-forward svc/frontend 8080:80 -n gavigo
kubectl port-forward svc/orchestrator 8081:8080 -n gavigo
```

## Code Style

### Go
- Use `gofmt` for formatting
- Follow standard Go project layout
- Error handling: return errors, don't panic
- Use context for cancellation

### TypeScript/React
- Use functional components with hooks
- Use TypeScript strict mode
- Follow React 18 best practices
- Use TailwindCSS for styling

## Recent Changes

### 001-ire-prototype (2025-01-21)
- Initial prototype specification
- Go backend with K8s orchestration
- React frontend with real-time dashboard
- WebSocket-based communication

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
