# Trust Scan - Complete Docker Deployment Guide

## Production Deployment on Home Server with Cloudflare Tunnel

---

## 1. PROJECT OVERVIEW

**Application**: Trust Scan
**Purpose**: Free URL security scanner for indie developers
**Version**: 1.0.0
**Framework**: Next.js 16.1.1 (App Router)
**Node Version**: 20.18+ or 22.12+
**Database**: Neon PostgreSQL (Cloud)
**Public URL**: `https://YOUR-SUBDOMAIN.YOUR-DOMAIN.com` (via Cloudflare Tunnel)

---

## 2. SYSTEM REQUIREMENTS

### Minimum Specs
- **CPU**: 2 cores
- **RAM**: 2GB (4GB recommended with Ollama)
- **Storage**: 10GB SSD
- **OS**: Linux (Docker host)

### Required Software
- Docker Engine 24+
- Docker Compose v2
- Cloudflare account (free tier works)

### External Services (Already Configured)
- Neon PostgreSQL (cloud database)
- Upstash Redis (rate limiting/caching)
- Ollama on your network (AI analysis)

---

## 3. ENVIRONMENT VARIABLES

Create `.env` file with all these variables:

```env
#=====================================================
# REQUIRED - Application will not start without this
#=====================================================

# Neon PostgreSQL Database (YOUR EXISTING CLOUD DB)
DATABASE_URL="postgresql://neondb_owner:npg_xrTfdX2jGS5c@ep-bitter-unit-ahcd77jh-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

#=====================================================
# AI ANALYSIS (Your Ollama Server)
#=====================================================

# Ollama server URL (your home network)
# NOTE: Use Docker network address or host.docker.internal
OLLAMA_SERVER_URL="http://192.168.1.38:11433"

# AI Model to use
OLLAMA_MODEL="qwen2.5:latest"

#=====================================================
# CACHING & RATE LIMITING (Upstash Redis)
#=====================================================

# Upstash Redis REST API (current production values)
UPSTASH_REDIS_REST_URL="https://curious-pheasant-55919.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AdpvAAIncDFjNGRjZmUwNmMzZDM0YzU2YTQ2ZmRiNDI1MWFiOWY2MXAxNTU5MTk"

#=====================================================
# THREAT INTELLIGENCE APIs
#=====================================================

# API Ninjas - Enhanced WHOIS data
# Register: https://api-ninjas.com/
API_NINJAS_KEY="yAgRMxBfP7YrWnZPuuLueg==201c1JTwW69aaBdW"

# AbuseIPDB - IP Reputation (1,000 free/day)
# Register: https://www.abuseipdb.com/account/api
ABUSEIPDB_KEY="29b0304ff69d0316af2ca6c8270e066c0e4c8394ea4ed6dba61140e0da18e90eb4e53f17684612ab"

# URLhaus - Malware URL Database
# Register: https://urlhaus.abuse.ch/api/
URLHAUS_KEY="fe20589db28c9d7ebbdee5eb9a03f78ebeea9931afbc6e30"

# PhishTank - Phishing Detection (optional)
# Register: https://phishtank.org/
PHISHTANK_KEY=""

# GitHub Token - Higher API rate limits (5000/hr vs 60/hr)
# Create: https://github.com/settings/tokens
GITHUB_TOKEN=""

#=====================================================
# PRODUCTION SETTINGS
#=====================================================

NODE_ENV="production"
PORT="3000"
```

---

## 4. DOCKER CONFIGURATION

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Trust Scan Production Dockerfile
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/config || exit 1

CMD ["node", "server.js"]
```

### Next.js Config Update

Update `next.config.ts` to enable standalone output:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

---

## 5. DOCKER COMPOSE

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Trust Scan Application
  trustscan:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: trustscan-app
    restart: unless-stopped
    env_file:
      - .env
    environment:
      NODE_ENV: production
    ports:
      - "3000:3000"
    networks:
      - trustscan-network
    extra_hosts:
      # Allow container to reach host network (for Ollama at 192.168.1.38)
      - "host.docker.internal:host-gateway"

  # Cloudflare Tunnel
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: trustscan-tunnel
    restart: unless-stopped
    command: tunnel --no-autoupdate run
    environment:
      TUNNEL_TOKEN: ${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - trustscan-network
    depends_on:
      - trustscan

networks:
  trustscan-network:
    driver: bridge
```

**Note**: No local PostgreSQL container needed - using Neon cloud database.

---

## 6. CLOUDFLARE TUNNEL SETUP

### Step 1: Create Tunnel

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Networks > Tunnels**
3. Click **Create a tunnel**
4. Select **Cloudflared** connector type
5. Name it: `trustscan`
6. Click **Save tunnel**
7. Copy the tunnel token (long string starting with `eyJ...`)

