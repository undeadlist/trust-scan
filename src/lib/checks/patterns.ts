import { PatternsData, PatternMatch, RedFlagCategory } from '../types';

interface PatternRule {
  pattern: RegExp;
  category: RedFlagCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  unless?: RegExp[];  // Don't flag if these also match (reduces false positives)
  onlyIf?: RegExp[];  // Only flag if these also match (adds context requirement)
}

// Red flag detection patterns
const PATTERN_RULES: PatternRule[] = [
  // Enterprise claims + indicators of small operation
  {
    pattern: /enterprise[- ]grade|enterprise[- ]level|fortune 500|trusted by.*companies/i,
    category: 'free_hosting_enterprise',
    severity: 'high',
    description: 'Claims enterprise-level service',
  },
  {
    pattern: /bank[- ]level security|military[- ]grade encryption/i,
    category: 'impossible_claims',
    severity: 'high',
    description: 'Makes unverifiable security claims',
  },

  // Funding and financial claims
  {
    pattern: /raised \$?\d+[mk]|funded by|backed by.*investors|series [a-d] funding/i,
    category: 'young_domain_funding',
    severity: 'medium',
    description: 'Claims significant funding',
  },
  {
    pattern: /y combinator|yc [ws]\d{2}|techstars|500 startups/i,
    category: 'young_domain_funding',
    severity: 'medium',
    description: 'Claims accelerator participation',
  },

  // Impossible technical claims
  {
    pattern: /100% (secure|safe|guaranteed|uptime)/i,
    category: 'impossible_claims',
    severity: 'high',
    description: 'Makes impossible guarantees',
  },
  {
    pattern: /unhackable|unbreakable|impossible to (hack|crack|breach)/i,
    category: 'impossible_claims',
    severity: 'critical',
    description: 'Claims impossible security',
  },
  {
    pattern: /never (been hacked|experienced.*breach)|zero.*breaches/i,
    category: 'impossible_claims',
    severity: 'medium',
    description: 'Makes unverifiable security history claims',
  },
  {
    pattern: /ai[- ]powered|using (gpt|chatgpt|openai|artificial intelligence)/i,
    category: 'suspicious_patterns',
    severity: 'low',
    description: 'AI buzzword usage (verify actual implementation)',
  },
  {
    pattern: /blockchain[- ]based|web3|decentralized|crypto/i,
    category: 'suspicious_patterns',
    severity: 'low',
    description: 'Blockchain/Web3 buzzwords (verify necessity)',
  },

  // Unverifiable company claims
  {
    pattern: /trusted by (millions|thousands|hundreds of thousands)/i,
    category: 'unverifiable_company',
    severity: 'medium',
    description: 'Claims large user base without evidence',
  },
  {
    pattern: /used by.*google|facebook|microsoft|amazon|apple/i,
    category: 'unverifiable_company',
    severity: 'high',
    description: 'Claims major tech company as customer',
    unless: [
      /apple\s*pay/i,
      /google\s*pay/i,
      /pay\s*with\s*(apple|google)/i,
      /sign\s*in\s*with\s*(apple|google|facebook|microsoft)/i,
      /(available\s*on|download\s*(on|from))\s*(the\s*)?(app\s*store|google\s*play)/i,
      /app\s*store|google\s*play|microsoft\s*store/i,
      /apple\s*tv|apple\s*watch|apple\s*music/i,
      /amazon\s*(prime|alexa|echo|aws|web\s*services)/i,
      /facebook\s*(login|pixel|sdk)/i,
      /microsoft\s*(azure|365|office|teams)/i,
      /google\s*(analytics|cloud|maps|ads|adsense)/i,
    ],
  },
  {
    pattern: /featured (in|on).*forbes|techcrunch|wired|verge/i,
    category: 'unverifiable_company',
    severity: 'medium',
    description: 'Claims media coverage (verify links)',
  },
  {
    pattern: /award[- ]winning|best\s+\w+\s+(of\s+)?\d{4}|#1 rated/i,
    category: 'unverifiable_company',
    severity: 'low',
    description: 'Claims awards without specifics',
  },

  // Urgency and pressure tactics
  {
    pattern: /limited time|act now|don't miss|hurry|expires soon/i,
    category: 'suspicious_patterns',
    severity: 'medium',
    description: 'Uses urgency tactics',
  },
  {
    pattern: /only \d+ (spots|seats|slots) left/i,
    category: 'suspicious_patterns',
    severity: 'medium',
    description: 'Creates artificial scarcity',
  },
  {
    pattern: /exclusive (access|offer)|vip|early (access|bird)/i,
    category: 'suspicious_patterns',
    severity: 'low',
    description: 'Uses exclusivity marketing',
  },

  // Money-related red flags
  {
    pattern: /get rich|make money (fast|quick)|passive income|financial freedom/i,
    category: 'suspicious_patterns',
    severity: 'critical',
    description: 'Get-rich-quick language',
  },
  {
    pattern: /guaranteed (returns|profit|income)|risk[- ]free (investment|return)/i,
    category: 'impossible_claims',
    severity: 'critical',
    description: 'Guarantees financial returns',
  },

  // Credential harvesting indicators
  {
    pattern: /connect (your )?(bank|paypal|venmo|crypto wallet)/i,
    category: 'dangerous_permissions',
    severity: 'high',
    description: 'Requests financial account connection',
  },
  {
    pattern: /enter (your )?(ssn|social security|tax id|ein)/i,
    category: 'dangerous_permissions',
    severity: 'critical',
    description: 'Requests sensitive identification',
  },
  {
    pattern: /api[- ]key|secret[- ]key|access[- ]token/i,
    category: 'dangerous_permissions',
    severity: 'low',  // Reduced - normal for developer tools
    description: 'Requests API credentials',
    unless: [/developer/i, /documentation/i, /api reference/i, /sdk/i, /docs/i, /getting started/i],
  },

  // OAuth/Permission scams
  {
    pattern: /grant (full |all )?access|authorize (all|full)/i,
    category: 'dangerous_permissions',
    severity: 'high',
    description: 'Requests broad authorization',
  },

  // Missing legitimacy indicators
  {
    pattern: /contact.*@gmail\.com|contact.*@yahoo\.com|contact.*@hotmail\.com/i,
    category: 'unverifiable_company',
    severity: 'medium',
    description: 'Uses free email for business contact',
  },

  // Testimonial red flags
  {
    pattern: /verified (user|buyer|customer|review)/i,
    category: 'generic_testimonials',
    severity: 'low',
    description: 'Uses unverifiable "verified" labels',
  },

  // === PHISHING INDICATORS ===
  {
    pattern: /verify your (account|identity|payment|information)/i,
    category: 'suspicious_patterns',
    severity: 'high',  // Reduced from critical - context matters
    description: 'Phishing verification language',
    unless: [/sign up/i, /create account/i, /register/i, /new user/i, /welcome/i],  // Normal during signup
  },
  {
    pattern: /account (has been |is )?(suspended|limited|restricted|locked)/i,
    category: 'suspicious_patterns',
    severity: 'high',
    description: 'Account threat language',
  },
  {
    pattern: /confirm your (details|identity|credentials)/i,
    category: 'suspicious_patterns',
    severity: 'high',
    description: 'Credential confirmation request',
  },
  {
    pattern: /unusual (activity|login|sign-?in) detected/i,
    category: 'suspicious_patterns',
    severity: 'high',
    description: 'Fake security alert',
  },
  {
    pattern: /update your (payment|billing|card) (info|information|details)/i,
    category: 'dangerous_permissions',
    severity: 'high',
    description: 'Payment update request',
  },
  {
    pattern: /re-?enter your (password|credentials|login)/i,
    category: 'dangerous_permissions',
    severity: 'critical',
    description: 'Credential re-entry request',
  },

  // === CRYPTO SCAMS ===
  {
    pattern: /airdrop|free (tokens?|coins?|crypto|nft)/i,
    category: 'suspicious_patterns',
    severity: 'high',
    description: 'Crypto airdrop language',
  },
  {
    pattern: /connect (your )?wallet|web3 (login|connect)/i,
    category: 'dangerous_permissions',
    severity: 'medium',  // Reduced - normal for legitimate crypto services
    description: 'Wallet connection request',
    unless: [/ethereum/i, /metamask/i, /coinbase/i, /ledger/i, /trust wallet/i, /rainbow/i],
  },
  {
    pattern: /0x[a-fA-F0-9]{40}/,
    category: 'suspicious_patterns',
    severity: 'medium',
    description: 'Ethereum wallet address found',
  },
  {
    pattern: /claim your (tokens?|rewards?|crypto|nft)/i,
    category: 'suspicious_patterns',
    severity: 'high',
    description: 'Crypto claim language',
  },
  {
    pattern: /guaranteed (roi|returns?|profits?|apy)/i,
    category: 'impossible_claims',
    severity: 'critical',
    description: 'Guaranteed crypto returns',
  },
  {
    pattern: /double your (crypto|bitcoin|eth|money)/i,
    category: 'impossible_claims',
    severity: 'critical',
    description: 'Crypto doubling scam',
  },
  {
    pattern: /send.*receive.*double|2x your/i,
    category: 'impossible_claims',
    severity: 'critical',
    description: 'Doubling/multiplier scam',
  },

  // === FAKE URGENCY ===
  {
    pattern: /your (account|order|subscription) will be (closed|cancelled|terminated)/i,
    category: 'suspicious_patterns',
    severity: 'high',
    description: 'Termination threat',
  },
  {
    pattern: /within \d+\s*(hours?|minutes?)|immediate action required/i,
    category: 'suspicious_patterns',
    severity: 'medium',
    description: 'Artificial time pressure',
  },
  {
    pattern: /last (chance|warning|notice)/i,
    category: 'suspicious_patterns',
    severity: 'medium',
    description: 'Last chance pressure',
  },
  {
    pattern: /act (now|immediately|fast) (or|before)/i,
    category: 'suspicious_patterns',
    severity: 'medium',
    description: 'Urgency language',
  },
  {
    pattern: /offer expires|deal ends|sale ends/i,
    category: 'suspicious_patterns',
    severity: 'low',
    description: 'Time-limited offer pressure',
  },

  // === CLONE/IMPERSONATION ===
  {
    pattern: /official (support|helpdesk|help desk)/i,
    category: 'unverifiable_company',
    severity: 'medium',
    description: 'Claims official support status',
  },
  {
    pattern: /(customer|technical) support (portal|center|desk)/i,
    category: 'suspicious_patterns',
    severity: 'low',
    description: 'Support portal language',
  },
  {
    pattern: /authorized (dealer|reseller|partner)/i,
    category: 'unverifiable_company',
    severity: 'medium',
    description: 'Claims authorized status',
  },
  {
    pattern: /official website|official site/i,
    category: 'suspicious_patterns',
    severity: 'low',
    description: 'Claims to be official site',
  },

  // === DOWNLOAD RISKS ===
  {
    pattern: /download (now|free|here).*\.(exe|msi|dmg|apk)/i,
    category: 'dangerous_permissions',
    severity: 'critical',
    description: 'Prompts executable download',
  },
  {
    pattern: /install (this|our) (extension|plugin|add-?on|app)/i,
    category: 'dangerous_permissions',
    severity: 'medium',
    description: 'Prompts software installation',
  },
  {
    pattern: /your (computer|device|system) (is|has been) (infected|compromised)/i,
    category: 'suspicious_patterns',
    severity: 'critical',
    description: 'Fake malware warning',
  },
  {
    pattern: /call (this number|us now|immediately)/i,
    category: 'suspicious_patterns',
    severity: 'high',
    description: 'Tech support scam language',
  },
];

