# Trust Scan

**Is this app legit? Check before you connect.**

Trust Scan is a free URL trust scanner for indie developers. Scan any URL to detect red flags, verify domains, and make informed decisions before connecting your accounts or data.

Built by [UndeadList.com](https://undeadlist.com)

## Features

### Security Checks
- **WHOIS Analysis** - Domain age, registration details, privacy protection
- **SSL Certificate** - Validity, issuer, expiration
- **Hosting Detection** - Provider identification, free hosting detection
- **HTML Scraping** - Contact pages, privacy policy, terms of service
- **Pattern Matching** - 40+ patterns for phishing, scams, and red flags
- **GitHub Integration** - Repository analysis, activity metrics
- **Archive.org** - Historical snapshots, domain age verification
- **Threat Intelligence** - URLhaus malware/phishing database lookups

### Red Flag Detection
- Phishing indicators (account threats, credential requests)
- Crypto scam patterns (airdrops, wallet draining, guaranteed returns)
- Fake urgency tactics (time pressure, termination threats)
- Free hosting + enterprise claims mismatch
- Young domains with funding claims
- Dangerous permission requests
- Clone/impersonation indicators
- Malware download prompts

### AI Analysis
- **Trust Scan AI** - Server-side AI analysis (no API keys required)
- Contextual claim verification
- Holistic risk assessment
- Actionable recommendations

## Quick Start

### Prerequisites
- Node.js 20.19+ or 22.12+
- PostgreSQL database
- (Optional) Ollama server with Trust Scan AI for AI analysis

### Installation

```bash
# Clone and install
cd trust-scan
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

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

# Optional - Trust Scan AI (Ollama server for AI analysis)
OLLAMA_SERVER_URL=""
OLLAMA_MODEL="ikiru/Dolphin-Mistral-24B-Venice-Edition:latest"

# Optional - Upstash Redis for threat data caching
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma
- **AI**: Ollama (Trust Scan AI)
- **Threat Intel**: URLhaus (abuse.ch)
- **Caching**: Upstash Redis

## Project Structure

```
trust-scan/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scan/route.ts    # Scan API endpoint
│   │   │   ├── analyze/route.ts # AI analysis endpoint
│   │   │   └── config/route.ts  # Config endpoint
│   │   ├── about/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── how-it-works/page.tsx
│   │   ├── best-practices/page.tsx
│   │   ├── site-owners/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── page.tsx             # Home/Scanner
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Scanner.tsx
│   │   ├── Report.tsx
│   │   ├── AIKeySection.tsx
│   │   ├── RiskBadge.tsx
│   │   ├── layout/
│   │   └── content/
│   └── lib/
│       ├── checks/
│       │   ├── whois.ts
│       │   ├── ssl.ts
│       │   ├── hosting.ts
│       │   ├── scraper.ts
│       │   ├── patterns.ts      # 40+ detection patterns
│       │   ├── github.ts
│       │   ├── archive.ts
│       │   ├── urlhaus.ts       # Threat intelligence
│       │   └── threat-cache.ts  # Redis caching
│       ├── scoring.ts
│       ├── ai.ts
│       ├── trustscan.ts         # Ollama integration
│       ├── types.ts
│       └── db.ts
```

## Usage

1. Enter a URL to scan
2. View the risk score and red flags
3. Review AI-powered analysis (automatic)
4. Check detailed findings before connecting

## Caching

- **Scan results**: Cached in PostgreSQL for 24 hours
- **Threat data**: Cached in Upstash Redis (1hr clean, 24hr malicious)

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npx tsc --noEmit
```

## License

MIT

---

*Results are informational only. Always do your own research.*
