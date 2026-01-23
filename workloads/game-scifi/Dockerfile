# Build stage - compile Phaser game with Webpack
# Using Node.js 16 for compatibility with older webpack/css-loader
FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the game
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Install stress-ng for background load simulation
RUN apk add --no-cache stress-ng

# Create nginx html directory
RUN mkdir -p /usr/share/nginx/html

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script for stress simulation
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Environment variables for stress configuration
ENV STRESS_ENABLED=true
ENV STRESS_CPU_WORKERS=1
ENV STRESS_CPU_LOAD=20
ENV STRESS_TIMEOUT=0

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
