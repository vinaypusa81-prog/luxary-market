# ============================================================
# Backend Dockerfile — NestJS
# ============================================================

# ── Stage 1: Development ──────────────────────────────────
FROM node:20-alpine AS development
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 4000
CMD ["npm", "run", "start:dev"]

# ── Stage 2: Builder ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# ── Stage 3: Production ───────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json .
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
USER nestjs
EXPOSE 4000
CMD ["node", "dist/main.js"]
