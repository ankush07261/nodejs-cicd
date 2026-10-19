# Root Dockerfile for Backend API Service
FROM node:22

WORKDIR /app

# Copy server package manifests and install production dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy server application code
COPY server/ ./

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

USER node

CMD ["node", "src/server.js"]