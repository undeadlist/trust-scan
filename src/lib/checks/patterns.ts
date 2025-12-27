import { PatternsData, PatternMatch, RedFlagCategory } from '../types';

interface PatternRule {
  pattern: RegExp;
  category: RedFlagCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
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
    severity: 'medium',
    description: 'Requests API credentials',
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
];

export function analyzePatterns(content: string): PatternsData {
  const matches: PatternMatch[] = [];
  const seenCategories = new Set<string>();

  for (const rule of PATTERN_RULES) {
    const match = content.match(rule.pattern);
    if (match) {
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
