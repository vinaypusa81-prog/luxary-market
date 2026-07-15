# ============================================================
# Admin Panel Frontend Dockerfile — Vite/React
# ============================================================

# ── Stage 1: Build ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package configurations
COPY admin-panel/frontend/package*.json ./
COPY admin-panel/frontend/tsconfig*.json ./
COPY admin-panel/frontend/vite.config.ts ./
COPY admin-panel/frontend/postcss.config.js ./
COPY admin-panel/frontend/tailwind.config.js ./

# Install dependencies
RUN npm ci

# Copy source and build static assets
COPY admin-panel/frontend/src ./src
COPY admin-panel/frontend/public ./public
COPY admin-panel/frontend/index.html ./
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY admin-panel/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
