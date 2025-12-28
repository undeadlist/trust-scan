// PhishTank API Integration
// Free phishing URL database - no CC required
// Register at: https://phishtank.org/

import { fetchWithTimeout } from '../utils/timeout';

export interface PhishTankResult {
  isPhishing: boolean;
  inDatabase: boolean;
  verifiedAt?: string;
  error?: string;
}

export async function checkPhishTank(url: string): Promise<PhishTankResult> {
  try {
    // Note: PhishTank uses HTTP, not HTTPS
    const response = await fetchWithTimeout(
      'http://checkurl.phishtank.com/checkurl/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'phishtank/trustscan',
        },
        body: `url=${encodeURIComponent(url)}&format=json&app_key=${process.env.PHISHTANK_KEY || ''}`,
      },
      10000
    );

    const text = await response.text();

    // PhishTank may return XML even when we request JSON
    // Try to parse as JSON first, then fall back to XML parsing
    let isPhishing = false;
    let inDatabase = false;
    let verifiedAt: string | undefined;

    try {
      const data = JSON.parse(text);
      isPhishing = data.results?.valid === true && data.results?.verified === true;
      inDatabase = data.results?.in_database === true;
      verifiedAt = data.results?.verified_at;
    } catch {
      // Parse XML response
      const inDbMatch = text.match(/<in_database>(true|false)<\/in_database>/);
      const validMatch = text.match(/<valid>(true|false)<\/valid>/);
      const verifiedMatch = text.match(/<verified>(true|false)<\/verified>/);
      const verifiedAtMatch = text.match(/<verified_at>([^<]+)<\/verified_at>/);

      inDatabase = inDbMatch?.[1] === 'true';
      isPhishing = validMatch?.[1] === 'true' && verifiedMatch?.[1] === 'true';
      verifiedAt = verifiedAtMatch?.[1];
    }

    return {
      isPhishing,
      inDatabase,
      verifiedAt,
    };
  } catch (error) {
    return {
      isPhishing: false,
      inDatabase: false,
      error: error instanceof Error ? error.message : 'PhishTank lookup failed',
    };
  }
}
