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
import { checkDomainKeywords } from './checks/patterns';

// Cloud provider IP prefixes - these use shared IPs so AbuseIPDB scores are unreliable
const CLOUD_PREFIXES = [
  '3.', '13.', '15.', '18.', '34.', '35.', '52.', '54.', '99.',  // AWS
  '104.196.', '104.199.', '130.211.', '142.250.',  // GCP
  '104.16.', '104.17.', '104.18.', '104.19.', '104.20.', '104.21.',
  '104.22.', '104.23.', '104.24.', '104.25.', '104.26.', '104.27.',
  '172.67.', '162.159.', '141.101.',  // Cloudflare
  '76.76.', '64.71.',  // Vercel
  '151.101.', '199.232.',  // Fastly
  '104.131.', '104.236.', '138.68.', '139.59.', '142.93.',
  '157.245.', '159.65.', '161.35.', '164.90.', '165.22.',
  '167.71.', '167.172.', '174.138.',  // DigitalOcean
];

function isCloudIP(ip: string): boolean {
  return CLOUD_PREFIXES.some(prefix => ip.startsWith(prefix));
}

interface ScoringResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  redFlags: RedFlag[];
}

interface CheckResults {
  domain: string;
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

  // === Positive Scoring ===
  // Trust signals that REDUCE risk score
  const positiveSignals: Array<{
    condition: boolean;
    points: number;
    reason: string;
  }> = [
    // Domain age (tiered - mature domains are major trust signals)
    { condition: !!(results.whoisData?.domainAge && results.whoisData.domainAge > 1825), points: -40, reason: 'Domain over 5 years old (established)' },
    { condition: !!(results.whoisData?.domainAge && results.whoisData.domainAge > 365 && results.whoisData.domainAge <= 1825), points: -20, reason: 'Domain over 1 year old' },
    { condition: !!(results.whoisData?.domainAge && results.whoisData.domainAge > 180 && results.whoisData.domainAge <= 365), points: -10, reason: 'Domain over 6 months old' },

    // SSL
    { condition: !!(results.sslData?.valid && (results.sslData.daysRemaining ?? 0) > 30), points: -10, reason: 'Valid SSL certificate' },

    // Site content
    { condition: !!results.scraperData?.hasPrivacyPolicy, points: -5, reason: 'Has privacy policy' },
    { condition: !!results.scraperData?.hasTermsOfService, points: -5, reason: 'Has terms of service' },
    { condition: !!results.scraperData?.hasContactPage, points: -5, reason: 'Has contact page' },
    { condition: !!results.scraperData?.hasDocumentation, points: -5, reason: 'Has documentation' },

    // Hosting
    { condition: !!(results.hostingData && !results.hostingData.isFreeHosting), points: -5, reason: 'Paid hosting' },

    // GitHub presence
    { condition: !!(results.githubData?.repoFound && (results.githubData.stars ?? 0) > 10), points: -10, reason: 'GitHub repo with stars' },
    { condition: !!(results.githubData?.repoFound && (results.githubData.contributors ?? 0) > 5), points: -5, reason: 'Multiple contributors' },

    // Archive presence
    { condition: !!(results.archiveData?.found && (results.archiveData.snapshotCount ?? 0) > 10), points: -10, reason: 'Established web presence (Archive.org)' },
  ];

  // Apply positive scoring (reduces base score)
  for (const signal of positiveSignals) {
    if (signal.condition) {
      baseScore += signal.points;
    }
  }

  // === Domain Name Analysis ===
  // Check domain name for suspicious keywords
  if (results.domain) {
    const domainMatches = checkDomainKeywords(results.domain);
    for (const match of domainMatches) {
      redFlags.push({
        category: match.category,
        severity: match.severity,
        title: match.description,
        description: 'Suspicious keyword detected in domain name',
        evidence: `Domain: ${match.matched}`,
      });
    }
  }

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
  if (results.threatData) {
    // URLhaus detection
    if (results.threatData.isMalicious && results.threatData.threat) {
      redFlags.push({
        category: 'suspicious_patterns',
        severity: 'critical',
        title: 'Known Malicious URL',
        description: `This URL has been flagged as malicious by threat intelligence databases.`,
        evidence: `Threat type: ${results.threatData.threat}${results.threatData.tags?.length > 0 ? `, Tags: ${results.threatData.tags.join(', ')}` : ''}`,
      });
    }

    // PhishTank detection
    const phishTank = (results.threatData as { phishTank?: { isPhishing?: boolean; inDatabase?: boolean } }).phishTank;
    if (phishTank?.isPhishing) {
      redFlags.push({
        category: 'suspicious_patterns',
        severity: 'critical',
        title: 'Known Phishing Site',
        description: 'This URL has been verified as a phishing site by PhishTank.',
        evidence: 'Verified phishing URL in PhishTank database',
      });
    }

    // Spamhaus detection
    const spamhaus = (results.threatData as { spamhaus?: { listed?: boolean; returnCode?: string } }).spamhaus;
    if (spamhaus?.listed) {
      redFlags.push({
        category: 'suspicious_patterns',
        severity: 'critical',
        title: 'Domain Blocklisted',
        description: 'This domain is listed in Spamhaus Domain Block List.',
        evidence: spamhaus.returnCode ? `Spamhaus category: ${spamhaus.returnCode}` : 'Listed in Spamhaus DBL',
      });
    }

    // AbuseIPDB detection - SKIP for cloud IPs (shared hosting = unreliable scores)
    const abuseIPDB = (results.threatData as { abuseIPDB?: { isMalicious?: boolean; abuseScore?: number; totalReports?: number } }).abuseIPDB;
    const serverIP = results.hostingData?.ipAddress;
    const isCloud = serverIP ? isCloudIP(serverIP) : false;

    // Only flag non-cloud IPs, OR cloud IPs with extremely high scores (>90%)
    if (abuseIPDB?.isMalicious && !isCloud) {
      redFlags.push({
        category: 'suspicious_patterns',
        severity: 'high',
        title: 'Suspicious IP Address',
        description: 'The server IP has been reported for abuse.',
        evidence: `Abuse confidence: ${abuseIPDB.abuseScore}%, Reports: ${abuseIPDB.totalReports}`,
      });
    } else if (abuseIPDB?.isMalicious && isCloud && (abuseIPDB.abuseScore ?? 0) > 90) {
      // Only flag cloud IPs if score is extremely high
      redFlags.push({
        category: 'suspicious_patterns',
        severity: 'low',
        title: 'Cloud IP Has High Abuse Reports',
        description: 'Server uses shared cloud hosting with abuse reports (may be from other tenants).',
        evidence: `Abuse confidence: ${abuseIPDB.abuseScore}%, Reports: ${abuseIPDB.totalReports}, Cloud IP: ${serverIP}`,
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

  // Smoother risk calculation with diminishing returns
  // Prevents score explosion from multiple low-severity flags
  function calculateSmoothedScore(rawScore: number): number {
    if (rawScore <= 0) return 0;
    // Logarithmic scaling: 100 raw → ~70 smoothed, 50 raw → ~45 smoothed
    return Math.min(100, Math.round(100 * (1 - Math.exp(-rawScore / 50))));
  }

  const riskScore = calculateSmoothedScore(baseScore);

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
