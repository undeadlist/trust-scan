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

### Scope

The following are in scope:
- The Trust Scan web application
- API endpoints
- Third-party integrations

The following are NOT in scope:
- Third-party services we query (WHOIS, Archive.org, etc.)
- Social engineering attacks
- Physical attacks

## Supported Versions

We currently support the latest version of Trust Scan. We recommend always running the most recent version.

## Security Best Practices

If you're self-hosting Trust Scan:

1. **Keep dependencies updated**: Run `npm audit` regularly
2. **Secure your environment variables**: Never commit `.env` files
3. **Use HTTPS**: Always serve the application over HTTPS in production
4. **Limit access**: Restrict database access to necessary users
5. **Monitor logs**: Watch for unusual activity

## Responsible Disclosure

We follow responsible disclosure principles:
- We will not take legal action against researchers who report in good faith
- We will work with researchers to understand and resolve issues
- We will acknowledge researchers in our security advisories

Thank you for helping keep Trust Scan and its users safe!
