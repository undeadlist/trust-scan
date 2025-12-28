# Trust Scan

**Is this app legit? Check before you connect.**

Trust Scan is a free URL security scanner for indie developers and AI builders. Scan any URL to detect red flags, verify domains, and make informed decisions before connecting your accounts or sharing API keys.

Built by [UndeadList.com](https://undeadlist.com)

## Features

### Security Checks

Trust Scan performs 8 comprehensive security checks on every URL:

| Check | Description |
|-------|-------------|
| **WHOIS Analysis** | Domain age, registration details, registrar, privacy protection status |
| **SSL Certificate** | Validity, issuer, expiration date, days remaining |
| **Hosting Detection** | Provider identification, free tier detection, CDN detection |
| **Content Analysis** | Essential pages (privacy policy, terms, contact, docs, pricing) |
| **Pattern Matching** | 40+ patterns for scams, phishing, crypto fraud, and red flags |
| **GitHub Integration** | Repository analysis, stars, forks, contributors, activity |
| **Archive.org** | Historical snapshots, domain age verification |
| **Threat Intelligence** | Multi-source malicious URL detection (see below) |

### Threat Intelligence Sources

Trust Scan queries multiple threat intelligence databases:

- **URLhaus** - Malware and phishing URL database by abuse.ch
- **PhishTank** - Community-driven phishing URL verification
- **Spamhaus** - DNS blocklist lookups for domain reputation
- **AbuseIPDB** - IP reputation scoring (1,000 free lookups/day)

### Red Flag Detection

Detects 40+ suspicious patterns including:

- Phishing indicators (account threats, credential harvesting)
- Crypto scam patterns (airdrops, wallet draining, guaranteed returns)
- Fake urgency tactics (time pressure, termination threats)
- Enterprise claims on free hosting mismatches
- Young domains with funding/scale claims
- Dangerous permission requests (database URLs, write access)
- Clone/impersonation indicators
- Generic testimonials with stock photos

### AI-Powered Analysis

Optional server-side AI analysis using Ollama:

- Context-aware site type detection
- Holistic risk assessment
- False positive identification
- Actionable recommendations
- No user API keys required

### Risk Scoring

Scores range from 0-100 based on trust signals and risk flags:

| Score | Level | Meaning |
|-------|-------|---------|
| 0-25 | Low | Looks legitimate |
| 26-50 | Medium | Some concerns, verify manually |
| 51-75 | High | Multiple red flags detected |
| 76-100 | Critical | Strong scam indicators |

## Quick Start

### Prerequisites

- Node.js 20.18+ or 22.12+
- PostgreSQL database
- (Optional) Ollama server for AI analysis
- (Optional) Upstash Redis for caching and rate limiting

### Installation

```bash
# Clone and install
git clone https://github.com/undeadlist/trust-scan.git
cd trust-scan
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Set up database
npx prisma db push

# Run development server
npm run dev
```

### Environment Variables

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/trustscan"

# Optional - Enhanced WHOIS data
API_NINJAS_KEY=""

# Optional - Higher GitHub API rate limits
GITHUB_TOKEN=""

# Optional - AI Analysis (Ollama)
OLLAMA_SERVER_URL=""
OLLAMA_MODEL="qwen2.5:latest"

# Optional - Caching and Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Optional - Threat Intelligence APIs
PHISHTANK_KEY=""      # PhishTank phishing detection
ABUSEIPDB_KEY=""      # IP reputation (1,000 free/day)
URLHAUS_KEY=""        # URLhaus malware database

# Note: Spamhaus DNS lookups work without an API key
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL + Prisma ORM
- **Caching**: Upstash Redis
- **AI**: Ollama (optional)
- **HTML Parsing**: Cheerio
- **GitHub API**: Octokit

## Project Structure

```
trust-scan/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scan/route.ts   # Main scan endpoint
│   │   │   ├── analyze/route.ts # AI analysis endpoint
│   │   │   └── config/route.ts  # Config endpoint
│   │   ├── about/
│   │   ├── faq/
│   │   ├── how-it-works/
│   │   ├── best-practices/
│   │   ├── site-owners/
│   │   ├── privacy/
│   │   ├── terms/
│   │   ├── page.tsx            # Home/Scanner
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Scanner.tsx
│   │   ├── Report.tsx
│   │   ├── RiskBadge.tsx
│   │   └── layout/
│   └── lib/
│       ├── checks/
│       │   ├── whois.ts
│       │   ├── ssl.ts
│       │   ├── hosting.ts
│       │   ├── scraper.ts
│       │   ├── patterns.ts     # 40+ detection patterns
│       │   ├── github.ts
│       │   ├── archive.ts
│       │   ├── urlhaus.ts      # Threat intelligence
│       │   ├── phishtank.ts    # Phishing detection
│       │   ├── spamhaus.ts     # DNS blocklist
│       │   ├── abuseipdb.ts    # IP reputation
│       │   ├── threat-cache.ts # Redis caching
│       │   └── index.ts
│       ├── scoring.ts          # Risk calculation
│       ├── ai.ts               # AI prompt builder
│       ├── trustscan.ts        # Ollama integration
│       ├── types.ts
│       └── db.ts
```

## Usage

1. Enter a URL to scan
2. View the risk score and detected red flags
3. Review AI-powered analysis (if enabled)
4. Check detailed findings before connecting

## Caching & Rate Limiting

- **Scan results**: Cached in PostgreSQL for 24 hours
- **Threat data**: Cached in Redis (1hr clean, 24hr malicious)
- **Rate limiting**: 10 requests per minute per IP (via Upstash)

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

MIT

---

*Results are informational only. Always do your own research before connecting to any service.*
