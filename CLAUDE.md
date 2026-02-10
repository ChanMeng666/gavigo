# GAVIGO IRE Prototype Development Guidelines

> Claude Code project instructions for GAVIGO IRE (Instant Reality Exchange)
>
> Last updated: 2026-02-10

## Project Overview

GAVIGO IRE is an AI-driven container orchestration visualization prototype with a real mobile application. It demonstrates intelligent resource management where containers transition between COLD, WARM, and HOT states based on user engagement and AI predictions. The system features:

- A **React Native + Expo mobile app** with TikTok-style vertical scrolling, social features (likes, comments, follows), and Firebase Auth
- A **React dashboard** showing real-time AI decisions, container states, scores, and resource allocation
- A **Go backend orchestrator** managing WebSocket communication, AI rules engine, and Kubernetes scaling
- The mobile app runs on **iOS, Android, and Web** — the web build is embedded as an iframe in the dashboard's phone mockup

**Live URL**: http://129.212.209.146
**Alt URL**: https://gavigo.chanmeng.org/

## Current Deployment Status

| Resource | Status | Details |
|----------|--------|---------|
| K8s Cluster | Running | gavigo-cluster (2 nodes, sgp1) |
| Redis | Online | Managed Valkey with TLS |
| Frontend | Running | LoadBalancer IP: 129.212.209.146 |
| Orchestrator | Running | ClusterIP service |
| Mobile Web | Running | ClusterIP service, proxied at `/mobile/` |
| External Games | Active | Kongregate iframe integration |
| AI Service | Ready | OpenAI GPT-4o-mini |

## Active Technologies