### Step 2: Configure Public Hostname

1. In tunnel config, click **Public Hostname** tab
2. Click **Add a public hostname**
3. Configure:
   - **Subdomain**: Your choice (e.g., `trustscan`, `scan`, `vibe`)
   - **Domain**: Select your domain from dropdown
   - **Type**: HTTP
   - **URL**: `trustscan:3000` (Docker service name)
4. Click **Save hostname**

### Step 3: Add Token to Environment

Add to your `.env`:
```env
CLOUDFLARE_TUNNEL_TOKEN="eyJhIjoiYWJjZGVm..."
```

### Step 4: DNS (Automatic)

Cloudflare automatically creates a CNAME record pointing to your tunnel. No manual DNS configuration needed.

---

## 7. DATABASE SETUP (Neon Cloud)

### Your Existing Database

You're using Neon PostgreSQL cloud database:
- **Host**: `ep-bitter-unit-ahcd77jh-pooler.c-3.us-east-1.aws.neon.tech`
- **Database**: `neondb`
- **Connection Pooling**: Enabled (via pooler endpoint)

### Initialize Schema (First Time Only)

After first container startup, push the Prisma schema:

```bash
docker compose exec trustscan npx prisma db push
```

### Verify Tables

Check in Neon Dashboard or via SQL:
```sql
SELECT * FROM "ScanResult" LIMIT 1;
```

### Database Schema

Single table - `ScanResult`:
- Stores scan results with 24-hour cache expiration
- Indexed on `domain` and `expiresAt` for performance
- JSON fields for flexible check data storage

### Neon Dashboard

Manage your database at: https://console.neon.tech/

---

## 8. OLLAMA AI SETUP

### Your Current Setup
- Server: `192.168.1.38:11433`
- Model: `qwen2.5:latest`

### Docker Network Considerations

Since Ollama runs on your host network, the container needs to reach it:

**Option A**: Use host IP directly (current setup)
```env
OLLAMA_SERVER_URL="http://192.168.1.38:11433"
```

**Option B**: Use Docker's host gateway
```env
OLLAMA_SERVER_URL="http://host.docker.internal:11433"
```

### Verify Ollama Access

```bash
# Test from inside container
docker compose exec trustscan wget -qO- http://192.168.1.38:11433/api/tags
```

---

## 9. DEPLOYMENT COMMANDS

### Initial Deployment

```bash
# 1. Create project directory on server
sudo mkdir -p /opt/trustscan
cd /opt/trustscan

# 2. Copy project files (from your local machine)
# Option A: SCP
scp -r /path/to/vibecheck/* user@server:/opt/trustscan/

# Option B: Git clone (if you push to repo)
git clone https://github.com/undeadlist/trust-scan.git .

# 3. Create .env file with all variables
nano .env
# Paste all environment variables from Section 3

# 4. Build and start all services
docker compose up -d --build

# 5. Initialize database schema (first time only)
docker compose exec trustscan npx prisma db push

# 6. Check logs
docker compose logs -f

# 7. Verify health
curl http://localhost:3000/api/config
# Expected: {"trustScanAvailable":true}
```

### Maintenance Commands

```bash
# View logs (all services)
docker compose logs -f

# View logs (app only)
docker compose logs -f trustscan

# Restart application
docker compose restart trustscan

# Rebuild after code changes
docker compose up -d --build trustscan

# Check container status
docker compose ps

# Stop everything (keeps data)
docker compose down

# Full restart
docker compose down && docker compose up -d
```

### Updating the Application

```bash
# Pull latest code
cd /opt/trustscan
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Run migrations if schema changed
docker compose exec trustscan npx prisma db push
```

---

## 10. EXTERNAL API REGISTRATIONS

### Currently Configured

| Service | Status | Free Tier | Registration URL |
|---------|--------|-----------|------------------|
| Upstash Redis | Active | 10K commands/day | https://upstash.com/ |
| API Ninjas | Active | 10K requests/month | https://api-ninjas.com/ |
| AbuseIPDB | Active | 1,000 requests/day | https://www.abuseipdb.com/ |
| URLhaus | Active | Unlimited | https://urlhaus.abuse.ch/api/ |
| PhishTank | Not configured | Unlimited | https://phishtank.org/ |
| GitHub | Not configured | 5,000 requests/hr | https://github.com/settings/tokens |

### Services Without API Key
- **Spamhaus**: DNS-based lookups, no key needed
- **Archive.org**: Public API, no key needed
- **RDAP**: Public domain info, no key needed

---

## 10a. PHISHTANK REGISTRATION (Optional but Recommended)

PhishTank provides community-driven phishing URL verification.

### Step 1: Create Account
1. Go to https://phishtank.org/
2. Click **Register** (top right)
3. Fill in username, email, password
4. Verify your email

