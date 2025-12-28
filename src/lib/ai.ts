// Shared AI Provider Infrastructure
import { ScanResult, AIAnalysis, AIProvider } from './types';
import { analyzeWithGemini, isValidGeminiKey } from './gemini';
import { analyzeWithClaude, isValidClaudeKey } from './claude';

// Provider display names and URLs
export const PROVIDER_INFO: Record<AIProvider, { name: string; keyUrl: string; keyUrlLabel: string }> = {
  gemini: {
    name: 'Gemini',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyUrlLabel: 'Google AI Studio',
  },
  claude: {
    name: 'Claude',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyUrlLabel: 'Anthropic Console',
  },
};

// Storage keys for localStorage
export const STORAGE_KEYS = {
  provider: 'vibecheck_ai_provider',
  geminiKey: 'vibecheck_gemini_key',
  claudeKey: 'vibecheck_claude_key',
} as const;

export function getStorageKeyForProvider(provider: AIProvider): string {
  return provider === 'claude' ? STORAGE_KEYS.claudeKey : STORAGE_KEYS.geminiKey;
}

// Check if server has a configured key for provider
export function hasServerKey(provider: AIProvider): boolean {
  if (provider === 'claude') {
    return !!process.env.ANTHROPIC_API_KEY;
  }
  return !!process.env.GEMINI_API_KEY;
}

// Get API key for provider (server key takes priority)
export function getApiKey(provider: AIProvider, clientKey?: string | null): string | null {
  if (provider === 'claude') {
    if (process.env.ANTHROPIC_API_KEY) {
      return process.env.ANTHROPIC_API_KEY;
    }
  } else {
    if (process.env.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
  }
  return clientKey || null;
}

// Validate API key format for provider
export function isValidApiKey(provider: AIProvider, key: string): boolean {
  if (provider === 'claude') {
    return isValidClaudeKey(key);
  }
  return isValidGeminiKey(key);
}

// Main analysis function - routes to appropriate provider
export async function analyzeWithAI(
  provider: AIProvider,
  apiKey: string,
  scanResult: ScanResult
): Promise<AIAnalysis> {
  if (provider === 'claude') {
    return analyzeWithClaude(apiKey, scanResult);
  }
  return analyzeWithGemini(apiKey, scanResult);
}

// Shared prompt builder for all providers
export function buildAnalysisPrompt(scanResult: ScanResult): string {
  const domainAgeDays = scanResult.whoisData?.domainAge ?? null;

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
