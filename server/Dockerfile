# Production Dockerfile for Express MVC Backend
FROM node:22

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend port
EXPOSE 5000

# Run as non-root user for security
USER node

# Start Express server
CMD ["node", "src/server.js"]