| Category | Technology | Version |
|----------|------------|---------|
| Backend Language | Go | 1.21+ |
| Frontend Language | TypeScript | 5.x |
| Dashboard Framework | React | 18 |
| Dashboard Build Tool | Vite | 5 |
| Dashboard UI Library | TailwindCSS, shadcn/ui | Latest |
| Mobile Framework | React Native (Expo) | SDK 54 |
| Mobile Router | Expo Router | v6 |
| Mobile Styling | NativeWind (TailwindCSS) | v4 |
| Mobile State | Zustand | 5.x |
| Mobile Auth | Firebase Auth | @react-native-firebase/auth 23.x |
| Mobile Video | expo-av | 16.x |
| Mobile WebView | react-native-webview | 13.x |
| Mobile Animations | react-native-reanimated | v4 |
| Mobile Bottom Sheet | @gorhom/bottom-sheet | v5 |
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
│   │   │   ├── handlers.go       # REST API endpoints + auth middleware
│   │   │   └── social_handlers.go # Social API (likes, comments, follows)
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
│   │       ├── session.go  # User sessions
│   │       └── social.go   # Social models (UserProfile, Comment, Like, Follow)
│   ├── Dockerfile          # Multi-stage Go build
│   ├── go.mod
│   └── go.sum
│
├── frontend/               # React dashboard (investor demo)
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
│   │   │   ├── stream/     # Phone mockup + stream
│   │   │   │   ├── MediaStream.tsx      # Renders PhoneMockup with iframe or fallback
│   │   │   │   ├── PhoneMockup.tsx      # iPhone frame component
│   │   │   │   └── TikTokContentView.tsx # CSS-only fallback content view
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
│   │                       # Sets VITE_RN_WEB_URL=/mobile/ at build time
│   ├── nginx.conf          # Nginx config with ^~ proxy locations
│   ├── package.json
│   └── package-lock.json
│
├── mobile/                 # React Native + Expo mobile app
│   ├── app/                # Expo Router file-based routing
│   │   ├── index.tsx              # Root redirect (auth check)
│   │   ├── _layout.tsx            # Root layout with AuthGuard
│   │   ├── (auth)/                # Auth screens (unauthenticated)
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   └── (tabs)/                # Main app (authenticated)
│   │       ├── _layout.tsx        # Tab bar (Feed, Explore, AI Chat, Profile)
│   │       ├── feed/index.tsx     # TikTok-style vertical feed (FlatList)
│   │       ├── explore/index.tsx  # Content grid + search/filters
│   │       ├── chat/index.tsx     # AI chat interface
│   │       └── profile/index.tsx  # User profile + settings
│   ├── components/
│   │   ├── feed/                  # Feed content components
│   │   │   ├── ContentCard.tsx    # Card wrapper (routes to embed by type)
│   │   │   ├── VideoPlayer.tsx    # expo-av video player
│   │   │   ├── GameEmbed.tsx      # WebView game embed (native)
│   │   │   ├── GameEmbed.web.tsx  # iframe game embed (web)
│   │   │   ├── AIChatEmbed.tsx    # Inline AI chat
│   │   │   └── ContentOverlay.tsx # TikTok-style overlay (title, actions)
│   │   ├── social/                # Social interaction components
│   │   │   ├── LikeButton.tsx     # Animated heart + count
│   │   │   ├── CommentButton.tsx  # Opens comment sheet
│   │   │   ├── CommentSheet.tsx   # Bottom sheet comments list
│   │   │   ├── FollowButton.tsx   # Follow/unfollow
│   │   │   └── ShareButton.tsx    # Native share
│   │   ├── profile/               # Profile components
│   │   └── ui/                    # Base UI components
│   ├── hooks/
│   │   ├── useAuth.ts             # Firebase auth listener (native)
│   │   ├── useAuth.web.ts         # Auto-login demo user (web)
│   │   ├── useWebSocket.ts        # WebSocket connection
│   │   └── useEngagement.ts       # Focus time tracking
│   ├── services/
│   │   ├── api.ts                 # REST API client + WebSocket URL
│   │   ├── firebase.ts            # Firebase auth (native)
│   │   └── firebase.web.ts        # Mock Firebase (web demo)
│   ├── stores/                    # Zustand state management
│   │   ├── authStore.ts           # Auth state (user, token, loading)
│   │   ├── feedStore.ts           # Feed state (content, scores, decisions)
│   │   └── socialStore.ts         # Social state (likes, comments, follows)
│   ├── types/index.ts             # TypeScript types (mirrors frontend types)
│   ├── Dockerfile                 # Multi-stage: node:20-alpine → nginx:alpine
│   ├── nginx.conf                 # SPA static server
│   ├── app.json                   # Expo config (baseUrl: /mobile)
│   ├── tailwind.config.js
│   ├── global.css
│   └── package.json
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
│   ├── mobile-web/         # Mobile web app deployment
│   │   ├── deployment.yaml # 1 replica, 32-64Mi RAM
│   │   └── service.yaml    # ClusterIP on port 80
│   └── workloads/
│       └── ai-service.yaml # AI service deployment
│
├── docs/                   # Documentation
│   ├── DEMO_GUIDE.md       # Demo walkthrough
│   └── DEPLOYMENT_STATUS.md # Deployment status
│
├── specs/                  # Specification documents
│   └── 001-ire-prototype/  # Current feature spec
│
├── CLAUDE.md               # This file
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

### React Dashboard (Frontend)

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

### Mobile App (Expo)

```bash
# Install dependencies (always use npx expo install for SDK compatibility)
cd mobile && npm install

# Development
cd mobile && npx expo start           # All platforms
cd mobile && npx expo start --web     # Web only
cd mobile && npx expo start --ios     # iOS simulator
cd mobile && npx expo start --android # Android emulator

# Export web build (static files for deployment)
cd mobile && npx expo export --platform web

# Docker build (web only, for DigitalOcean registry)
docker build -t registry.digitalocean.com/gavigo-registry/mobile-web:latest -f mobile/Dockerfile mobile/
docker push registry.digitalocean.com/gavigo-registry/mobile-web:latest
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
kubectl apply -f k8s/mobile-web/
kubectl apply -f k8s/workloads/

# Restart deployments
kubectl -n gavigo rollout restart deployment/orchestrator
kubectl -n gavigo rollout restart deployment/frontend
kubectl -n gavigo rollout restart deployment/mobile-web

# View logs
kubectl -n gavigo logs -l app=orchestrator -f
kubectl -n gavigo logs -l app=frontend -f
kubectl -n gavigo logs -l app=mobile-web -f

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
docker build -t registry.digitalocean.com/gavigo-registry/mobile-web:latest -f mobile/Dockerfile mobile/
docker push registry.digitalocean.com/gavigo-registry/orchestrator:latest
docker push registry.digitalocean.com/gavigo-registry/frontend:latest
docker push registry.digitalocean.com/gavigo-registry/mobile-web:latest
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

### Frontend Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_RN_WEB_URL` | `/mobile/` | URL for React Native Web iframe (set in Dockerfile) |

