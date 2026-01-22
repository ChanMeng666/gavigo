FROM nginx:alpine

# Install stress-ng for background load simulation
RUN apk add --no-cache stress-ng

# Create nginx html directory
RUN mkdir -p /usr/share/nginx/html

# Copy application files
COPY index.html /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script for stress simulation
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Environment variables for stress configuration
# STRESS_ENABLED: true/false - enable/disable background stress
# STRESS_CPU_WORKERS: number of CPU stress workers (default: 1)
# STRESS_CPU_LOAD: target CPU load percentage 0-100 (default: 20)
ENV STRESS_ENABLED=true
ENV STRESS_CPU_WORKERS=1
ENV STRESS_CPU_LOAD=20
ENV STRESS_TIMEOUT=0

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
