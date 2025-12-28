// Trust Scan AI Analysis Infrastructure
import { ScanResult } from './types';

// Check if Trust Scan LLM (Ollama) is available
export function hasTrustScanServer(): boolean {
  return !!process.env.OLLAMA_SERVER_URL;
}

// Site type detection for context-aware analysis
function detectSiteType(scanResult: ScanResult): string {
  const { scraperData, patternsData } = scanResult;

  // Check for developer tool indicators
  if (scraperData?.permissionsRequested?.some(p =>
    p.toLowerCase().includes('api') ||
    p.toLowerCase().includes('key') ||
    p.toLowerCase().includes('token')
  )) {
    return 'DEVELOPER_TOOL - This site requests API keys/tokens. Apply extra scrutiny to credential requests, but note that legitimate dev tools do need API keys.';
  }

  // Check for crypto/web3 indicators
  if (patternsData?.matches?.some(m =>
    m.category === 'dangerous_permissions' && m.matched.toLowerCase().includes('wallet')
  ) || patternsData?.matches?.some(m =>
    m.matched.toLowerCase().includes('airdrop') ||
    m.matched.toLowerCase().includes('crypto') ||
    m.matched.toLowerCase().includes('web3')
  )) {
    return 'CRYPTO_SERVICE - This site involves cryptocurrency/Web3. Apply higher scrutiny for common crypto scam patterns (airdrops, guaranteed returns, wallet drainers).';
  }

  // Check for commercial service
  if (scraperData?.hasPricing) {
    return 'COMMERCIAL_SERVICE - This is a paid service. Verify business legitimacy indicators (contact info, policies, company registration).';
  }

  // Check for support/helpdesk clone patterns
  if (patternsData?.matches?.some(m =>
    m.description.includes('support') || m.description.includes('official')
  )) {
    return 'POTENTIAL_CLONE - Site may be impersonating an official service. Verify it is the real official site and not a phishing clone.';
  }

  return 'GENERAL_WEBSITE - Standard website evaluation. Apply balanced analysis.';
}