### Mobile App Configuration (app.json)

| Field | Value | Description |
|-------|-------|-------------|
| `name` | GAVIGO IRE | App display name |
| `slug` | gavigo-ire | Expo slug |
| `scheme` | gavigo | Deep linking scheme (`gavigo://`) |
| `experiments.baseUrl` | /mobile | Web base path (sub-path hosting) |
| `ios.bundleIdentifier` | com.gavigo.ire | iOS bundle ID |
| `android.package` | com.gavigo.ire | Android package name |

### Container Images

| Component | Image Path |
|-----------|------------|
| Orchestrator | `registry.digitalocean.com/gavigo-registry/orchestrator:latest` |
| Frontend | `registry.digitalocean.com/gavigo-registry/frontend:latest` |
| Mobile Web | `registry.digitalocean.com/gavigo-registry/mobile-web:latest` |
| ai-service | `registry.digitalocean.com/gavigo-registry/ai-service:latest` |

## Code Style

### Go
- Use `gofmt` for formatting
- Follow standard Go project layout
- Error handling: return errors, don't panic
- Use context for cancellation
- Redis client supports TLS (`rediss://` scheme)
- Social data uses in-memory store (replace with PostgreSQL for production)

### TypeScript/React (Dashboard)
- Use functional components with hooks
- Use TypeScript strict mode
- Follow React 18 best practices
- Use TailwindCSS for styling
- Use shadcn/ui components

### TypeScript/React Native (Mobile)
- Use Expo Router for file-based navigation
- Use NativeWind (TailwindCSS) for styling
- Use Zustand for state management
- Use platform-specific files: `.web.ts` / `.web.tsx` for web-only implementations
  - Metro bundler automatically picks `.web.ts` over `.ts` for web builds
  - Example: `useAuth.web.ts` (demo user), `GameEmbed.web.tsx` (iframe instead of WebView)
- Use `useRef` pattern for stable FlatList callbacks (react-native-web requirement)
- Use `npx expo install` for adding dependencies (ensures SDK version compatibility)

## Architecture Notes

### System Architecture

The system has three main layers:

1. **Mobile App** (React Native + Expo) — TikTok-style feed with social features, runs on iOS/Android/Web
2. **Dashboard** (React + Vite) — Investor demo page with phone mockup (iframe of mobile web app) + real-time dashboard
3. **Orchestrator** (Go) — Backend handling WebSocket, REST API, AI rules engine, K8s scaling, social API

```
Internet → LoadBalancer → Frontend (nginx)
                              ├── /            → Dashboard (React SPA)
                              ├── ^~ /mobile/  → Mobile Web (Expo web build)
                              ├── /api/        → Orchestrator (Go)
                              ├── /ws          → Orchestrator WebSocket
                              └── ^~ /workloads/ → AI Service, Game workloads
```

**Important**: nginx `^~` prefix match is required on `/mobile/` and `/workloads/` proxy locations to prevent the static asset caching regex (`~* \.(js|css|...)`) from intercepting proxied assets.

### Mobile Web Integration

The dashboard embeds the mobile web app via an iframe:
- `VITE_RN_WEB_URL=/mobile/` env var enables iframe mode in `MediaStream.tsx`
- When set, `PhoneMockup` renders an `<iframe src="/mobile/">` inside the phone frame
- When empty, falls back to CSS-only `TikTokContentView` (no social features)
- Both iframe and dashboard share the same WebSocket connection to the orchestrator

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