### Step 2: Get API Key
1. Log in to PhishTank
2. Go to https://phishtank.org/api_info.php
3. Scroll to **Developer API**
4. Your API key is shown under "Your API Key"
5. If no key, click **Request new API key**

### Step 3: Add to .env
```env
PHISHTANK_KEY="your_phishtank_api_key_here"
```

### Usage Notes
- Rate limit: 1 request per second (be respectful)
- API returns whether URL is in phishing database
- Free tier is sufficient for Trust Scan usage

---

## 10b. GITHUB TOKEN REGISTRATION (Recommended)

GitHub token increases API rate limits from 60/hr to 5,000/hr.

### Step 1: Create Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click **Generate new token** > **Generate new token (classic)**
3. Note/name: `trustscan-api`
4. Expiration: No expiration (or set reminder)
5. Scopes: Check **ONLY** `public_repo` (read-only access to public repos)
   - This is the minimum permission needed

### Step 2: Generate and Copy
1. Click **Generate token**
2. **IMMEDIATELY COPY** the token (starts with `ghp_...`)
3. You won't be able to see it again!

### Step 3: Add to .env
```env
GITHUB_TOKEN="ghp_your_token_here"
```

### Usage Notes
- Token only needs `public_repo` scope
- Used for: Repository stars, forks, contributors, activity
- Higher limits prevent rate limiting during scans

---

## 11. MONITORING & HEALTH CHECKS

### Application Health Endpoint

```bash
curl http://localhost:3000/api/config
```

Returns:
```json
{
  "trustScanAvailable": true  // AI analysis available
}
```

### Docker Health Status

```bash
docker compose ps
```

All services should show `healthy`:
- `trustscan-app`: Application
- `trustscan-tunnel`: Cloudflare

### Log Monitoring

```bash
# All logs
docker compose logs -f

# Application only
docker compose logs -f trustscan

# Errors only
docker compose logs -f trustscan 2>&1 | grep -i error
```

---

## 12. SECURITY CONSIDERATIONS

### Sensitive Data in .env

The following keys are sensitive and should be protected:
- `DATABASE_URL` (database credentials)
- `UPSTASH_REDIS_REST_TOKEN`
- `API_NINJAS_KEY`
- `ABUSEIPDB_KEY`
- `URLHAUS_KEY`
- `CLOUDFLARE_TUNNEL_TOKEN`

### Recommendations

1. **File permissions**: `chmod 600 .env`
2. **Backup tokens**: Store copies in a password manager
3. **Rotate keys**: If compromised, regenerate at provider dashboards
4. **Cloudflare Access**: Optionally add authentication layer via Zero Trust

---

## 13. RATE LIMITING

### Current Configuration (via Upstash Redis)
- **Limit**: 10 requests per minute per IP
- **Algorithm**: Sliding window
- **Fallback**: If Redis unavailable, requests proceed (fail-open)

### Response Headers
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1735344000
```

---

## 14. QUICK REFERENCE

### Environment Variables Summary

| Variable | Required | Current Value |
|----------|----------|---------------|
| `DATABASE_URL` | YES | Neon Cloud |
| `OLLAMA_SERVER_URL` | No | `http://192.168.1.38:11433` |
| `OLLAMA_MODEL` | No | `qwen2.5:latest` |
| `UPSTASH_REDIS_REST_URL` | No | Configured |
| `UPSTASH_REDIS_REST_TOKEN` | No | Configured |
| `API_NINJAS_KEY` | No | Configured |
| `ABUSEIPDB_KEY` | No | Configured |
| `URLHAUS_KEY` | No | Configured |
| `PHISHTANK_KEY` | No | Not set |
| `GITHUB_TOKEN` | No | Not set |

### Ports

| Service | Internal Port | External Port |
|---------|---------------|---------------|
| Trust Scan | 3000 | 3000 |
| Cloudflare Tunnel | N/A | HTTPS via CF |

### URLs (After Deployment)

- **Local**: http://localhost:3000
- **Public**: https://YOUR-SUBDOMAIN.YOUR-DOMAIN.com (via Cloudflare)

---

## 15. TROUBLESHOOTING

### Container won't start
```bash
# Check build/startup logs
docker compose logs trustscan

# Common issues:
# - Missing .env file
# - Invalid environment variable format
# - Port 3000 already in use
```

### Database connection failed
```bash
# Test Neon connection from container
docker compose exec trustscan npx prisma db push

# Check if DATABASE_URL is correctly set
docker compose exec trustscan printenv DATABASE_URL

# Common issues:
# - Neon project paused (free tier auto-pauses after inactivity)
# - Network issues reaching Neon
# - SSL mode not set correctly
```

