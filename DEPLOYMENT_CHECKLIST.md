# Trust Scan - Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Environment
- [ ] `.env` file created from `.env.example`
- [ ] `DATABASE_URL` configured with valid PostgreSQL connection
- [ ] File permissions set: `chmod 600 .env`
- [ ] All required API keys added (if using optional features)

### Database
- [ ] PostgreSQL database is accessible
- [ ] Database is not paused (Neon free tier auto-pauses after 5 days)
- [ ] Connection string includes SSL mode for cloud databases

### Docker
- [ ] Docker Engine 24+ installed
- [ ] Docker Compose v2 installed
- [ ] Sufficient disk space (minimum 2GB free)
- [ ] Port 3002 (or configured port) is available

### Optional Services
- [ ] Ollama server running and accessible (for AI analysis)
- [ ] Upstash Redis configured (for rate limiting)
- [ ] Cloudflare tunnel token ready (for public access)

## Deployment Steps

1. **Clone and configure**
   ```bash
   git clone https://github.com/undeadlist/trust-scan.git
   cd trust-scan
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Build and start**
   ```bash
   docker compose up -d --build
   ```

3. **Initialize database**
   ```bash
   docker compose exec trustscan npx prisma db push
   ```

4. **Verify health**
   ```bash
   curl http://localhost:3002/api/config
   # Expected: {"trustScanAvailable":true} or {"trustScanAvailable":false}
   ```

## Post-Deployment Verification

- [ ] Application responds at `http://localhost:3002`
- [ ] Health check passes: `docker compose ps` shows "healthy"
- [ ] Test scan works (try scanning `github.com`)
- [ ] Logs show no errors: `docker compose logs -f trustscan`
- [ ] Rate limiting works (if Upstash configured)
- [ ] AI analysis works (if Ollama configured)

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Container won't start | Check logs: `docker compose logs trustscan` |
| Database connection failed | Verify DATABASE_URL, check if DB is paused |
| Port already in use | Change port in `docker-compose.yml` or stop conflicting service |
| Health check failing | Wait 30s for startup, check `/api/config` manually |
| Ollama not working | Verify OLLAMA_SERVER_URL is reachable from container |

## Updating

```bash
git pull origin main
docker compose up -d --build
docker compose exec trustscan npx prisma db push  # If schema changed
```

## Security Reminders

- Never commit `.env` files to git
- Rotate API keys regularly
- Monitor logs for suspicious activity
- Keep dependencies updated (Dependabot PRs)