### REST API Endpoints

#### Core API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/content` | List all content items |
| GET | `/api/v1/content/:id` | Get single content item |
| GET | `/api/v1/containers` | Get container states |
| GET | `/api/v1/decisions` | Get AI decision history |
| GET | `/api/v1/scores` | Get content scores |
| GET | `/api/v1/mode` | Get current operational mode |
| GET | `/api/v1/resources` | Get resource allocation |
| POST | `/api/v1/demo/reset` | Reset demo state |
| POST | `/api/v1/demo/trend-spike` | Trigger trend spike |

#### Social API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user profile (auto-creates if needed) |
| POST | `/api/v1/users/profile` | Create/update user profile |
| POST | `/api/v1/content/:id/like` | Like content |
| DELETE | `/api/v1/content/:id/like` | Unlike content |
| GET | `/api/v1/content/:id/comments` | Get comments for content |
| POST | `/api/v1/content/:id/comments` | Post a comment |
| POST | `/api/v1/users/:id/follow` | Follow a user |
| DELETE | `/api/v1/users/:id/follow` | Unfollow a user |

### Social Data (In-Memory Store)

The social API uses an in-memory `SocialStore` in Go:
- `users` map: firebase_uid → UserProfile
- `likes` map: content_id → user_id → bool
- `comments` map: content_id → []Comment
- `follows` map: user_id → followed_user_id → bool

**Production migration**: Replace with PostgreSQL tables: `users`, `likes`, `comments`, `follows`, `view_history`.

### Authentication

- **Native mobile**: Firebase Auth (email/password, Google, Apple)
- **Web mobile**: Auto-login as demo user (bypasses Firebase)
- **Backend**: Firebase UID extracted from request context via `GetFirebaseUID(r)`
- **WebSocket**: Token passed as query param `?token=<firebase_id_token>`
- **Auth middleware**: Permissive in dev mode (token prefix used as UID when no Firebase verifier)

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

### 2026-02-10
- Added React Native + Expo mobile app (`mobile/`) with 4 tabs: Feed, Explore, AI Chat, Profile
- Added social features: likes, comments, follows with animated UI
- Added social API endpoints in Go orchestrator (in-memory store)
- Added mobile-web Kubernetes deployment and ClusterIP service
- Added frontend nginx proxy for mobile web app (`^~ /mobile/`)
- Added `VITE_RN_WEB_URL=/mobile/` for iframe embedding in dashboard
- Fixed nginx `^~` prefix match for proxy locations (prevents static asset regex conflict)
- Fixed FlatList `onViewableItemsChanged` stability for react-native-web (useRef pattern)
- Added platform-specific files: `useAuth.web.ts`, `firebase.web.ts`, `GameEmbed.web.tsx`

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

### Mobile web app black screen
- Verify nginx has `^~` on `/mobile/` location (prevents static asset regex from intercepting JS/CSS)
- Check mobile-web pod is running: `kubectl -n gavigo get pods -l app=mobile-web`
- Test proxy chain: `kubectl -n gavigo exec deployment/frontend -- wget -qO- http://mobile-web:80/ | head`
- Check for React errors: FlatList `onViewableItemsChanged` must be stable (use `useRef`)

### Mobile web iframe not showing
- Verify `VITE_RN_WEB_URL` is set in frontend Dockerfile (should be `/mobile/`)
- Check `MediaStream.tsx` — when `VITE_RN_WEB_URL` is empty, it falls back to CSS-only view

## Documentation Links

- [README.md](./README.md) - Project overview with diagrams
- [docs/DEPLOYMENT_STATUS.md](./docs/DEPLOYMENT_STATUS.md) - Current deployment status
- [docs/DEMO_GUIDE.md](./docs/DEMO_GUIDE.md) - Demo walkthrough
- [specs/001-ire-prototype/](./specs/001-ire-prototype/) - Feature specification
- [docs/EXPO_WEB_PITFALLS.md](./docs/EXPO_WEB_PITFALLS.md) - Expo web platform pitfalls and debugging guide

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
