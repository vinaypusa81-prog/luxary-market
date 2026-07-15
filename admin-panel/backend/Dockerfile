# ============================================================
# Admin Panel Backend Dockerfile
# ============================================================

# ── Stage 1: Builder ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++

# Copy package lock and config
COPY admin-panel/backend/package*.json ./
COPY admin-panel/backend/tsconfig.json ./

# Install dev dependencies
RUN npm ci

# Copy Prisma schema and generate client
COPY backend/prisma/schema.prisma ./backend/prisma/schema.prisma
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Copy source code and build typescript
COPY admin-panel/backend/src ./src
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S express -u 1001

# Copy package and install production dependencies
COPY admin-panel/backend/package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and client for runtime
COPY backend/prisma/schema.prisma ./backend/prisma/schema.prisma
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Copy built code from builder stage
COPY --from=builder /app/dist ./dist
COPY admin-panel/backend/public ./public

# Ensure uploads folder exists and has correct permissions
RUN mkdir -p public/uploads && chown -R express:nodejs public/uploads

USER express
EXPOSE 5001
CMD ["node", "dist/server.js"]
