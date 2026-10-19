# Stage 1: Build Vite React frontend
FROM node:22 AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Vite build environment variables (can be overridden during build)
ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_WEATHER_API_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WEATHER_API_KEY=$VITE_WEATHER_API_KEY

# Compile production bundle
RUN npm run build

# Stage 2: Serve static files with Nginx (Debian-based standard image)
FROM nginx:latest

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
