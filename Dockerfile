# Multi-stage Dockerfile for SahayaSetu
# Stage 1: Build the React + Vite frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Server
FROM node:22-alpine
WORKDIR /app

# Install backend dependencies
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy built frontend assets to dist
COPY --from=frontend-builder /app/dist /app/dist

# Expose production port
ENV PORT=5000
ENV NODE_ENV=production
EXPOSE 5000

# Start unified server serving both API and static frontend
CMD ["node", "server.js"]
