# Quickstart: GAVIGO IRE Visualization Prototype

**Date**: 2025-01-21
**Branch**: `001-ire-prototype`

## Prerequisites

- DigitalOcean account with Kubernetes cluster (DOKS)
- `kubectl` configured to access cluster
- `docker` for building images
- DigitalOcean Container Registry (DOCR) access

## Quick Deploy

### 1. Build and Push Images

```bash
# Set your registry
export REGISTRY=registry.digitalocean.com/your-registry

# Build all images
docker build -t $REGISTRY/gavigo-orchestrator:latest ./orchestrator
docker build -t $REGISTRY/gavigo-frontend:latest ./frontend
docker build -t $REGISTRY/game-football:latest ./workloads/game-football
docker build -t $REGISTRY/game-scifi:latest ./workloads/game-scifi
docker build -t $REGISTRY/video-server:latest ./workloads/video-server
docker build -t $REGISTRY/background-stress:latest ./workloads/background-stress

# Push all images
docker push $REGISTRY/gavigo-orchestrator:latest
docker push $REGISTRY/gavigo-frontend:latest
docker push $REGISTRY/game-football:latest
docker push $REGISTRY/game-scifi:latest
docker push $REGISTRY/video-server:latest
docker push $REGISTRY/background-stress:latest
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy Redis
kubectl apply -f k8s/redis/

# Deploy RBAC for orchestrator
kubectl apply -f k8s/orchestrator/rbac.yaml

# Deploy orchestrator
kubectl apply -f k8s/orchestrator/

# Deploy frontend
kubectl apply -f k8s/frontend/

# Deploy workloads (will start with replicas=0)
kubectl apply -f k8s/workloads/
```

### 3. Access the Application

```bash
# Get frontend URL
kubectl get ingress -n gavigo

# Or use port-forward for local testing
kubectl port-forward svc/frontend 8080:80 -n gavigo
kubectl port-forward svc/orchestrator 8081:8080 -n gavigo
```

**URLs**:
- Stream View: `http://your-domain/` or `http://localhost:8080`
- Dashboard View: `http://your-domain/dashboard` or `http://localhost:8080/dashboard`

---

## Validation Scenarios

### Scenario 1: Cross-Domain Recommendation

**Goal**: Verify that watching football videos triggers football game recommendation

**Steps**:
1. Open Stream View in one browser tab
2. Open Dashboard View in another browser tab
3. Scroll through stream slowly
4. Focus on football video content for 10+ seconds
5. Continue scrolling

**Expected Results**:
- [ ] Dashboard shows "focus_event" for football content
- [ ] After 10s, Dashboard shows decision: "Cross-Domain trigger activated"
- [ ] Personal_Recommendation_Score for "Football Game" increases
- [ ] "Football Game" placeholder appears in stream
- [ ] Dashboard shows "stream_inject" event

---

### Scenario 2: Proactive Container Warming

**Goal**: Verify container scales from COLD to WARM before user arrives

**Steps**:
1. Verify all game containers start in COLD state (replicas=0)
2. Trigger cross-domain recommendation (Scenario 1)
3. Observe Dashboard

**Expected Results**:
- [ ] Dashboard shows initial state: game-football = COLD
- [ ] After recommendation triggers, decision log shows "Initiating WARM process"
- [ ] Container status changes: COLD → WARM
- [ ] `kubectl get pods -n gavigo` shows game-football pod running

**Verification**:
```bash
# Check deployment replicas
kubectl get deployment game-football -n gavigo -o jsonpath='{.spec.replicas}'
# Should show: 1
```

---

### Scenario 3: Instant Activation

**Goal**: Verify clicking pre-warmed content activates instantly

**Steps**:
1. Complete Scenario 2 (container is WARM)
2. Click on the Football Game placeholder in stream

**Expected Results**:
- [ ] Full-screen view appears within 500ms
- [ ] No loading spinner visible
- [ ] Dashboard shows container state: WARM → HOT
- [ ] Dashboard shows mode change: MIXED_STREAM_BROWSING → GAME_FOCUS_MODE

