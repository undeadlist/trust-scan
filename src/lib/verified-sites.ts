// Trust Scan Verified Sites Configuration
// Sites listed here have passed our trust checks and earned the verified badge.
// Verification is valid for 90 days from the verifiedAt date.

export interface VerifiedSite {
  domain: string;
  verifiedAt: string;  // ISO date string
  expiresAt: string;   // ISO date string (90 days from verification)
  category?: string;   // Optional category for the site
  note?: string;       // Optional note about the verification
}

// List of manually verified sites
// To add a site: it must have a risk score under 25 and pass all checks
export const VERIFIED_SITES: VerifiedSite[] = [
  // Example entry (commented out):
  // {
  //   domain: 'example.com',
  //   verifiedAt: '2025-01-01',
  //   expiresAt: '2025-04-01',
  //   category: 'Developer Tools',
  //   note: 'Verified open source project',
  // },
];

/**
 * Check if a domain is verified
 * @param domain - The domain to check (e.g., 'example.com')
 * @returns The VerifiedSite object if verified and not expired, null otherwise
 */
export function isVerifiedSite(domain: string): VerifiedSite | null {
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

  const site = VERIFIED_SITES.find(s => {
    const siteDomain = s.domain.toLowerCase().replace(/^www\./, '');
    return siteDomain === normalizedDomain;
  });

  if (!site) return null;

  // Check if verification has expired
  const expiresAt = new Date(site.expiresAt);
  if (expiresAt < new Date()) {
    return null; // Expired
  }

  return site;
}

/**
 * Get the number of days until verification expires
 * @param site - The verified site
 * @returns Number of days until expiry, or null if expired
 */
export function getDaysUntilExpiry(site: VerifiedSite): number | null {
  const expiresAt = new Date(site.expiresAt);
  const now = new Date();

  if (expiresAt < now) return null;

  const diffMs = expiresAt.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Create a new verified site entry
 * Helper for adding new sites programmatically
 * @param domain - The domain to verify
 * @param category - Optional category
 * @param note - Optional note
 * @returns A VerifiedSite object with dates set
 */
export function createVerifiedSiteEntry(
  domain: string,
  category?: string,
  note?: string
): VerifiedSite {
  const verifiedAt = new Date();
  const expiresAt = new Date(verifiedAt);
  expiresAt.setDate(expiresAt.getDate() + 90); // 90 days validity

  return {
    domain: domain.toLowerCase().replace(/^www\./, ''),
    verifiedAt: verifiedAt.toISOString().split('T')[0],
    expiresAt: expiresAt.toISOString().split('T')[0],
    category,
    note,
  };
}