// AI services that are commonly impersonated - domains containing these that aren't official are suspicious
const AI_SERVICE_IMPERSONATORS = [
  { keyword: 'chatgpt', official: ['chatgpt.com', 'chat.openai.com', 'openai.com'] },
  { keyword: 'chat-gpt', official: [] },  // Hyphenated version is always suspicious
  { keyword: 'openai', official: ['openai.com'] },
  { keyword: 'midjourney', official: ['midjourney.com'] },
  { keyword: 'claude', official: ['claude.ai', 'anthropic.com'] },
  { keyword: 'gemini', official: ['gemini.google.com'] },
  { keyword: 'copilot', official: ['copilot.microsoft.com', 'github.com'] },
  { keyword: 'bard', official: ['bard.google.com'] },
  { keyword: 'gpt-4', official: ['openai.com'] },
  { keyword: 'gpt4', official: ['openai.com'] },
  { keyword: 'dall-e', official: ['openai.com'] },
  { keyword: 'dalle', official: ['openai.com'] },
  { keyword: 'sora', official: ['openai.com'] },
];

// Suspicious generic AI domain patterns (lower confidence than specific impersonators)
const SUSPICIOUS_AI_DOMAIN_PATTERNS = [
  /^ai-?pro\./i,           // ai-pro.* domains
  /^ai-?[a-z]+-?ai\./i,    // ai-something-ai.* domains
  /-ai-?(pro|premium|plus|free)\./i,  // *-ai-pro.*, *-ai-free.* etc.
];