// Shared prompt builder for Trust Scan LLM
export function buildAnalysisPrompt(scanResult: ScanResult): string {
  const domainAgeDays = scanResult.whoisData?.domainAge ?? null;
  const siteType = detectSiteType(scanResult);

  return `You are a scam detector for indie developers evaluating web apps and services.

## YOUR JOB
Determine if this site is likely to be:
- A credential harvesting scam
- A honeypot for API keys
- Vaporware with impossible claims
- Legitimate but new/unestablished
- Legitimate and trustworthy

## IMPORTANT CONTEXT RULES

### Domain Age
- New domain (<30 days) is a WEAK signal, not definitive
- Many legitimate indie projects launch on new domains
- Only flag as HIGH risk if combined with OTHER red flags
- New domain + missing policies + impossible claims = suspicious
- New domain + has policies + reasonable claims = just new

### Company/Customer Claims
- Only flag if site explicitly claims "X is our customer" or "Used by X"
- DO NOT flag mentions of:
  - Payment processors (Apple Pay, Google Pay, Stripe)
  - Platform names in context (App Store, Google Play)
  - Technologies (uses Apple's framework, built with...)
  - Marketplace listings that mention brands
  - Social login options (Sign in with Google/Apple)
- "Trusted by Apple" = RED FLAG
- "Accepts Apple Pay" = NOT A FLAG

### Privacy Protection (WHOIS)
- Privacy protection is NORMAL and COMMON
- Most legitimate businesses use it
- Only flag if combined with other issues
- NOT a red flag on its own

### Archive.org History
- No history just means the site is new
- Only matters if site claims to be established
- "Founded in 2020" + no archive = suspicious
- New site + no archive = expected

### Scraper Limitations
${scanResult.scraperData?.scraperLimited ? '⚠️ SCRAPER WAS LIMITED - the site may be JavaScript-heavy and some data could not be extracted. Do not flag missing pages as suspicious.' : 'Scraper completed successfully.'}

### What IS Suspicious
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

### What is NOT Suspicious
- Using free hosting (Vercel, Netlify) - normal for indie devs
- Being new - everyone starts somewhere
- Privacy-protected WHOIS - industry standard
- No archive history - just means new
- Simple/minimal design - indie aesthetic
- Solo founder - common in indie space
- Payment mentions (Apple Pay, Stripe) - normal commerce
- No GitHub repo - not every company is open source

## SITE TYPE CONTEXT
${siteType}

## ENHANCED FALSE POSITIVE RULES
- "verify your email" for signup flows is NORMAL, not phishing
- Developer tools legitimately request API keys - evaluate the CONTEXT of the request
- Payment processors mentioned as OPTIONS (Apple Pay, Stripe checkout) are fine
- Only flag claims when the site MAKES the claim, not when it just MENTIONS a company
- Tech support pages for real products are legitimate - only flag if suspicious

## THREAT INTELLIGENCE
${scanResult.threatData?.isMalicious
  ? `⚠️ CRITICAL: This URL was found in threat databases! Threat: ${scanResult.threatData.threat || 'malware'}${scanResult.threatData.tags?.length ? `. Tags: ${scanResult.threatData.tags.join(', ')}` : ''}`
  : 'No matches found in URLhaus threat database (good sign)'}

## SCORING GUIDANCE
- Base risk score from automated scan: ${scanResult.riskScore}/100 (${scanResult.riskLevel})
- If automated scan found CRITICAL issues: These are usually accurate, trust them
- If scan found nothing but something feels wrong: Explain your reasoning clearly
- New site + no red flags + reasonable claims = likely legitimate indie project
- Trust the pattern detection for obvious scam language

## SCAN DATA
URL: ${scanResult.url}
Domain: ${scanResult.domain}
Domain Age: ${domainAgeDays !== null ? `${domainAgeDays} days` : 'Unknown'}
Risk Score: ${scanResult.riskScore}/100 (${scanResult.riskLevel})
Scan Confidence: ${scanResult.scanConfidence}
${scanResult.scanNotes.length > 0 ? `Scan Notes: ${scanResult.scanNotes.join(', ')}` : ''}

### WHOIS:
${scanResult.whoisData ? JSON.stringify({
  domainAge: scanResult.whoisData.domainAge,
  registrar: scanResult.whoisData.registrar,
  privacyProtected: scanResult.whoisData.privacyProtected,
}, null, 2) : 'Not available'}

### SSL: ${scanResult.sslData?.valid ? 'Valid' : 'Invalid/Not checked'}
${scanResult.sslData?.daysRemaining ? `Days until expiry: ${scanResult.sslData.daysRemaining}` : ''}

### Hosting: ${scanResult.hostingData?.provider || 'Unknown'}
${scanResult.hostingData?.isFreeHosting ? '(Free hosting tier)' : ''}

### Website Content:
${scanResult.scraperData ? JSON.stringify({
  title: scanResult.scraperData.title,
  hasContact: scanResult.scraperData.hasContactPage,
  hasPrivacy: scanResult.scraperData.hasPrivacyPolicy,
  hasTerms: scanResult.scraperData.hasTermsOfService,
  hasPricing: scanResult.scraperData.hasPricing,
  hasDocs: scanResult.scraperData.hasDocumentation,
  socialLinks: scanResult.scraperData.socialLinks.length,
  scraperLimited: scanResult.scraperData.scraperLimited,
}, null, 2) : 'Not available'}

### Red Flags Detected:
${scanResult.redFlags.length > 0
  ? scanResult.redFlags.map(f => `- [${f.severity.toUpperCase()}] ${f.title}: ${f.description}`).join('\n')
  : 'No red flags detected'}

### GitHub: ${scanResult.githubData?.repoFound ? `Found - ${scanResult.githubData.stars} stars` : 'No repository found (this is fine for non-dev companies)'}

### Archive.org: ${scanResult.archiveData?.found ? `${scanResult.archiveData.snapshotCount} snapshots` : 'No history (just means site is new)'}

---

## RESPONSE FORMAT
Respond with JSON only:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "verdict": "TRUSTWORTHY" | "CAUTION" | "SUSPICIOUS" | "AVOID",
  "summary": "One sentence summary",
  "concerns": ["List of specific concerns with context"],
  "positives": ["List of trust signals"],
  "reasoning": "2-3 sentences explaining your assessment",
  "falsePositiveCheck": "Note any flags that might be false positives",
  "recommendation": "safe" | "caution" | "avoid"
}

Be fair to new indie projects. New ≠ scam. Evaluate holistically.`;
}
