# GAVIGO IRE - Instant Reality Exchange

<div align="center">

![GAVIGO](https://img.shields.io/badge/GAVIGO-IRE-blue?style=for-the-badge)
![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)

**AI-Driven Container Orchestration Visualization Prototype**

</div>

## Overview

GAVIGO IRE (Instant Reality Exchange) is a visualization prototype demonstrating AI-driven container orchestration for mixed-media content delivery. The system showcases intelligent resource management where containers transition between COLD, WARM, and HOT states based on user engagement patterns and AI-driven predictions.

## Key Features

### 🎯 AI-Driven Orchestration
- **Cross-Domain Recommendations**: Automatically suggests related content across different media types (video → game) based on user engagement
- **Swarm Intelligence**: Detects trending content and proactively warms containers
- **Proactive Warming**: Predicts user intent and prepares containers before activation

### 📊 Real-Time Dashboard
- Live AI decision log with reasoning explanations
- Container state visualization (COLD → WARM → HOT)
- Personal, global, and combined score tracking
- Resource allocation charts
- Operational mode indicators

### 🎮 Interactive Demo
- Mixed-media content stream with engagement tracking
- Full-screen content activation experience
- Demo controls for triggering scenarios

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Media Stream│  │  Dashboard  │  │    Full Screen View     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │ WebSocket / REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Orchestrator (Go)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Rules    │  │ Scorer   │  │ API      │  │ WebSocket Hub    │ │
│  │ Engine   │  │          │  │ Handlers │  │                  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌──────────────────┐          ┌──────────────────────────────────┐
│      Redis       │          │         Kubernetes API           │
│  (State Store)   │          │   (Deployment Scaling)           │
└──────────────────┘          └──────────────────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
             ┌───────────┐        ┌───────────┐        ┌───────────┐
             │game-      │        │game-      │        │ai-        │
             │football   │        │scifi      │        │service    │
             └───────────┘        └───────────┘        └───────────┘
```

## Container States

| State | Replicas | Description |
|-------|----------|-------------|
| **COLD** | 0 | No running instances, minimal resource usage |
| **WARM** | 1 | Standby instance ready for quick activation |
| **HOT** | 2+ | Active with full resources allocated |

## Technology Stack

### Backend
- **Go 1.21+** - High-performance orchestrator service
- **gorilla/websocket** - Real-time bidirectional communication
- **client-go** - Kubernetes API interactions
- **go-redis** - State management and pub/sub

### Frontend
- **React 18** - UI framework
- **TypeScript 5** - Type-safe development
- **Vite 5** - Build tooling
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

### Infrastructure
- **Kubernetes** - Container orchestration
- **Redis 7** - State store and message broker
- **Docker** - Containerization
- **Nginx** - Frontend serving

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)
- Go 1.21+ (for development)
- kubectl (for Kubernetes deployment)

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

### Kubernetes Deployment

```bash
# Deploy all components
make k8s-deploy

# Check status
make k8s-status

# Delete deployment
make k8s-delete
```

## Project Structure

```
gavigo/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   └── stream/      # Media stream components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client
│   │   └── types/           # TypeScript definitions
│   └── Dockerfile
├── orchestrator/            # Go backend service
│   ├── cmd/orchestrator/    # Application entry point
│   └── internal/
│       ├── api/             # HTTP handlers
│       ├── engine/          # Rules engine & scorer
│       ├── k8s/             # Kubernetes client
│       ├── models/          # Data models
│       ├── redis/           # Redis client
│       └── websocket/       # WebSocket hub
├── workloads/               # Simulated workload containers
│   ├── game-football/
│   ├── game-scifi/
│   └── ai-service/
├── k8s/                     # Kubernetes manifests
│   ├── frontend/
│   ├── orchestrator/
│   ├── redis/
│   └── workloads/
├── specs/                   # Specification documents
├── docker-compose.yml       # Local development setup
└── Makefile                 # Build automation
```

## API Endpoints

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
| WS | `/ws` | WebSocket connection |

## WebSocket Events

### Client → Server
- `scroll_update` - User scroll position
- `focus_event` - Content focus duration
- `activation_request` - Request content activation
- `deactivation` - Deactivate content
- `demo_control` - Demo control actions

### Server → Client
- `connection_established` - Initial state
- `decision_made` - AI decision notification
- `container_state_change` - State transition
- `score_update` - Score changes
- `mode_change` - Operational mode change
- `stream_inject` - Content injection
- `resource_update` - Resource allocation update
- `activation_ready` - Content ready for use

## Demo Scenarios

1. **Cross-Domain Recommendation**: Watch football video → System recommends football game
2. **Trend Spike**: Trigger viral content → Swarm intelligence activates warming
3. **Proactive Warming**: Extended engagement → AI predicts and warms related content
4. **Mode Transition**: Focus on game → System enters Game Focus Mode

## License

This project is proprietary software. All rights reserved.

## Contributing

This is a private prototype. Please contact the repository owner for contribution guidelines.
