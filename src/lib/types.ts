// VibeCheck Types

export interface WhoisData {
  domainAge: number | null; // days
  creationDate: string | null;
  expirationDate: string | null;
  registrar: string | null;
  registrantOrganization: string | null;
  registrantCountry: string | null;
  privacyProtected: boolean;
  error?: string;
}

export interface SSLData {
  valid: boolean;
  issuer: string | null;
  validFrom: string | null;
  validTo: string | null;
  daysRemaining: number | null;
  protocol: string | null;
  error?: string;
}

export interface HostingData {
  provider: string | null;
  isFreeHosting: boolean;
  cdnDetected: string | null;
  ipAddress: string | null;
  country: string | null;
  error?: string;
}

export interface ScraperData {
  title: string | null;
  description: string | null;
  hasContactPage: boolean;
  hasPrivacyPolicy: boolean;
  hasTermsOfService: boolean;
  hasPricing: boolean;
  hasDocumentation: boolean;
  socialLinks: string[];
  externalLinks: string[];
  permissionsRequested: string[];
  testimonials: TestimonialData[];
  scraperLimited?: boolean;
  scraperNote?: string;
  error?: string;
}

export interface TestimonialData {
  text: string;
  author: string | null;
  isGeneric: boolean;
}

export interface PatternMatch {
  pattern: string;
  category: RedFlagCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  matched: string;
}

export interface PatternsData {
  matches: PatternMatch[];
  error?: string;
}

export interface GithubData {
  repoFound: boolean;
  repoUrl: string | null;
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  lastCommit: string | null;
  contributors: number | null;
  isArchived: boolean;
  error?: string;
}

export interface ArchiveData {
  found: boolean;
  firstSnapshot: string | null;
  snapshotCount: number | null;
  oldestAge: number | null; // days
  error?: string;
}

export interface ThreatData {
  isMalicious: boolean;
  threat: string | null;
  tags: string[];
  source: 'urlhaus' | 'virustotal' | 'cache';
  checkedAt: string;
  error?: string;
}

export type RedFlagCategory =
  | 'free_hosting_enterprise'
  | 'young_domain_funding'
  | 'dangerous_permissions'
  | 'unverifiable_company'
  | 'impossible_claims'
  | 'missing_info'
  | 'generic_testimonials'
  | 'ssl_issues'
  | 'suspicious_patterns';

export interface RedFlag {
  category: RedFlagCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence?: string;
}

export interface VerifiedBadgeInfo {
  isVerified: boolean;
  verifiedAt?: string;
  expiresAt?: string;
  category?: string;
}

export interface ScanResult {
  id: string;
  url: string;
  domain: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  whoisData: WhoisData | null;
  sslData: SSLData | null;
  hostingData: HostingData | null;
  scraperData: ScraperData | null;
  patternsData: PatternsData | null;
  githubData: GithubData | null;
  archiveData: ArchiveData | null;
  threatData: ThreatData | null;
  redFlags: RedFlag[];
  createdAt: string;
  expiresAt: string;
  // New fields for Phase 2
  scanConfidence: 'high' | 'medium' | 'low';
  scanNotes: string[];
  isKnownEntity: boolean;
  // Verified badge info
  verifiedBadge?: VerifiedBadgeInfo;
}

export interface AIAnalysis {
  summary: string;
  concerns: string[];
  positives: string[];
  reasoning: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  verdict?: 'TRUSTWORTHY' | 'CAUTION' | 'SUSPICIOUS' | 'AVOID';
  falsePositiveCheck?: string;
  recommendation?: 'safe' | 'caution' | 'avoid';
}

// Backward compatibility alias
export type GeminiAnalysis = AIAnalysis;

export interface ScanRequest {
  url: string;
}

export interface ScanResponse {
  success: boolean;
  result?: ScanResult;
  cached?: boolean;
  error?: string;
}
