# Stage 1: Build Expo Web
FROM node:20-alpine AS builder
WORKDIR /app

# Copy shared data first (changes less often)
COPY shared/ /shared/

# Install dependencies first for layer caching
# Note: EXPO_PUBLIC_* env vars are read from .env file by Expo at build time
COPY mobile/package.json mobile/package-lock.json ./
RUN npm ci

# Copy source
COPY mobile/ .

# Build for web
RUN npx expo export --platform web

# Fix: Zustand persist emits import.meta.env which requires ES module script tag
RUN sed -i 's/<script src="\(.*\)" defer>/<script type="module" src="\1">/' dist/index.html

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY mobile/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
