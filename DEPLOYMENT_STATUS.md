# GAVIGO IRE - DigitalOcean Kubernetes 部署状态文档

> 此文档记录了 DigitalOcean 全托管方案的部署进度。
>
> **最后更新时间**: 2026-01-22 02:55 UTC
>
> **部署状态**: 已完成

---

## 部署完成

### 访问应用

**前端地址**: http://129.212.209.146

---

## 已完成的任务

### 1. DigitalOcean Kubernetes 集群 ✅
- **集群名称**: `gavigo-cluster`
- **集群 ID**: `b28b4fac-bdca-436a-902a-c98751366e63`
- **区域**: `sgp1` (新加坡)
- **节点数量**: 2
- **节点规格**: `s-2vcpu-4gb`
- **状态**: Running

### 2. DigitalOcean Managed Redis (Valkey) ✅
- **数据库名称**: `gavigo-redis`
- **数据库 ID**: `c209b884-3e19-4924-985b-2cf0d981a433`
- **引擎**: Valkey (Redis 兼容)
- **区域**: `sgp1`
- **规格**: `db-s-1vcpu-1gb`
- **状态**: Online
- **连接 URI**:
  ```
  rediss://default:***REDACTED***@gavigo-redis-do-user-32286521-0.j.db.ondigitalocean.com:25061
  ```

### 3. DigitalOcean Container Registry ✅
- **注册表名称**: `gavigo-registry`
- **端点**: `registry.digitalocean.com/gavigo-registry`
- **区域**: `sgp1`
- **订阅层级**: Basic (5 repositories)

### 4. Docker 镜像 ✅
已构建并推送以下镜像:
- `registry.digitalocean.com/gavigo-registry/orchestrator:latest`
- `registry.digitalocean.com/gavigo-registry/frontend:latest`
- `registry.digitalocean.com/gavigo-registry/game-football:latest`
- `registry.digitalocean.com/gavigo-registry/game-scifi:latest`
- `registry.digitalocean.com/gavigo-registry/ai-service:latest`

### 5. Kubernetes 部署 ✅
已部署以下资源:
- **Namespace**: `gavigo`
- **Deployments**:
  - `orchestrator` (1/1 Running)
  - `frontend` (1/1 Running)
  - `game-football` (0/0 - Cold Start)
  - `game-scifi` (0/0 - Cold Start)
  - `ai-service` (0/0 - Cold Start)
- **Services**:
  - `frontend` (LoadBalancer, External IP: 129.212.209.146)
  - `orchestrator` (ClusterIP)
  - `game-football` (ClusterIP)
  - `game-scifi` (ClusterIP)
  - `ai-service` (ClusterIP)

---

## 重要配置信息汇总

| 资源 | 名称/ID | 连接信息 |
|------|---------|----------|
| K8s 集群 | `gavigo-cluster` | `doctl kubernetes cluster kubeconfig save gavigo-cluster` |
| Redis | `gavigo-redis` | `rediss://default:***REDACTED***@gavigo-redis-do-user-32286521-0.j.db.ondigitalocean.com:25061` |
| Registry | `gavigo-registry` | `registry.digitalocean.com/gavigo-registry` |
| Frontend | External IP | `http://129.212.209.146` |

---

## 运维命令

### 查看集群状态
```bash
kubectl -n gavigo get pods
kubectl -n gavigo get svc
kubectl -n gavigo get deployments
```

### 查看日志
```bash
kubectl -n gavigo logs -l app=orchestrator
kubectl -n gavigo logs -l app=frontend
```

### 重新部署
```bash
kubectl -n gavigo rollout restart deployment/orchestrator
kubectl -n gavigo rollout restart deployment/frontend
```

---

## 预计月度费用

| 服务 | 规格 | 预计费用 |
|------|------|----------|
| Kubernetes 集群 | 2 节点, sgp1 | ~$24/月 |
| Managed Redis | Valkey 8, TLS | ~$15/月 |
| Container Registry | Basic (5 repos) | ~$5/月 |
| Load Balancer | 自动创建 (129.212.209.146) | ~$12/月 |
| **总计** | | **~$56/月** |

---

## 清理资源（如需删除）

```bash
# 删除 Kubernetes 资源
kubectl delete namespace gavigo

# 删除 Kubernetes 集群
doctl kubernetes cluster delete gavigo-cluster --force

# 删除 Redis 数据库
doctl databases delete c209b884-3e19-4924-985b-2cf0d981a433 --force

# 删除容器注册表
doctl registry delete --force
```

---

## 注意事项

1. **Workload 冷启动**: `game-football`, `game-scifi`, `ai-service` 初始副本数为 0，由 orchestrator 根据需求自动扩展
2. **Redis TLS**: 使用 `rediss://` 协议连接 DigitalOcean Managed Redis
3. **Registry 升级**: 已从 Starter 升级到 Basic 层级以支持 5 个仓库
