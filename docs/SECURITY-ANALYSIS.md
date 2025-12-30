# TrustScan Security Analysis - Full Report

## Executive Summary

TrustScan uses **Qwen 2.5** (via Ollama) for AI-powered scam detection. The system analyzes URLs submitted by users, collecting data from multiple sources, then sends it to Qwen with a detailed security prompt for final risk assessment.

---

## System Architecture

```
User submits URL
        │
        ▼
┌─────────────────────────────────────────┐
│  TrustScan App (trustscan-app:3002)     │
│  - Scrapes website content              │
│  - Checks WHOIS, SSL, hosting           │
│  - Queries threat databases             │
│  - Calculates base risk score           │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  LLM Gateway (llm-gateway-api:3100)     │
│  - Routes to Qwen provider              │
│  - Rate limiting (10 scans/day/IP)      │
│  - Job queue with Redis                 │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  Ollama Qwen (ollama-qwen:11433)        │
│  - Model: qwen2.5:latest                │
│  - GPU-enabled                          │
│  - 60 second timeout                    │
└─────────────────────────────────────────┘
```

---

## The Security Analysis Prompt

### System Role
```
You are a scam detector for indie developers evaluating web apps and services.
```

### Site Classification
The system first classifies the site type to provide context:

| Type | Trigger | Instructions |
|------|---------|--------------|
| DEVELOPER_TOOL | Requests API keys/tokens | "Apply extra scrutiny to credential requests, but note legitimate dev tools do need API keys" |
| CRYPTO_SERVICE | Mentions wallet/airdrop/crypto/web3 | "Apply higher scrutiny for common crypto scam patterns (airdrops, guaranteed returns, wallet drainers)" |
| COMMERCIAL_SERVICE | Has pricing | "Verify business legitimacy indicators (contact info, policies, company registration)" |
| POTENTIAL_CLONE | Mentions "support" or "official" | "Verify it is the real official site and not a phishing clone" |
| GENERAL_WEBSITE | Default | "Standard website evaluation. Apply balanced analysis" |

### Key Detection Rules

#### What IS Suspicious
- Claims of enterprise features on free hosting
- Claims of funding with no verifiable record
- Requests for sensitive credentials (DB URLs, write access)
- Impossible technical claims (auto-rollback without integration)
- No way to contact (no email, no form, no social)
- Generic testimonials with stock photos
- Urgency tactics ("Limited time", "Act now")
- Too-good-to-be-true pricing
- Typos and poor grammar throughout
- Mismatch between claimed scale and infrastructure

#### What is NOT Suspicious
- Using free hosting (Vercel, Netlify) - normal for indie devs
- Being new - everyone starts somewhere
- Privacy-protected WHOIS - industry standard
- No archive history - just means new
- Simple/minimal design - indie aesthetic
- Solo founder - common in indie space
- Payment mentions (Apple Pay, Stripe) - normal commerce
- No GitHub repo - not every company is open source

### Context Rules

#### Domain Age
```
- New domain (<30 days) is a WEAK signal, not definitive
- Many legitimate indie projects launch on new domains
- Only flag as HIGH risk if combined with OTHER red flags
- New domain + missing policies + impossible claims = suspicious
- New domain + has policies + reasonable claims = just new
```

#### Cloud IP Detection
If IP starts with `3.`, `13.`, `15.`, `18.`, `34.`, `35.`, `52.`, `54.`, `76.76.`, `104.`, `172.67.`, `162.159.`:
```
CLOUD HOSTING DETECTED: IP belongs to a major cloud provider.
- AbuseIPDB scores for cloud IPs are UNRELIABLE
- A high abuse score on a cloud IP is NOT evidence the specific site is malicious
- DO NOT flag cloud IP abuse scores as concerning for established sites
```

#### Mature Domain (5+ years)
```
- Scammers do NOT maintain domains for 5+ years - this is a MAJOR trust signal
- Cloud IP abuse on mature domains = FALSE POSITIVE (shared hosting)
- Default to TRUSTWORTHY unless there are CRITICAL threat database hits
```

---

## Data Sources Fed to Qwen

The prompt includes all collected scan data:

| Source | Data Points |
|--------|-------------|
| **WHOIS** | domainAge, registrar, privacyProtected |
| **SSL** | valid, daysRemaining |
| **Hosting** | provider, isFreeHosting, ipAddress |
| **Scraper** | title, hasContactPage, hasPrivacyPolicy, hasTermsOfService, hasPricing, hasDocumentation, socialLinks count, scraperLimited |
| **Red Flags** | severity (HIGH/MEDIUM/LOW), title, description |
| **GitHub** | repoFound, stars |
| **Archive.org** | found, snapshotCount |
| **Threat DB** | isMalicious, threat, tags (from URLhaus) |

---

## Score Calculation

### Base Risk Score (Pre-AI)
- Calculated from automated pattern detection
- Scale: 0-100
- Levels: LOW, MEDIUM, HIGH, CRITICAL

### AI Assessment Output

```json
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "verdict": "TRUSTWORTHY" | "CAUTION" | "SUSPICIOUS" | "AVOID",
  "summary": "One sentence summary",
  "concerns": ["List of specific concerns with context"],
  "positives": ["List of trust signals"],
  "reasoning": "2-3 sentences explaining assessment",
  "falsePositiveCheck": "Note any flags that might be false positives",
  "recommendation": "safe" | "caution" | "avoid"
}
```

