# Stage 1: Build Vite React frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Vite build environment variables (can be overridden during build)
ARG VITE_API_URL=/api
ARG VITE_WEATHER_API_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WEATHER_API_KEY=$VITE_WEATHER_API_KEY

# Compile production bundle
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:1.27-alpine

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]
