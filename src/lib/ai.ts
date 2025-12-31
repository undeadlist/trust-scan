// Trust Scan AI Analysis Infrastructure
import { ScanResult } from './types';

// Check if Trust Scan AI (Ollama) is available
export function hasTrustScanServer(): boolean {
  return !!process.env.OLLAMA_SERVER_URL;
}

// Shared prompt builder for Trust Scan AI - Comprehensive Security Report
export function buildAnalysisPrompt(scanResult: ScanResult): string {
  const domainAge = scanResult.whoisData?.domainAge;
  const domainYears = domainAge ? Math.floor(domainAge / 365) : null;

  return `You are a security analyst generating a COMPREHENSIVE SECURITY REPORT.

Use ONLY the data provided below. Do NOT invent or assume any values.
If a value shows "Unknown" or is missing, acknowledge that in your analysis.

================================================================================
                              SCAN DATA
================================================================================

TARGET: ${scanResult.domain}
URL: ${scanResult.url}
SCAN CONFIDENCE: ${scanResult.scanConfidence}
BASE RISK SCORE: ${scanResult.riskScore}/100 (${scanResult.riskLevel})

--- WHOIS DATA ---
Domain Age: ${domainAge !== null ? `${domainAge} days (approximately ${domainYears} years)` : 'Unknown'}
Creation Date: ${scanResult.whoisData?.creationDate || 'Unknown'}
Expiration Date: ${scanResult.whoisData?.expirationDate || 'Unknown'}
Registrar: ${scanResult.whoisData?.registrar || 'Unknown (WHOIS privacy)'}
Privacy Protected: ${scanResult.whoisData?.privacyProtected ? 'Yes' : 'No'}

--- SSL DATA ---
Certificate Valid: ${scanResult.sslData?.valid ? 'YES' : 'NO - INVALID/FAILED'}
Issuer: ${scanResult.sslData?.issuer || 'Unknown'}
Valid From: ${scanResult.sslData?.validFrom || 'Unknown'}
Valid To: ${scanResult.sslData?.validTo || 'Unknown'}
Days Remaining: ${scanResult.sslData?.daysRemaining ?? 'Unknown'}

--- HOSTING DATA ---
Provider: ${scanResult.hostingData?.provider || 'Unknown'}
Free Hosting: ${scanResult.hostingData?.isFreeHosting ? 'Yes' : 'No'}
CDN: ${scanResult.hostingData?.cdnDetected || 'None detected'}
IP Address: ${scanResult.hostingData?.ipAddress || 'Unknown'}
Country: ${scanResult.hostingData?.country || 'Unknown'}

--- CONTENT DATA ---
Site Title: ${scanResult.scraperData?.title || 'Unknown'}
Contact Page: ${scanResult.scraperData?.hasContactPage ? 'Found' : 'Not Found'}
Privacy Policy: ${scanResult.scraperData?.hasPrivacyPolicy ? 'Found' : 'Not Found'}
Terms of Service: ${scanResult.scraperData?.hasTermsOfService ? 'Found' : 'Not Found'}
Pricing Page: ${scanResult.scraperData?.hasPricing ? 'Found' : 'Not Found'}
Documentation: ${scanResult.scraperData?.hasDocumentation ? 'Found' : 'Not Found'}
Social Links: ${scanResult.scraperData?.socialLinks?.length || 0} found
Scraper Limited: ${scanResult.scraperData?.scraperLimited ? 'Yes (JS-heavy site)' : 'No'}

--- ARCHIVE DATA ---
Found in Archive.org: ${scanResult.archiveData?.found ? 'Yes' : 'No'}
First Snapshot: ${scanResult.archiveData?.firstSnapshot || 'Unknown'}
Total Snapshots: ${scanResult.archiveData?.snapshotCount ?? 'Unknown'}
Archive Age: ${scanResult.archiveData?.oldestAge ? `${scanResult.archiveData.oldestAge} days` : 'Unknown'}

--- THREAT INTELLIGENCE ---
Malicious (URLhaus): ${scanResult.threatData?.isMalicious ? 'YES - FLAGGED' : 'Clean'}
Threat Type: ${scanResult.threatData?.threat || 'None'}
Tags: ${scanResult.threatData?.tags?.join(', ') || 'None'}

--- RED FLAGS DETECTED ---
${scanResult.redFlags.length > 0
  ? scanResult.redFlags.map(f => `[${f.severity.toUpperCase()}] ${f.title}: ${f.description}`).join('\n')
  : 'None detected'}

--- GITHUB DATA ---
${scanResult.githubData?.repoFound
  ? `Repository: ${scanResult.githubData.repoUrl}
Stars: ${scanResult.githubData.stars}
Contributors: ${scanResult.githubData.contributors}
Last Commit: ${scanResult.githubData.lastCommit}`
  : 'No repository found'}

================================================================================
                         GENERATE COMPREHENSIVE REPORT
================================================================================

Respond with this EXACT JSON structure. Fill in each section based on the SCAN DATA above.

{
  "analystConfidence": "High" | "Medium" | "Low",
  "confidenceReason": "Explain which data points were available vs missing",

  "domainIntelligence": {
    "analysis": "2-4 sentences. Interpret the domain age (use the EXACT age from scan data: ${domainAge !== null ? `${domainAge} days / ${domainYears} years` : 'Unknown'}). Explain what this means for trust. Scammers rarely maintain domains for years. A 26-year domain is extremely trustworthy. A 5-day domain needs more scrutiny."
  },

  "sslAnalysis": {
    "whatThisMeans": "${scanResult.sslData?.valid ? 'The SSL certificate is valid. This means encrypted connections and verified identity.' : 'The SSL certificate is INVALID. Explain possible causes: expired certificate, misconfiguration, self-signed cert, server issues.'}",
    "whyItMatters": ["${scanResult.sslData?.valid ? 'Data is encrypted in transit' : 'Browsers will show security warnings'}", "${scanResult.sslData?.valid ? 'Site identity is verified' : 'Data may not be encrypted'}", "${scanResult.sslData?.valid ? 'Standard security practice' : 'Man-in-the-middle attacks possible'}"],
    "likelyExplanation": "Given the domain age and other factors, explain what the SSL status likely indicates. ${domainAge && domainAge > 1000 ? 'For mature domains, SSL issues are usually configuration problems, not malice.' : 'For new domains, SSL issues could indicate hasty setup or inexperience.'}"
  },

  "infrastructureAnalysis": {
    "analysis": "1-2 sentences about hosting. Provider: ${scanResult.hostingData?.provider || 'Unknown'}. ${scanResult.hostingData?.isFreeHosting ? 'Uses free hosting - common for indie devs but also scammers.' : 'Uses paid hosting - slight positive signal.'} Note any patterns."
  },

  "webPresence": {
    "analysis": "Assess what the content findings mean. Contact: ${scanResult.scraperData?.hasContactPage ? 'Found' : 'Missing'}. Privacy: ${scanResult.scraperData?.hasPrivacyPolicy ? 'Found' : 'Missing'}. Terms: ${scanResult.scraperData?.hasTermsOfService ? 'Found' : 'Missing'}.",
    "possibleReasons": ["List possible reasons for missing pages if applicable: parked domain, JS-heavy SPA, minimal landing page, gated content, early development"]
  },

  "archiveAnalysis": {
    "note": "${scanResult.archiveData?.found ? `Archive.org has ${scanResult.archiveData.snapshotCount} snapshots. This shows historical presence.` : 'No Archive.org history found. This could mean the site is new, uses aggressive caching, or blocks archiving.'}"
  },

  "threatAnalysis": {
    "analysis": "${scanResult.threatData?.isMalicious ? 'CRITICAL: Site is flagged in threat databases as ' + (scanResult.threatData.threat || 'malicious') + '. This is a serious concern.' : 'No matches in threat databases (URLhaus, etc.). This is a positive signal - if this domain was distributing malware or phishing, it would likely be flagged.'}"
  },

  "redFlagDeepDives": [
    ${scanResult.redFlags.length > 0
      ? scanResult.redFlags.map(f => `{
      "flagTitle": "${f.title}",
      "deepDive": "Provide context for this flag. The scanner flagged: ${f.description}. ${domainAge && domainAge > 1000 ? 'Given the mature domain age, this is likely a configuration issue or neglect rather than malicious intent.' : 'For newer domains, this requires more scrutiny.'} Explain what this means for the user."
    }`).join(',\n    ')
      : `{
      "flagTitle": "No Red Flags",
      "deepDive": "The automated scanner found no red flags. This is a positive indicator, but does not guarantee safety."
    }`}
  ],

  "riskBreakdown": {
    "signals": [
      ${domainAge && domainAge > 1825 ? '{"factor": "Domain Age (' + domainYears + ' years)", "points": -40, "note": "strong trust signal"},' : domainAge && domainAge > 365 ? '{"factor": "Domain Age (' + domainYears + ' years)", "points": -20, "note": "established presence"},' : domainAge && domainAge < 30 ? '{"factor": "New Domain (' + domainAge + ' days)", "points": 15, "note": "needs more scrutiny"},' : ''}
      ${!scanResult.threatData?.isMalicious ? '{"factor": "Clean Threat Databases", "points": -10, "note": "not flagged for malware/phishing"},' : '{"factor": "Flagged in Threat DB", "points": 50, "note": "critical security concern"},'}
      ${scanResult.sslData?.valid ? '{"factor": "Valid SSL Certificate", "points": -5, "note": "encrypted connection"}' : '{"factor": "Invalid SSL Certificate", "points": 30, "note": "security issue"}'}
      ${!scanResult.hostingData?.isFreeHosting ? ',{"factor": "Paid Hosting", "points": -5, "note": "slight positive"}' : ''}
      ${scanResult.redFlags.filter(f => f.severity === 'critical').length > 0 ? ',{"factor": "Critical Red Flags", "points": 30, "note": "serious concerns found"}' : ''}
    ],
    "rawTotal": 0,
    "adjustedScore": ${scanResult.riskScore},
    "adjustedLevel": "${scanResult.riskLevel === 'low' ? 'Low' : scanResult.riskLevel === 'medium' ? 'Medium' : scanResult.riskLevel === 'high' ? 'High' : 'Critical'}"
  },

  "verdict": {
    "assessment": "${scanResult.redFlags.some(f => f.severity === 'critical') ? 'CAUTION' : scanResult.threatData?.isMalicious ? 'AVOID' : domainAge && domainAge > 1825 && !scanResult.threatData?.isMalicious ? 'CAUTION' : 'CAUTION'}",
    "whatWeKnow": [
      "Domain is ${domainAge !== null ? (domainYears && domainYears > 0 ? domainYears + ' years old' : domainAge + ' days old') : 'of unknown age'}",
      "${scanResult.threatData?.isMalicious ? 'Site IS flagged in threat databases' : 'Site is NOT in threat databases'}",
      "${scanResult.sslData?.valid ? 'SSL certificate is valid' : 'SSL certificate has issues'}"
    ],
    "whatWeDontKnow": [
      "List unknowns based on scan data",
      "Why certain things might be missing",
      "Whether the site is actively maintained"
    ],
    "recommendations": [
      ${!scanResult.sslData?.valid ? '{"action": "Do not enter passwords or sensitive data", "priority": "High", "reason": "SSL certificate is invalid - data could be intercepted by third parties"},' : ''}
      ${scanResult.threatData?.isMalicious ? '{"action": "Do not visit this site", "priority": "High", "reason": "Site is flagged in threat databases as ' + (scanResult.threatData.threat || 'malicious') + '"},' : ''}
      {"action": "Verify the site works in your browser", "priority": "Medium", "reason": "DNS resolution or connection issues may indicate the site is down or blocking automated scanners"},
      {"action": "Check for recent user reviews", "priority": "Low", "reason": "Community feedback could reveal issues our automated scan missed"}
    ],
    "bottomLine": "Provide 4-6 sentences with detailed analysis summarizing the key findings and actionable guidance. Reference the domain age, SSL status, and main concerns or positives. Explain WHY the user should trust or distrust this site."
  },

  "scoreAdjustment": 0
}

================================================================================
                              CRITICAL RULES
================================================================================

1. Use ONLY values from the SCAN DATA section above
2. If SSL shows "NO - INVALID/FAILED", acknowledge it is INVALID - do not claim it is valid
3. Reference the EXACT domain age: ${domainAge !== null ? `${domainAge} days (${domainYears} years)` : 'Unknown'}
4. Each red flag MUST have a contextual deep dive
5. Calculate risk breakdown with actual point values
6. The verdict.assessment must reflect any critical flags - cannot be TRUSTWORTHY if critical flags exist
7. Fill in ALL sections - do not leave placeholders

Respond with valid JSON only.`;
}