### Model Parameters
```javascript
{
  model: "qwen2.5:latest",
  temperature: 0.4,        // Low for consistency
  num_predict: 2048,       // Max tokens
  timeout: 60000           // 60 second timeout
}
```

---

## LLM Gateway Configuration

**File:** `llm-gateway-api` container `/app/dist/config/gateway.config.js`

```javascript
providers: {
  'qwen': {
    type: 'ollama',
    instances: ['http://host.docker.internal:11433'],
    model: 'qwen2.5:latest',
    timeout: 60000,
    maxRetries: 2,
    healthCheckInterval: 30000,
  }
},
apps: {
  'trust-scan': {
    provider: 'qwen',           // Routes to qwen specifically
    dailyLimit: 10,             // 10 scans per day per IP
    priority: 'normal',
    systemPrompt: 'You are a security analyst...'  // Note: This is overridden by the detailed prompt
  }
}
```

---

## API Endpoints

### POST /api/scan
Initial URL scan - collects all data sources

### POST /api/analyze
Sends collected data to Qwen for AI analysis

```javascript
// Request
{ scanResult: { url, domain, whoisData, sslData, hostingData, scraperData, redFlags, ... } }

// Response
{ success: true, analysis: { riskLevel, verdict, summary, concerns, positives, reasoning, ... } }
```

---

## Full Prompt Template

```
You are a scam detector for indie developers evaluating web apps and services.

## YOUR JOB
Determine if this site is likely to be:
- A credential harvesting scam
- A honeypot for API keys
- Vaporware with impossible claims
- Legitimate but new/unestablished
- Legitimate and trustworthy

## IMPORTANT CONTEXT RULES
[Domain Age rules]
[Cloud IP Context]
[Mature Domain Context]
[Company/Customer Claims rules]
[Privacy Protection rules]
[Archive.org History rules]
[Scraper Limitations]
[What IS Suspicious - 10 items]
[What is NOT Suspicious - 8 items]

## SITE TYPE CONTEXT
${siteTypeClassification}

## ENHANCED FALSE POSITIVE RULES
- "verify your email" for signup flows is NORMAL, not phishing
- Developer tools legitimately request API keys - evaluate the CONTEXT
- Payment processors mentioned as OPTIONS are fine
- Only flag claims when the site MAKES the claim
- Tech support pages for real products are legitimate

## THREAT INTELLIGENCE
${threatDatabaseResults}

## SCORING GUIDANCE
- Base risk score from automated scan: ${riskScore}/100 (${riskLevel})
- If automated scan found CRITICAL issues: trust them
- If scan found nothing but something feels wrong: explain reasoning
- New site + no red flags + reasonable claims = likely legitimate

## SCAN DATA
URL: ${url}
Domain: ${domain}
Domain Age: ${domainAge} days
Risk Score: ${riskScore}/100
[WHOIS data]
[SSL data]
[Hosting data]
[Website Content data]
[Red Flags Detected]
[GitHub data]
[Archive.org data]

## RESPONSE FORMAT
Respond with JSON only:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "verdict": "TRUSTWORTHY" | "CAUTION" | "SUSPICIOUS" | "AVOID",
  "summary": "One sentence summary",
  "concerns": ["List of specific concerns"],
  "positives": ["List of trust signals"],
  "reasoning": "2-3 sentences explaining assessment",
  "falsePositiveCheck": "Note any false positives",
  "recommendation": "safe" | "caution" | "avoid"
}

Be fair to new indie projects. New ≠ scam. Evaluate holistically.
```

---

## Container Locations

| Container | Port | Purpose |
|-----------|------|---------|
| `trustscan-app` | 3002 | Main TrustScan Next.js app |
| `llm-gateway-api` | 3100 | LLM routing gateway |
| `llm-gateway-worker` | - | Job processor |
| `llm-gateway-redis` | 6379 | Job queue + rate limiting |
| `ollama-qwen` | 11433 | Qwen 2.5 model |

---

## Key Code Locations (Inside Containers)

- **Security Prompt:** `trustscan-app:/app/.next/server/chunks/node_modules_next_dist_esm_build_templates_app-route_2f6e8818.js`
- **Ollama Provider:** `llm-gateway-api:/app/dist/providers/ollama.js`
- **Gateway Config:** `llm-gateway-api:/app/dist/config/gateway.config.js`
- **Generate API:** `llm-gateway-api:/app/dist/api/generate.js`

---

## Summary

TrustScan's security analysis is a two-stage process:

1. **Automated Scanning:** Collects WHOIS, SSL, hosting, scraped content, threat DB checks, and pattern matching to generate a base risk score

2. **AI Analysis:** Sends all collected data to Qwen 2.5 with a detailed ~2000 word prompt that instructs the model on:
   - Site type classification
   - False positive avoidance (cloud IPs, privacy WHOIS, new domains)
   - What constitutes real vs. perceived risk
   - Balanced evaluation for indie projects

The system is designed to be **fair to legitimate new projects** while catching actual scams. Key emphasis on avoiding false positives from cloud hosting, new domains, and WHOIS privacy - common characteristics of both scams AND legitimate indie projects.