// Suspicious TLDs commonly used in scam/phishing sites
const SUSPICIOUS_TLDS = ['.online', '.top', '.xyz', '.site', '.click', '.link', '.work', '.fun', '.icu'];

// Suspicious suffixes in domain names (especially combined with AI service names)
const SUSPICIOUS_DOMAIN_SUFFIXES = ['-pc', '-pro', '-go', '-app', '-free', '-download', '-official', '-support'];

// Suspicious keywords commonly found in scam domain names
const SUSPICIOUS_DOMAIN_KEYWORDS = [
  // Obvious scam indicators
  'scam', 'legit', 'real', 'official', 'verify',
  // Money-related
  'free-money', 'freemoney', 'free-cash', 'freecash', 'instant-cash',
  'get-rich', 'getrich', 'make-money', 'makemoney', 'easy-money',
  // Crypto scam keywords
  'crypto-free', 'free-crypto', 'airdrop', 'double-your', 'doubleyour',
  'guaranteed-profit', 'guaranteed-returns', 'free-btc', 'free-eth',
  // Trust manipulation
  'trust-me', 'trustme', 'definitely-not', 'definitelynot', 'totally-real',
  'legit-not-scam', 'not-a-scam', 'notascam', 'safe-and-secure',
  // Urgency indicators
  'limited-time', 'act-now', 'dont-miss', 'last-chance',
  // Impersonation attempts
  'official-support', 'helpdesk-login', 'account-verify', 'secure-login',
];

