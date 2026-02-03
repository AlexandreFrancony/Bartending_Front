# Bartending V2 - Frontend
# Multi-stage build for production

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument for API URL (passed from docker-compose)
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app (VITE_API_URL is baked in at build time)
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy nginx config that proxies API requests
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
