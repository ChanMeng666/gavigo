# GAVIGO IRE - DigitalOcean Kubernetes 部署状态文档

> 此文档记录了 DigitalOcean 全托管方案的部署进度，用于重启后继续完成部署。
>
> **最后更新时间**: 2026-01-22 02:10 UTC

---

## 已完成的任务

### 1. DigitalOcean Kubernetes 集群 ✅
- **集群名称**: `gavigo-cluster`
- **集群 ID**: `b28b4fac-bdca-436a-902a-c98751366e63`
- **区域**: `sgp1` (新加坡)
- **节点数量**: 2
- **节点规格**: `s-2vcpu-4gb`
- **状态**: Running

验证命令:
```bash
doctl kubernetes cluster list
kubectl get nodes
```

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

验证命令:
```bash
doctl databases list
```

### 3. DigitalOcean Container Registry ✅
- **注册表名称**: `gavigo-registry`
- **端点**: `registry.digitalocean.com/gavigo-registry`
- **区域**: `sgp1`
- **订阅层级**: Starter

验证命令:
```bash
doctl registry get
```

### 4. 代码恢复 ✅
已恢复完整的 K8s 和 Redis 代码（撤销了之前的 stub 简化）:
- `orchestrator/internal/k8s/client.go` - 完整 K8s 客户端
- `orchestrator/internal/k8s/scaler.go` - 完整扩展功能
- `orchestrator/internal/k8s/watcher.go` - 完整 Pod 监控
- `orchestrator/internal/redis/client.go` - 支持 TLS 的 Redis 客户端
- `orchestrator/internal/redis/pubsub.go` - 完整发布订阅
- `orchestrator/internal/redis/scores.go` - 完整分数存储
- `orchestrator/go.mod` - 恢复所有依赖

### 5. 工具安装 ✅
- **kubectl**: 已安装 (v1.35.0)
- **Docker Desktop**: 已安装 (v29.1.3) - **需要重启 Windows 生效**

---

## 待完成的任务

### 5. 构建并推送 Docker 镜像 ⏳
需要在 Windows 重启后执行:

```bash
# 1. 登录容器注册表
doctl registry login

# 2. 构建 orchestrator 镜像
cd D:/github_repository/gavigo
docker build -t registry.digitalocean.com/gavigo-registry/orchestrator:latest -f orchestrator/Dockerfile orchestrator/

# 3. 构建 frontend 镜像
docker build -t registry.digitalocean.com/gavigo-registry/frontend:latest -f frontend/Dockerfile frontend/

# 4. 构建 workload 镜像
docker build -t registry.digitalocean.com/gavigo-registry/game-football:latest -f workloads/game-football/Dockerfile workloads/game-football/
docker build -t registry.digitalocean.com/gavigo-registry/game-scifi:latest -f workloads/game-scifi/Dockerfile workloads/game-scifi/
docker build -t registry.digitalocean.com/gavigo-registry/ai-service:latest -f workloads/ai-service/Dockerfile workloads/ai-service/

# 5. 推送所有镜像
docker push registry.digitalocean.com/gavigo-registry/orchestrator:latest
docker push registry.digitalocean.com/gavigo-registry/frontend:latest
docker push registry.digitalocean.com/gavigo-registry/game-football:latest
docker push registry.digitalocean.com/gavigo-registry/game-scifi:latest
docker push registry.digitalocean.com/gavigo-registry/ai-service:latest
```

### 6. 更新 K8s 配置文件 ⏳
需要更新以下文件以使用 DigitalOcean 资源:

#### 6.1 更新镜像地址
所有 K8s deployment 文件需要更新镜像地址为:
- `registry.digitalocean.com/gavigo-registry/orchestrator:latest`
- `registry.digitalocean.com/gavigo-registry/frontend:latest`
- `registry.digitalocean.com/gavigo-registry/game-football:latest`
- `registry.digitalocean.com/gavigo-registry/game-scifi:latest`
- `registry.digitalocean.com/gavigo-registry/ai-service:latest`