// Check domain name for suspicious keywords
export function checkDomainKeywords(domain: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const lowerDomain = domain.toLowerCase();

  // Extract just the main domain (without subdomains) for TLD checking
  const domainParts = lowerDomain.split('.');
  const tld = '.' + domainParts[domainParts.length - 1];
  const fullDomainForCheck = domainParts.slice(-2).join('.'); // e.g., "example.com"

  // === AI SERVICE IMPERSONATOR DETECTION ===
  // This is the highest priority check - catches ChatGPT, OpenAI, Midjourney impersonators
  // Check full domain including subdomains (e.g., pay.chatgpt-oracle.com should detect "chatgpt")
  for (const service of AI_SERVICE_IMPERSONATORS) {
    // Check if domain contains the AI service keyword (anywhere in the full domain)
    if (lowerDomain.includes(service.keyword)) {
      // Check if this is an official domain
      // An official domain is one that exactly matches or is a subdomain of an official domain
      const isOfficial = service.official.some(official => {
        const normalizedOfficial = official.toLowerCase();
        return lowerDomain === normalizedOfficial ||
               lowerDomain.endsWith('.' + normalizedOfficial) ||
               // Also check if the main domain (without subdomains) is official
               fullDomainForCheck === normalizedOfficial;
      });

      if (!isOfficial) {
        // Check for especially dangerous patterns: -pc suffix (documented malware delivery)
        const hasPcSuffix = lowerDomain.includes('-pc');

        // Check for suspicious TLD
        const hasSuspiciousTLD = SUSPICIOUS_TLDS.includes(tld);

        // AI impersonation is ALWAYS critical severity
        // Scammers can have valid SSL certs and archive history, so this must outweigh positive signals
        const severity: 'low' | 'medium' | 'high' | 'critical' = 'critical';
        let description = `Domain impersonates ${service.keyword.toUpperCase()} (not an official domain)`;

        if (hasPcSuffix) {
          description = `MALWARE RISK: Domain impersonates ${service.keyword.toUpperCase()} with "-pc" suffix (known malware distribution pattern)`;
        } else if (hasSuspiciousTLD) {
          description = `Domain impersonates ${service.keyword.toUpperCase()} on suspicious TLD (${tld})`;
        }

        matches.push({
          pattern: `ai-impersonator-${service.keyword}`,
          category: 'suspicious_patterns',
          severity,
          description,
          matched: domain,
        });
        break; // Only add one AI impersonator match per domain
      }
    }
  }

  // === SUSPICIOUS AI DOMAIN PATTERNS ===
  // Check for generic suspicious AI domain patterns like ai-pro.org
  for (const pattern of SUSPICIOUS_AI_DOMAIN_PATTERNS) {
    if (pattern.test(lowerDomain)) {
      matches.push({
        pattern: `suspicious-ai-pattern`,
        category: 'suspicious_patterns',
        severity: 'high',
        description: 'Domain matches suspicious AI-related naming pattern',
        matched: domain,
      });
      break; // Only add one match
    }
  }

  // === SUSPICIOUS TLD CHECK ===
  // Flag domains on known suspicious TLDs (even without AI keywords)
  if (SUSPICIOUS_TLDS.includes(tld)) {
    // Only flag if there are other suspicious indicators or it's a particularly bad TLD
    const veryBadTLDs = ['.top', '.click', '.icu'];
    if (veryBadTLDs.includes(tld)) {
      matches.push({
        pattern: `suspicious-tld-${tld}`,
        category: 'suspicious_patterns',
        severity: 'medium',
        description: `Domain uses suspicious TLD (${tld}) commonly associated with scam sites`,
        matched: domain,
      });
    }
  }

  // === SUSPICIOUS SUFFIX CHECK ===
  // Check for dangerous suffixes like -pc, -download, etc.
  for (const suffix of SUSPICIOUS_DOMAIN_SUFFIXES) {
    if (lowerDomain.includes(suffix)) {
      // -pc is especially dangerous (documented malware pattern)
      const severity = suffix === '-pc' ? 'high' : 'medium';
      matches.push({
        pattern: `suspicious-suffix-${suffix}`,
        category: 'suspicious_patterns',
        severity,
        description: suffix === '-pc'
          ? `Domain contains "${suffix}" suffix (common in malware distribution sites)`
          : `Domain contains suspicious suffix "${suffix}"`,
        matched: domain,
      });
      break; // Only flag one suffix
    }
  }

  // === ORIGINAL KEYWORD CHECKS ===
  for (const keyword of SUSPICIOUS_DOMAIN_KEYWORDS) {
    if (lowerDomain.includes(keyword) || lowerDomain.includes(keyword.replace(/-/g, ''))) {
      matches.push({
        pattern: keyword,
        category: 'suspicious_patterns',
        severity: keyword.includes('scam') || keyword.includes('verify') ? 'high' : 'medium',
        description: `Suspicious keyword "${keyword}" in domain name`,
        matched: domain,
      });
    }
  }

  // Also check for excessive hyphens (common in scam domains)
  const hyphenCount = (domain.match(/-/g) || []).length;
  if (hyphenCount >= 4) {
    matches.push({
      pattern: 'excessive-hyphens',
      category: 'suspicious_patterns',
      severity: 'medium',
      description: 'Domain has many hyphens (common in scam domains)',
      matched: domain,
    });
  }

  // Check for suspicious TLD + keyword combinations (legacy patterns)
  const suspiciousTLDPatterns = [
    /free.*\.(app|io|dev|site|online|xyz)$/i,
    /crypto.*\.(app|io|dev|site|online|xyz)$/i,
    /money.*\.(app|io|dev|site|online|xyz)$/i,
    /profit.*\.(app|io|dev|site|online|xyz)$/i,
  ];

  for (const pattern of suspiciousTLDPatterns) {
    if (pattern.test(domain)) {
      matches.push({
        pattern: pattern.source,
        category: 'suspicious_patterns',
        severity: 'medium',
        description: 'Suspicious keyword combined with generic TLD',
        matched: domain,
      });
      break; // Only add one TLD match
    }
  }

  return matches;
}