### Neon Database Paused
If using Neon free tier, database auto-pauses after 5 days of inactivity:
1. Go to https://console.neon.tech/
2. Select your project
3. Database will auto-resume on next connection attempt

### Ollama not responding
```bash
# Test from host machine first
curl http://192.168.1.38:11433/api/tags

# Test from inside container
docker compose exec trustscan wget -qO- http://192.168.1.38:11433/api/tags

# Common issues:
# - Ollama not running on host
# - Firewall blocking port 11433
# - Container can't reach host network (check extra_hosts in compose)
```

### Cloudflare tunnel not connecting
```bash
# Check tunnel logs
docker compose logs cloudflared

# Common issues:
# - Invalid CLOUDFLARE_TUNNEL_TOKEN
# - Tunnel deleted in CF dashboard
# - Token expired or revoked

# Verify tunnel status at:
# https://one.dash.cloudflare.com/ > Networks > Tunnels
```

### Rate limit errors (429)
```bash
# Check Redis connection
docker compose exec trustscan node -e "console.log(process.env.UPSTASH_REDIS_REST_URL)"

# If Redis unreachable, requests proceed without rate limiting
# Check Upstash dashboard for usage/limits
```

### Health check failing
```bash
# Test health endpoint manually
curl -v http://localhost:3000/api/config

# Should return JSON with trustScanAvailable status
```

---

## FILES TO CREATE ON SERVER

```
/opt/trustscan/
├── .env                    # Environment variables (create from Section 3)
├── Dockerfile              # Container build (from repo)
├── docker-compose.yml      # Service orchestration (from repo)
├── next.config.ts          # Already has output: "standalone"
├── package.json            # (from repo)
├── package-lock.json       # (from repo)
├── prisma/
│   └── schema.prisma       # (from repo)
├── src/                    # (from repo)
├── public/                 # (from repo)
└── tsconfig.json           # (from repo)
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Cloudflare account set up with domain
- [ ] Neon database accessible (not paused)
- [ ] Ollama running on 192.168.1.38:11433
- [ ] (Optional) Register for PhishTank API key
- [ ] (Optional) Create GitHub personal access token

### Server Setup
- [ ] Docker and Docker Compose installed
- [ ] Project cloned: `git clone https://github.com/undeadlist/trust-scan.git /opt/trustscan`
- [ ] `.env` file created with all variables
- [ ] Cloudflare tunnel created and token added to `.env`

### Deployment
- [ ] Run `docker compose up -d --build`
- [ ] Run `docker compose exec trustscan npx prisma db push`
- [ ] Verify local: `curl http://localhost:3000/api/config`
- [ ] Verify all containers healthy: `docker compose ps`

### Verification
- [ ] Access public URL via Cloudflare
- [ ] Test a scan (try scanning github.com)
- [ ] Verify AI analysis works (should show "Trust Scan AI" option)
- [ ] Check logs for errors: `docker compose logs -f`

---

## COMPLETE .ENV TEMPLATE

Copy this entire block to your `.env` file:

```env
# ==============================================
# TRUST SCAN PRODUCTION ENVIRONMENT
# ==============================================

# DATABASE (Neon Cloud - REQUIRED)
DATABASE_URL="postgresql://neondb_owner:npg_xrTfdX2jGS5c@ep-bitter-unit-ahcd77jh-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# AI ANALYSIS (Ollama - Your Home Server)
OLLAMA_SERVER_URL="http://192.168.1.38:11433"
OLLAMA_MODEL="qwen2.5:latest"

# CACHING & RATE LIMITING (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://curious-pheasant-55919.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AdpvAAIncDFjNGRjZmUwNmMzZDM0YzU2YTQ2ZmRiNDI1MWFiOWY2MXAxNTU5MTk"

# THREAT INTELLIGENCE APIs
API_NINJAS_KEY="yAgRMxBfP7YrWnZPuuLueg==201c1JTwW69aaBdW"
ABUSEIPDB_KEY="29b0304ff69d0316af2ca6c8270e066c0e4c8394ea4ed6dba61140e0da18e90eb4e53f17684612ab"
URLHAUS_KEY="fe20589db28c9d7ebbdee5eb9a03f78ebeea9931afbc6e30"

# OPTIONAL - Register for these (see Sections 10a and 10b)
PHISHTANK_KEY=""
GITHUB_TOKEN=""

# CLOUDFLARE TUNNEL (get from CF dashboard)
CLOUDFLARE_TUNNEL_TOKEN="your_tunnel_token_here"

# PRODUCTION
NODE_ENV="production"
```

---

## SUPPORT

- **Neon Dashboard**: https://console.neon.tech/
- **Upstash Dashboard**: https://console.upstash.com/
- **Cloudflare Zero Trust**: https://one.dash.cloudflare.com/
- **Project Issues**: https://github.com/undeadlist/trust-scan/issues
