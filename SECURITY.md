# Security Policy

## Reporting a Vulnerability

We take the security of Trust Scan seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please email us at: **contact@undeadlist.com**

Include the following in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Assessment**: We will assess the vulnerability and determine severity
- **Fix**: We will work on a fix and coordinate disclosure
- **Credit**: We will credit you in our release notes (unless you prefer anonymity)

## Scope

### In Scope

The following are in scope for security reports:

- The Trust Scan web application
- API endpoints (`/api/scan`, `/api/analyze`, `/api/config`)
- Authentication and authorization mechanisms
- Data handling and storage
- Third-party integrations we control:
  - Prisma database operations
  - Upstash Redis caching
  - Ollama AI integration

### NOT in Scope

The following are NOT in scope:

- Third-party services we query (not our infrastructure):
  - WHOIS providers
  - Archive.org
  - GitHub API
  - URLhaus, PhishTank, Spamhaus, AbuseIPDB
- Social engineering attacks
- Physical attacks
- Denial of service attacks
- Issues in dependencies (report these to the respective maintainers)

## Supported Versions

We currently support the latest version of Trust Scan. We recommend always running the most recent version.

## Security Best Practices

If you're self-hosting Trust Scan:

1. **Keep dependencies updated**: Run `npm audit` regularly
2. **Secure your environment variables**: Never commit `.env` files
3. **Use HTTPS**: Always serve the application over HTTPS in production
4. **Limit database access**: Restrict PostgreSQL access to necessary users only
5. **Monitor logs**: Watch for unusual scanning activity
6. **Rate limiting**: Ensure Upstash Redis is configured for rate limiting in production
7. **API keys**: Rotate threat intelligence API keys periodically

## Data Handling

Trust Scan handles the following data:

- **URLs submitted for scanning**: Cached for 24 hours, then eligible for cleanup
- **Scan results**: Stored in PostgreSQL, no personal user data collected
- **Threat intelligence cache**: Stored in Redis with TTL (1hr clean, 24hr malicious)

We do not:
- Collect personal information
- Track users
- Share scan data with third parties
- Store API keys or credentials from scanned sites

## Responsible Disclosure

We follow responsible disclosure principles:
- We will not take legal action against researchers who report in good faith
- We will work with researchers to understand and resolve issues
- We will acknowledge researchers in our security advisories

Thank you for helping keep Trust Scan and its users safe!