#### 6.2 创建 Redis 连接 Secret
```bash
kubectl create namespace gavigo

kubectl create secret generic redis-credentials \
  --namespace gavigo \
  --from-literal=REDIS_URL="rediss://default:***REDACTED***@gavigo-redis-do-user-32286521-0.j.db.ondigitalocean.com:25061"
```

#### 6.3 配置镜像拉取 Secret
```bash
doctl registry kubernetes-manifest | kubectl apply -f -
```

### 7. 部署到 Kubernetes ⏳
```bash
# 1. 创建命名空间
kubectl apply -f k8s/namespace.yaml

# 2. 部署 orchestrator
kubectl apply -f k8s/orchestrator/

# 3. 部署 frontend
kubectl apply -f k8s/frontend/

# 4. 部署 workloads
kubectl apply -f k8s/workloads/

# 5. 检查部署状态
kubectl -n gavigo get pods
kubectl -n gavigo get services
kubectl -n gavigo get deployments
```

### 8. 验证部署 ⏳
```bash
# 查看 Pod 状态
kubectl -n gavigo get pods -w

# 查看服务
kubectl -n gavigo get svc

# 获取外部 IP（如果使用 LoadBalancer）
kubectl -n gavigo get svc frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# 查看日志
kubectl -n gavigo logs -l app=orchestrator
kubectl -n gavigo logs -l app=frontend
```

---

## 重要配置信息汇总

| 资源 | 名称/ID | 连接信息 |
|------|---------|----------|
| K8s 集群 | `gavigo-cluster` | `doctl kubernetes cluster kubeconfig save gavigo-cluster` |
| Redis | `gavigo-redis` | `rediss://default:***REDACTED***@gavigo-redis-do-user-32286521-0.j.db.ondigitalocean.com:25061` |
| Registry | `gavigo-registry` | `registry.digitalocean.com/gavigo-registry` |

---

## 重启后的操作步骤

1. **启动 Docker Desktop**
   - 打开 Docker Desktop 应用程序
   - 等待 Docker Engine 启动完成（托盘图标变为绿色）

2. **验证 Docker 运行**
   ```bash
   docker --version
   docker ps
   ```

3. **配置 kubectl**
   ```bash
   doctl kubernetes cluster kubeconfig save gavigo-cluster
   kubectl get nodes
   ```

4. **登录容器注册表**
   ```bash
   doctl registry login
   ```

5. **继续执行待完成任务**
   - 按照上述 "待完成的任务" 章节执行

---

## 故障排除

### Docker 无法连接
如果 Docker 命令失败，确保:
1. Docker Desktop 已启动
2. 等待 1-2 分钟让引擎初始化
3. 检查 Docker Desktop 托盘图标状态

### kubectl 无法连接集群
```bash
# 重新获取集群凭证
doctl kubernetes cluster kubeconfig save gavigo-cluster

# 验证上下文
kubectl config current-context
```

### 镜像推送失败
```bash
# 重新登录注册表
doctl registry login

# 或手动配置
doctl registry docker-config --read-write > ~/.docker/config.json
```

---

## 预计月度费用

| 服务 | 规格 | 预计费用 |
|------|------|----------|
| Kubernetes 集群 | 2 节点 x s-2vcpu-4gb | ~$48/月 |
| Managed Redis | db-s-1vcpu-1gb | ~$15/月 |
| Container Registry | Starter | 免费 |
| **总计** | | **~$63/月** |

---

## 清理资源（如需删除）

```bash
# 删除 Kubernetes 集群
doctl kubernetes cluster delete gavigo-cluster --force

# 删除 Redis 数据库
doctl databases delete c209b884-3e19-4924-985b-2cf0d981a433 --force

# 删除容器注册表
doctl registry delete --force
```

---

> **提示**: 在 Claude Code 中执行命令 `继续部署 GAVIGO 到 DigitalOcean Kubernetes` 即可让 AI 助手继续完成剩余任务。
