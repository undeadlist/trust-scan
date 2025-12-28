// URLhaus Threat Intelligence Check
// Free API from abuse.ch - no API key required
// Checks URLs against known malware/phishing database

import { ThreatData } from '../types';

const URLHAUS_API = 'https://urlhaus-api.abuse.ch/v1/url/';

interface URLhausResponse {
  query_status: 'ok' | 'no_results' | 'invalid_url';
  url_info?: {
    url: string;
    url_status: 'online' | 'offline' | 'unknown';
    threat: string;
    tags: string[];
    date_added: string;
  };
}

export async function checkURLhaus(url: string): Promise<ThreatData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(URLHAUS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `url=${encodeURIComponent(url)}`,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`URLhaus API returned ${response.status}`);
    }

    const data: URLhausResponse = await response.json();

    // query_status === 'ok' means the URL was found in the database (it's malicious)
    // query_status === 'no_results' means URL is not in the database (likely safe)
    const isMalicious = data.query_status === 'ok';

    return {
      isMalicious,
      threat: isMalicious ? (data.url_info?.threat || 'malware') : null,
      tags: isMalicious ? (data.url_info?.tags || []) : [],
      source: 'urlhaus',
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    // Don't fail the scan if URLhaus is unavailable
    console.warn('URLhaus check failed:', error);
    return {
      isMalicious: false,
      threat: null,
      tags: [],
      source: 'urlhaus',
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'URLhaus check failed',
    };
  }
}

// Also check the domain (without path) for broader coverage
export async function checkURLhausDomain(domain: string): Promise<ThreatData> {
  // URLhaus also accepts domain-only queries
  const domainUrl = `https://${domain}/`;
  return checkURLhaus(domainUrl);
}
