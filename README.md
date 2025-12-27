# VibeCheck 🛡️

**Is this app legit? Check before you connect.**

VibeCheck is a URL trust scanner for indie developers. Scan any URL to detect red flags, verify domains, and make informed decisions before connecting your accounts or data.

## Features

### Deterministic Checks
- **WHOIS Analysis** - Domain age, registration details, privacy protection
- **SSL Certificate** - Validity, issuer, expiration
- **Hosting Detection** - Provider identification, free hosting detection
- **HTML Scraping** - Contact pages, privacy policy, terms of service
- **Pattern Matching** - Red flag detection for common scam patterns
- **GitHub Integration** - Repository analysis, activity metrics
- **Archive.org** - Historical snapshots, domain age verification

### Red Flag Detection
- Free hosting + enterprise claims mismatch
- Young domains with funding claims
- Dangerous permission requests
- Unverifiable company claims
- Impossible technical claims
- Missing pricing/documentation
- Generic testimonials

### AI Analysis (BYOK)
- Bring Your Own Key - Gemini API integration
- Client-side analysis for privacy
- Comprehensive trust assessment

## Quick Start

### Prerequisites
- Node.js 20.19+ or 22.12+
- PostgreSQL database
- (Optional) Gemini API key for AI analysis

### Installation

```bash
# Clone and install
cd vibecheck
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
DATABASE_URL="postgresql://user:password@localhost:5432/vibecheck"

# Optional - Enhanced WHOIS data
API_NINJAS_KEY=""

# Optional - Higher GitHub API rate limits
GITHUB_TOKEN=""
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma
- **AI**: Google Gemini (client-side BYOK)

## Project Structure

```
vibecheck/
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
│   ├── app/
│   │   ├── api/scan/route.ts  # Scan API endpoint
│   │   ├── page.tsx           # Main UI
│   │   ├── layout.tsx         # App layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── Scanner.tsx        # URL input form
│   │   ├── Report.tsx         # Scan results display
│   │   ├── KeyInput.tsx       # Gemini API key input
│   │   └── RiskBadge.tsx      # Risk level indicators
│   └── lib/
│       ├── checks/            # Individual check modules
│       │   ├── whois.ts
│       │   ├── ssl.ts
│       │   ├── hosting.ts
│       │   ├── scraper.ts
│       │   ├── patterns.ts
│       │   ├── github.ts
│       │   └── archive.ts
│       ├── scoring.ts         # Risk calculation
│       ├── gemini.ts          # AI integration
│       ├── types.ts           # TypeScript types
│       └── db.ts              # Prisma client
```

## Usage

1. Enter a URL to scan
2. View the risk score and red flags
3. (Optional) Add your Gemini API key for AI analysis
4. Review detailed findings before connecting

## Caching

Results are cached in the database for 24 hours to reduce API calls and improve response times.

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

**Built by [UndeadList.com](https://undeadlist.com)**

*Results are informational only. Always do your own research.*