---

### Scenario 4: Resource Throttling

**Goal**: Verify background workloads are throttled when game is active

**Steps**:
1. Ensure background-stress container is running
2. Activate a game (Scenario 3)
3. Observe resource allocation on Dashboard

**Expected Results**:
- [ ] Resource chart shows shift: background decreases, active increases
- [ ] Decision log shows "RESOURCE_THROTTLE" action
- [ ] Before: active=0%, warm=40%, background=60%
- [ ] After: active=70%, warm=20%, background=10%

---

### Scenario 5: Demo Control Panel - Trend Spike

**Goal**: Verify manual trend spike influences AI decisions

**Steps**:
1. Open Dashboard
2. Click "Trend Spike: Football Game" button
3. Observe changes

**Expected Results**:
- [ ] Global_Viral_Score for Football Game jumps to 0.85+
- [ ] Decision log shows "High Global_Viral_Score" message
- [ ] Combined score increases
- [ ] If game was COLD, warming is triggered

---

### Scenario 6: Demo Reset

**Goal**: Verify demo can be reset to initial state

**Steps**:
1. After running other scenarios, click "Reset Demo" button
2. Observe all states

**Expected Results**:
- [ ] All container states return to COLD
- [ ] All scores reset to 0
- [ ] Mode returns to MIXED_STREAM_BROWSING
- [ ] Decision log is cleared
- [ ] Stream returns to initial content order

**Verification**:
```bash
# All workload deployments should have 0 replicas
kubectl get deployments -n gavigo -l type=workload -o jsonpath='{range .items[*]}{.metadata.name}: {.spec.replicas}{"\n"}{end}'
# Expected:
# game-football: 0
# game-scifi: 0
# video-server: 0
```

---

## Troubleshooting

### WebSocket Connection Fails

```bash
# Check orchestrator logs
kubectl logs -n gavigo deployment/orchestrator

# Check if service is accessible
kubectl get svc orchestrator -n gavigo
```

### Container Scaling Not Working

```bash
# Check RBAC permissions
kubectl auth can-i update deployments --as=system:serviceaccount:gavigo:orchestrator -n gavigo

# Check orchestrator has correct service account
kubectl get deployment orchestrator -n gavigo -o jsonpath='{.spec.template.spec.serviceAccountName}'
```

### Redis Connection Issues

```bash
# Check Redis is running
kubectl get pods -n gavigo -l app=redis

# Test Redis connection
kubectl exec -it deployment/orchestrator -n gavigo -- redis-cli -h redis ping
```

---

## Demo Presentation Guide

### Setup (5 minutes before demo)

1. Ensure cluster is running: `kubectl get nodes`
2. Reset demo state: Click "Reset Demo" on Dashboard
3. Open Stream and Dashboard side-by-side
4. Verify all containers are COLD

### Demo Flow (2 minutes)

1. **Introduce the Stream** (15s)
   - Show mixed content types
   - Explain IIP concept

2. **Demonstrate Engagement** (30s)
   - Scroll slowly through football videos
   - Point out focus tracking on Dashboard

3. **Cross-Domain Magic** (30s)
   - Show recommendation trigger in decision log
   - Point out Football Game appearing in stream
   - Highlight container warming (COLD → WARM)

4. **Instant Activation** (20s)
   - Click Football Game
   - Emphasize: "No loading spinner!"
   - Show mode change on Dashboard

5. **Resource Intelligence** (15s)
   - Point out resource allocation shift
   - Explain background throttling

6. **Viral Trend Demo** (10s)
   - Click "Trend Spike" for different game
   - Show immediate influence on AI decisions

### Key Talking Points

- "The AI anticipates user needs BEFORE they click"
- "Container is already warm when user wants it"
- "This is Instant Reality - zero perceived latency"
- "All decisions are transparent and explainable"
