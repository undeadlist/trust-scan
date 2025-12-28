import {
  WhoisData,
  SSLData,
  HostingData,
  ScraperData,
  PatternsData,
  GithubData,
  ArchiveData,
  ThreatData,
  RedFlag,
} from './types';

interface ScoringResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  redFlags: RedFlag[];
}

interface CheckResults {
  whoisData: WhoisData | null;
  sslData: SSLData | null;
  hostingData: HostingData | null;
  scraperData: ScraperData | null;
  patternsData: PatternsData | null;
  githubData: GithubData | null;
  archiveData: ArchiveData | null;
  threatData: ThreatData | null;
}

// Severity weights for scoring
const SEVERITY_SCORES = {
  critical: 30,
  high: 20,
  medium: 10,
  low: 5,
};

export function calculateRiskScore(results: CheckResults): ScoringResult {
  const redFlags: RedFlag[] = [];
  let baseScore = 0;

  // === WHOIS Analysis ===
  if (results.whoisData && !results.whoisData.error) {
    const { domainAge } = results.whoisData;

    // New domain - just informational, not inherently suspicious
    // Many legitimate indie projects launch on new domains
    if (domainAge !== null && domainAge < 30) {
      redFlags.push({
        category: 'young_domain_funding',
        severity: 'low', // Reduced from 'high' - new domains are normal for indie projects
        title: 'New Domain',
        description: `Domain is ${domainAge} days old. This alone is not suspicious - many legitimate projects are new.`,
        evidence: `Registered ${domainAge} days ago`,
      });
    }
    // Removed: 180-day check (being < 6 months old is not a red flag)
    // Removed: Privacy protection flag (it's industry standard, not suspicious)
  }

  // === SSL Analysis ===
  if (results.sslData) {
    if (!results.sslData.valid) {
      redFlags.push({
        category: 'ssl_issues',
        severity: 'critical',
        title: 'Invalid SSL Certificate',
        description: 'The site has an invalid or untrusted SSL certificate. Your connection may not be secure.',
        evidence: results.sslData.error || 'Certificate validation failed',
      });
    } else if (results.sslData.daysRemaining !== null && results.sslData.daysRemaining < 7) {
      // Only flag if about to expire (< 7 days)
      // 14-90 days is totally normal renewal cycle, not a red flag
      redFlags.push({
        category: 'ssl_issues',
        severity: 'low', // Reduced from 'medium'
        title: 'SSL Certificate Expiring Very Soon',
        description: `SSL certificate expires in ${results.sslData.daysRemaining} days.`,
      });
    }
  }

  // === Hosting Analysis ===
  if (results.hostingData && !results.hostingData.error) {
    const { isFreeHosting, provider } = results.hostingData;

    // Only flag free hosting if combined with enterprise claims
    // Using Vercel/Netlify/etc is totally normal for indie devs
    if (isFreeHosting) {
      const hasEnterpriseClaims = results.patternsData?.matches.some(
        m => m.category === 'free_hosting_enterprise'
      );

      if (hasEnterpriseClaims) {
        redFlags.push({
          category: 'free_hosting_enterprise',
          severity: 'high', // Reduced from 'critical'
          title: 'Free Hosting with Enterprise Claims',
          description: `Site is hosted on ${provider} but claims enterprise-level services.`,
          evidence: `Hosting: ${provider}`,
        });
      }
      // Removed: Don't flag free hosting by itself - it's normal for indie projects
    }
  }

  // === Scraper Analysis ===
  if (results.scraperData && !results.scraperData.error) {
    const {
      hasContactPage,
      hasPrivacyPolicy,
      hasTermsOfService,
      hasPricing,
      hasDocumentation,
      permissionsRequested,
      testimonials,
      scraperLimited,
    } = results.scraperData;

    // Only flag missing pages if scraper wasn't limited (JS-heavy sites may have these pages)
    if (!scraperLimited) {
      const missingPages: string[] = [];
      if (!hasPrivacyPolicy) missingPages.push('Privacy Policy');
      if (!hasTermsOfService) missingPages.push('Terms of Service');
      if (!hasContactPage) missingPages.push('Contact Information');

      if (missingPages.length >= 2) {
        redFlags.push({
          category: 'missing_info',
          severity: 'low', // Reduced from 'medium'
          title: 'Missing Essential Information',
          description: `Site may lack important pages.`,
          evidence: `Could not find: ${missingPages.join(', ')}`,
        });
      }

      if (!hasPricing && !hasDocumentation) {
        // Don't flag this - many legitimate sites don't have pricing or docs on homepage
      }
    }

    // Dangerous permissions
    if (permissionsRequested.length > 0) {
      const severity = permissionsRequested.length >= 3 ? 'critical' : 'high';
      redFlags.push({
        category: 'dangerous_permissions',
        severity,
        title: 'Requests Sensitive Permissions',
        description: 'This app requests permissions that could compromise your security or privacy.',
        evidence: `Permissions: ${permissionsRequested.join(', ')}`,
      });
    }

    // Generic testimonials
    const genericTestimonials = testimonials.filter(t => t.isGeneric);
    if (genericTestimonials.length >= 2) {
      redFlags.push({
        category: 'generic_testimonials',
        severity: 'medium',
        title: 'Generic Testimonials',
        description: 'Testimonials appear generic and may be fabricated.',
        evidence: `Found ${genericTestimonials.length} potentially fake testimonials`,
      });
    }
  }

  // === Pattern Analysis ===
  if (results.patternsData && !results.patternsData.error) {
    for (const match of results.patternsData.matches) {
      // Skip patterns already covered by other checks
      if (match.category === 'free_hosting_enterprise' && results.hostingData?.isFreeHosting) {
        continue; // Already handled in hosting analysis
      }

      redFlags.push({
        category: match.category,
        severity: match.severity,
        title: match.description,
        description: `Detected suspicious pattern in site content.`,
        evidence: `Matched: "${match.matched}"`,
      });
    }
  }

  // === GitHub Analysis ===
  if (results.githubData && !results.githubData.error) {
    const { repoFound, isArchived, lastCommit, stars } = results.githubData;

    if (repoFound) {
      if (isArchived) {
        redFlags.push({
          category: 'suspicious_patterns',
          severity: 'medium',
          title: 'Archived Repository',
          description: 'The linked GitHub repository is archived and no longer maintained.',
        });
      }

      if (lastCommit) {
        const lastCommitDate = new Date(lastCommit);
        const daysSinceCommit = Math.floor(
          (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceCommit > 365) {
          redFlags.push({
            category: 'suspicious_patterns',
            severity: 'low',
            title: 'Inactive Repository',
            description: `Last commit was ${daysSinceCommit} days ago. Project may be abandoned.`,
          });
        }
      }

      // Low engagement can be a signal
      if (stars !== null && stars < 5) {
        // Don't add as red flag, but note it's a new/unknown project
      }
    }
  }

  // === Archive.org Analysis ===
  // No archive history just means the site is new - not inherently suspicious
  // Only flag if combined with other issues
  if (results.archiveData && !results.archiveData.error) {
    const { found } = results.archiveData;

    if (!found) {
      // Don't flag - no archive history just means the site is new
      // This is expected for new indie projects
    }
    // Removed: Limited archive history check - not meaningful for new projects
  }

  // === Threat Intelligence Analysis ===
  if (results.threatData && !results.threatData.error) {
    if (results.threatData.isMalicious) {
      redFlags.push({
        category: 'suspicious_patterns',
        severity: 'critical',
        title: 'Known Malicious URL',
        description: `This URL has been flagged as malicious by threat intelligence databases.`,
        evidence: results.threatData.threat
          ? `Threat type: ${results.threatData.threat}${results.threatData.tags.length > 0 ? `, Tags: ${results.threatData.tags.join(', ')}` : ''}`
          : 'Flagged by URLhaus threat database',
      });
    }
  }

  // === Calculate Final Score ===
  // Deduplicate by category + title
  const uniqueFlags = redFlags.reduce((acc, flag) => {
    const key = `${flag.category}-${flag.title}`;
    if (!acc.has(key)) {
      acc.set(key, flag);
    }
    return acc;
  }, new Map<string, RedFlag>());

  const finalRedFlags = Array.from(uniqueFlags.values());

  // Calculate score from red flags
  for (const flag of finalRedFlags) {
    baseScore += SEVERITY_SCORES[flag.severity];
  }

  // Cap the score at 100
  const riskScore = Math.min(100, baseScore);

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore >= 70 || finalRedFlags.some(f => f.severity === 'critical')) {
    riskLevel = 'critical';
  } else if (riskScore >= 40) {
    riskLevel = 'high';
  } else if (riskScore >= 20) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Sort flags by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  finalRedFlags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    riskScore,
    riskLevel,
    redFlags: finalRedFlags,
  };
}
