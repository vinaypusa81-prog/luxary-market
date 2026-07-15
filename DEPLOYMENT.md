# LuxeMarket Production Deployment Guide

This guide details how to deploy the LuxeMarket eCommerce Platform to a live Linux VPS (Ubuntu 22.04+) using Docker Compose and the Caddy web server.

---

## 1. Prerequisites & Server Setup

### 1.1 DNS Configuration
Before initiating server setup, point your domain and subdomains to your VPS public IP address (via DNS `A` records):
- `your-domain.com` (Main Store Frontend)
- `api.your-domain.com` (Store NestJS API Backend)
- `admin.your-domain.com` (Admin Panel React Frontend)
- `admin-api.your-domain.com` (Admin Express API Backend)

### 1.2 System Packages & Docker Installation
Log into your target VPS via SSH and install Docker and Docker Compose:

```bash
# Update package database
sudo apt update && sudo apt upgrade -y

# Install prerequisites
sudo apt install -y curl git apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify Installation
docker --version
docker compose version
```

---

## 2. Project Clone & Configuration

### 2.1 Clone the Codebase
Clone the project repository to `/var/www/luxemarket` (or your preferred directory) and switch to the branch:

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone https://github.com/vinaypusa81-prog/luxary-market.git luxemarket
cd luxemarket
```

### 2.2 Configure Production Environment Variables
Copy the template `.env.example` into a production `.env` file and customize the variables:

```bash
cp .env.example .env
nano .env
```

Make sure to adjust these key variables in the `.env` file:
```ini
# --- Domains & URLs ---
STORE_DOMAIN=your-domain.com
API_DOMAIN=api.your-domain.com
ADMIN_DOMAIN=admin.your-domain.com
ADMIN_API_DOMAIN=admin-api.your-domain.com

NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXTAUTH_URL=https://your-domain.com

# --- Database & Passwords (Use strong passwords!) ---
POSTGRES_DB=luxemarket
POSTGRES_USER=luxe_admin
POSTGRES_PASSWORD=your_secure_postgres_password

MONGO_DB=luxemarket_admin
REDIS_PASSWORD=your_secure_redis_password

# --- JWT Secrets (Generate random hex strings) ---
JWT_SECRET=your_super_jwt_secret_key
JWT_REFRESH_SECRET=your_super_jwt_refresh_secret_key
NEXTAUTH_SECRET=your_nextauth_secret_key

# --- External Services ---
# Fill in credentials for Stripe, Cloudinary, AWS S3, Google OAuth, SMTP, etc.
```

---

## 3. Database Initialization & Seeding

Since the containers run in isolated environments, initialize the PostgreSQL schema and run any migrations before launching:

```bash
# Install local packages for tooling access
npm install

# Generate local Prisma client and push migrations to the DB container (start postgres first)
docker compose -f docker-compose.prod.yml up -d postgres mongodb

# Push Prisma schemas and seed databases
npx prisma db push --schema=backend/prisma/schema.prisma

# Seed Store PostgreSQL data (if seeds exist in workspace)
npm run db:seed --workspace=backend

# Seed Admin Panel MongoDB data
npm run db:seed --workspace=admin-panel/backend
```

---

## 4. Run the Production Stack

Once databases are initialized, compile the code, build the images, and boot up the full stack:

```bash
# Build production images (cache is utilized where appropriate)
docker compose -f docker-compose.prod.yml build

# Spin up all services in detached background mode
docker compose -f docker-compose.prod.yml up -d
```

Verify that all services are healthy and running:
```bash
docker compose -f docker-compose.prod.yml ps
```

---

## 5. Reverse Proxy Verification

Caddy automatically handles HTTPS provisioning and certificate renewals using Let's Encrypt. 
Check Caddy logs to ensure certificates were successfully requested:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

Once Caddy has retrieved certificates:
- Visit `https://your-domain.com` to see the storefront.
- Visit `https://admin.your-domain.com` to access the Admin Panel dashboard.

---

## 6. Maintenance & Troubleshooting

### Viewing Logs
To tail logs for a specific service (e.g. backend api):
```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

### Stopping/Updating the Application
To stop the stack:
```bash
docker compose -f docker-compose.prod.yml down
```

To pull the latest code updates and rebuild without downtime:
```bash
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d --no-deps --build
```
