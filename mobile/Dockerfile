# Stage 1: Build Expo Web
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time environment variables (baked into JS bundle by Expo)
ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY
ARG EXPO_PUBLIC_PEXELS_API_KEY
ENV EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL
ENV EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY
ENV EXPO_PUBLIC_PEXELS_API_KEY=$EXPO_PUBLIC_PEXELS_API_KEY

# Install dependencies first for layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build for web
RUN npx expo export --platform web

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
