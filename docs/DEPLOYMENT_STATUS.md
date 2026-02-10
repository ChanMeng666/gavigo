# GAVIGO IRE - DigitalOcean Kubernetes Deployment Status

> This document records the deployment status on DigitalOcean.
>
> **Last Updated**: 2026-02-10
>
> **Deployment Status**: Completed

---

## Access the Application

**Frontend URL**: http://129.212.209.146
**Alt URL**: https://gavigo.chanmeng.org/
**Mobile Web (direct)**: http://129.212.209.146/mobile/

---

## Completed Tasks

### 1. DigitalOcean Kubernetes Cluster

- **Cluster Name**: `gavigo-cluster`
- **Cluster ID**: `b28b4fac-bdca-436a-902a-c98751366e63`
- **Region**: `sgp1` (Singapore)
- **Node Count**: 2
- **Node Size**: `s-2vcpu-4gb`
- **Status**: Running

### 2. DigitalOcean Managed Redis (Valkey)

- **Database Name**: `gavigo-redis`
- **Database ID**: `c209b884-3e19-4924-985b-2cf0d981a433`
- **Engine**: Valkey (Redis compatible)
- **Region**: `sgp1`
- **Size**: `db-s-1vcpu-1gb`
- **Status**: Online
- **Connection URI**:
  ```
  rediss://default:***REDACTED***@gavigo-redis-do-user-32286521-0.j.db.ondigitalocean.com:25061
  ```

### 3. DigitalOcean Container Registry

- **Registry Name**: `gavigo-registry`
- **Endpoint**: `registry.digitalocean.com/gavigo-registry`
- **Region**: `sgp1`
- **Subscription Tier**: Basic (5 repositories)

### 4. Docker Images

Built and pushed images:
- `registry.digitalocean.com/gavigo-registry/orchestrator:latest`
- `registry.digitalocean.com/gavigo-registry/frontend:latest`
- `registry.digitalocean.com/gavigo-registry/mobile-web:latest`
- `registry.digitalocean.com/gavigo-registry/ai-service:latest`

### 5. Kubernetes Deployments

Deployed resources:
- **Namespace**: `gavigo`
- **Deployments**:
  - `orchestrator` (1/1 Running)
  - `frontend` (1/1 Running)
  - `mobile-web` (1/1 Running)
- **Services**:
  - `frontend` (LoadBalancer, External IP: 129.212.209.146)
  - `orchestrator` (ClusterIP :8080)
  - `mobile-web` (ClusterIP :80)

### 6. External Content Integration

- **Games**: External iframe integration (Kongregate, etc.)
  - No local game workloads required
  - Games loaded directly from external sources
- **AI Service**: OpenAI GPT-4o-mini integration
  - Fallback responses when API key not configured

### 7. Mobile Web App

- **Framework**: React Native + Expo (SDK 54), exported as web build
- **Build**: `npx expo export --platform web` → static files served by nginx
- **Proxy**: Frontend nginx proxies `/mobile/` to mobile-web service (using `^~` prefix match)
- **Embedding**: Dashboard iframes the mobile web app inside a phone mockup
- **Auth**: Auto-login as demo user on web (bypasses Firebase)
- **Features**: TikTok-style feed, social (likes, comments, follows), AI chat, explore, profile

### 8. Social API

- **Endpoints**: User profiles, likes, comments, follows
- **Storage**: In-memory Go store (not persistent across restarts)
- **Auth**: Firebase UID extraction from request context
- **Production Note**: Migrate to PostgreSQL for persistent social data

---

## Configuration Summary

| Resource | Name/ID | Connection Info |
|----------|---------|-----------------|
| K8s Cluster | `gavigo-cluster` | `doctl kubernetes cluster kubeconfig save gavigo-cluster` |
| Redis | `gavigo-redis` | `rediss://default:***REDACTED***@gavigo-redis-do-user-32286521-0.j.db.ondigitalocean.com:25061` |
| Registry | `gavigo-registry` | `registry.digitalocean.com/gavigo-registry` |
| Frontend | External IP | `http://129.212.209.146` |

