# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git ca-certificates

# Copy go mod files
COPY orchestrator/go.mod orchestrator/go.sum* ./

# Download dependencies
RUN go mod download || go mod tidy

# Copy source code
COPY orchestrator/ .

# Copy shared game data for go:embed
COPY shared/games.json internal/models/games.json

# Ensure dependencies are resolved
RUN go mod tidy

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o orchestrator ./cmd/orchestrator

# Runtime stage
FROM alpine:3.19

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Copy binary from builder
COPY --from=builder /app/orchestrator .

# Expose port
EXPOSE 8080

# Run
CMD ["./orchestrator"]
