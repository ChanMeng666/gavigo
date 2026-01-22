#!/bin/sh
# Entrypoint script for workload containers with background load simulation
# This simulates a "busy environment" per spec requirements

# Configuration via environment variables
STRESS_ENABLED=${STRESS_ENABLED:-true}
STRESS_CPU_WORKERS=${STRESS_CPU_WORKERS:-1}
STRESS_CPU_LOAD=${STRESS_CPU_LOAD:-20}
STRESS_TIMEOUT=${STRESS_TIMEOUT:-0}

echo "Starting workload container..."
echo "  STRESS_ENABLED: $STRESS_ENABLED"
echo "  STRESS_CPU_WORKERS: $STRESS_CPU_WORKERS"
echo "  STRESS_CPU_LOAD: $STRESS_CPU_LOAD%"

# Start background CPU stress if enabled
if [ "$STRESS_ENABLED" = "true" ]; then
    echo "Starting background CPU stress simulation..."
    # stress-ng with controlled CPU load
    # --cpu: number of CPU workers
    # --cpu-load: target CPU load percentage (0-100)
    # --timeout 0: run indefinitely
    stress-ng --cpu $STRESS_CPU_WORKERS --cpu-load $STRESS_CPU_LOAD --timeout $STRESS_TIMEOUT &
    STRESS_PID=$!
    echo "Background stress started (PID: $STRESS_PID)"
fi

# Handle SIGTERM for graceful shutdown
trap 'echo "Shutting down..."; kill $STRESS_PID 2>/dev/null; nginx -s quit; exit 0' SIGTERM SIGINT

# Start nginx in foreground
echo "Starting nginx..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Wait for nginx to exit
wait $NGINX_PID
