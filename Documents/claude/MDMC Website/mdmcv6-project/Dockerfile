# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend-clean/package*.json ./frontend-clean/

# Install dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend-clean && npm install

# Copy source code
COPY backend/ ./backend/
COPY frontend-clean/ ./frontend-clean/

# Build frontend
RUN cd frontend-clean && npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and user
RUN addgroup -g 1001 -S nodejs && adduser -S smartlink -u 1001

WORKDIR /app

# Copy backend dependencies and source
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/src ./backend/src
COPY --from=builder /app/backend/models ./backend/models
COPY --from=builder /app/backend/routes ./backend/routes
COPY --from=builder /app/backend/middleware ./backend/middleware
COPY --from=builder /app/backend/services ./backend/services
COPY --from=builder /app/backend/utils ./backend/utils

# Copy built frontend
COPY --from=builder /app/frontend-clean/dist ./frontend-clean/dist

# Copy production files
COPY --from=builder /app/package*.json ./

# Change ownership
RUN chown -R smartlink:nodejs /app
USER smartlink

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node backend/healthcheck.js

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/src/app.js"]