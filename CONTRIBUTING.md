# Contributing to Trust Scan

Thank you for your interest in contributing to Trust Scan! We're building a free security tool for indie developers, and community contributions help make it better.

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

When filing a bug report, include:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- The URL you were scanning (if relevant and not sensitive)
- Screenshots if applicable
- Your environment (browser, OS)

### Suggesting Enhancements

We welcome feature suggestions! Please:
- Check existing issues first
- Describe the use case and who would benefit
- Explain why this would be valuable
- Consider the scope (is it broadly useful?)

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** with clear, focused commits
4. **Test your changes**: `npm run build && npm run lint`
5. **Submit a PR** with a clear description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/trust-scan.git
cd trust-scan

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your .env with at minimum:
# - DATABASE_URL (required)
# - Other keys are optional but enhance functionality

# Set up database
npx prisma db push

# Start dev server
npm run dev
```

### Environment Variables

See `.env.example` for all available configuration options:
- `DATABASE_URL` - Required PostgreSQL connection
- `API_NINJAS_KEY` - Optional enhanced WHOIS
- `GITHUB_TOKEN` - Optional higher rate limits
- `OLLAMA_SERVER_URL` / `OLLAMA_MODEL` - Optional AI analysis
- `UPSTASH_REDIS_*` - Optional caching and rate limiting
- `PHISHTANK_KEY`, `ABUSEIPDB_KEY`, `URLHAUS_KEY` - Optional threat intelligence

## Code Style

- Use TypeScript with strict mode
- Follow existing code patterns
- Write meaningful commit messages
- Keep changes focused and atomic
- Test your changes in a browser

## What We're Looking For

### High Priority
- **New detection patterns** - Additional scam/phishing patterns
- **Bug fixes** - Especially false positives/negatives
- **Threat intelligence** - New data sources or improved integrations
- **Performance** - Faster scans, better caching

### Welcome Contributions
- Documentation improvements
- Accessibility enhancements
- UI/UX improvements
- Test coverage
- i18n/localization

### Contribution Areas by Skill

**Security/Research**:
- New red flag patterns in `src/lib/checks/patterns.ts`
- Threat intelligence integrations
- False positive analysis

**Frontend**:
- Component improvements
- Accessibility (a11y)
- Mobile responsiveness
- Dark mode enhancements

**Backend**:
- API optimizations
- Caching strategies
- New check implementations

## What We Probably Won't Accept

- Breaking changes without discussion
- Features that add significant complexity
- Changes that compromise security
- Additions that conflict with our minimalist philosophy
- Dependencies without clear justification

## Project Philosophy

Trust Scan is intentionally simple:
- **Free forever** - No paywalls or premium tiers
- **Privacy-first** - Minimal data collection
- **Fast** - Quick scans with parallel checks
- **Honest** - Clear about limitations

Keep contributions aligned with these principles.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Questions?

Feel free to open an issue for questions or reach out at contact@undeadlist.com.

---

Thank you for helping make Trust Scan better for indie developers!
