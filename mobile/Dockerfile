# Stage 1: Build Expo Web
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first for layer caching
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Build for web
RUN npx expo export --platform web

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