---

## Nginx Proxy Routes (Frontend)

```
Frontend nginx (port 80)
├── /               → React Dashboard SPA (local files)
├── ^~ /mobile/     → mobile-web service :80 (Expo web build)
├── /api/           → orchestrator :8080 (REST API)
├── /ws             → orchestrator :8080 (WebSocket, with Upgrade)
├── ^~ /workloads/  → Various workload services
└── ~* \.(js|css…)  → Static asset caching (1 year)
```

> `^~` prefix match on `/mobile/` and `/workloads/` prevents the static asset regex from intercepting proxied JS/CSS.

---

## Operations Commands

### Check Cluster Status
```bash
kubectl -n gavigo get pods
kubectl -n gavigo get svc
kubectl -n gavigo get deployments
```

### View Logs
```bash
kubectl -n gavigo logs -l app=orchestrator
kubectl -n gavigo logs -l app=frontend
kubectl -n gavigo logs -l app=mobile-web
```

### Restart Deployments
```bash
kubectl -n gavigo rollout restart deployment/orchestrator
kubectl -n gavigo rollout restart deployment/frontend
kubectl -n gavigo rollout restart deployment/mobile-web
```

### Build and Deploy All
```bash
# Build
docker build -t registry.digitalocean.com/gavigo-registry/orchestrator:latest -f orchestrator/Dockerfile orchestrator/
docker build -t registry.digitalocean.com/gavigo-registry/frontend:latest -f frontend/Dockerfile frontend/
docker build -t registry.digitalocean.com/gavigo-registry/mobile-web:latest -f mobile/Dockerfile mobile/

# Push
docker push registry.digitalocean.com/gavigo-registry/orchestrator:latest
docker push registry.digitalocean.com/gavigo-registry/frontend:latest
docker push registry.digitalocean.com/gavigo-registry/mobile-web:latest

# Deploy
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/orchestrator/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/mobile-web/
kubectl apply -f k8s/workloads/

# Restart
kubectl -n gavigo rollout restart deployment/orchestrator
kubectl -n gavigo rollout restart deployment/frontend
kubectl -n gavigo rollout restart deployment/mobile-web
```

---

## Estimated Monthly Cost

| Service | Size | Estimated Cost |
|---------|------|----------------|
| Kubernetes Cluster | 2 nodes, sgp1 | ~$24/month |
| Managed Redis | Valkey 8, TLS | ~$15/month |
| Container Registry | Basic (5 repos) | ~$5/month |
| Load Balancer | Auto-created (129.212.209.146) | ~$12/month |
| **Total** | | **~$56/month** |

---

## Resource Cleanup (If Needed)

```bash
# Delete Kubernetes resources
kubectl delete namespace gavigo

# Delete Kubernetes cluster
doctl kubernetes cluster delete gavigo-cluster --force

# Delete Redis database
doctl databases delete c209b884-3e19-4924-985b-2cf0d981a433 --force

# Delete container registry
doctl registry delete --force
```

---

## Notes

1. **External Games**: Games are loaded via external iframes (Kongregate, etc.) - no local workload scaling required
2. **AI Service**: Uses OpenAI GPT-4o-mini with fallback responses when API key is not configured
3. **Redis TLS**: Uses `rediss://` protocol for secure connection to DigitalOcean Managed Redis
4. **TikTok-Style UI**: Mobile app features vertical scroll with snap points and inline content activation
5. **Mobile Web**: Expo web build served at `/mobile/`, embedded as iframe in dashboard phone mockup
6. **Social Data**: In-memory store — data resets on orchestrator pod restart. Migrate to PostgreSQL for production
7. **nginx ^~ Fix**: Proxy locations use `^~` prefix match to avoid conflict with static asset caching regex