export function analyzePatterns(content: string): PatternsData {
  const matches: PatternMatch[] = [];
  const seenCategories = new Set<string>();

  for (const rule of PATTERN_RULES) {
    const match = content.match(rule.pattern);
    if (match) {
      // Check unless conditions - skip if any match (reduces false positives)
      if (rule.unless?.some(u => u.test(content))) {
        continue;
      }
      // Check onlyIf conditions - skip if none match (adds context requirement)
      if (rule.onlyIf && !rule.onlyIf.some(o => o.test(content))) {
        continue;
      }

      // Avoid duplicate categories unless different severity
      const key = `${rule.category}-${rule.severity}`;
      if (!seenCategories.has(key)) {
        seenCategories.add(key);
        // Truncate matched text to prevent huge evidence strings
        const matchedText = match[0].length > 100
          ? match[0].substring(0, 100) + '...'
          : match[0];
        matches.push({
          pattern: rule.pattern.source,
          category: rule.category,
          severity: rule.severity,
          description: rule.description,
          matched: matchedText,
        });
      }
    }
  }

  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  matches.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return { matches };
}

export async function checkPatterns(html: string): Promise<PatternsData> {
  try {
    // Clean HTML to get text content
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return analyzePatterns(textContent);
  } catch (error) {
    return {
      matches: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
