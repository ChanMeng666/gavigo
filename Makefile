.PHONY: dev build test clean docker-build docker-up docker-down k8s-deploy k8s-delete

# Development
dev:
	@echo "Starting development environment..."
	cd frontend && npm run dev &
	cd orchestrator && go run cmd/orchestrator/main.go

# Build
build: build-frontend build-orchestrator

build-frontend:
	cd frontend && npm install && npm run build

build-orchestrator:
	cd orchestrator && go build -o bin/orchestrator cmd/orchestrator/main.go

# Test
test: test-frontend test-orchestrator

test-frontend:
	cd frontend && npm test

test-orchestrator:
	cd orchestrator && go test ./...

# Clean
clean:
	rm -rf frontend/dist
	rm -rf frontend/node_modules
	rm -rf orchestrator/bin

# Docker
docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

# Kubernetes
k8s-deploy:
	kubectl apply -f k8s/namespace.yaml
	kubectl apply -f k8s/redis/
	kubectl apply -f k8s/orchestrator/
	kubectl apply -f k8s/frontend/
	kubectl apply -f k8s/workloads/

k8s-delete:
	kubectl delete -f k8s/workloads/ --ignore-not-found
	kubectl delete -f k8s/frontend/ --ignore-not-found
	kubectl delete -f k8s/orchestrator/ --ignore-not-found
	kubectl delete -f k8s/redis/ --ignore-not-found
	kubectl delete -f k8s/namespace.yaml --ignore-not-found

k8s-status:
	kubectl -n gavigo get pods
	kubectl -n gavigo get services
	kubectl -n gavigo get deployments

# Help
help:
	@echo "GAVIGO IRE - Instant Reality Exchange"
	@echo ""
	@echo "Available commands:"
	@echo "  dev              - Start development environment"
	@echo "  build            - Build all components"
	@echo "  test             - Run all tests"
	@echo "  clean            - Clean build artifacts"
	@echo "  docker-build     - Build Docker images"
	@echo "  docker-up        - Start Docker Compose environment"
	@echo "  docker-down      - Stop Docker Compose environment"
	@echo "  k8s-deploy       - Deploy to Kubernetes"
	@echo "  k8s-delete       - Delete from Kubernetes"
	@echo "  k8s-status       - Show Kubernetes status"
