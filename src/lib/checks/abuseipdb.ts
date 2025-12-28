// AbuseIPDB API Integration
// Free tier: 1,000 requests/day - no CC required
// Register at: https://www.abuseipdb.com/account/api

import { fetchWithTimeout } from '../utils/timeout';

export interface AbuseIPDBResult {
  abuseScore: number;
  totalReports: number;
  isMalicious: boolean;
  countryCode?: string;
  usageType?: string;
  isp?: string;
  domain?: string;
  lastReportedAt?: string;
  error?: string;
}

export async function checkAbuseIPDB(ip: string): Promise<AbuseIPDBResult> {
  if (!process.env.ABUSEIPDB_KEY) {
    return {
      abuseScore: 0,
      totalReports: 0,
      isMalicious: false,
      error: 'No AbuseIPDB API key configured',
    };
  }

  try {
    const response = await fetchWithTimeout(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&verbose`,
      {
        headers: {
          'Key': process.env.ABUSEIPDB_KEY,
          'Accept': 'application/json',
        },
      },
      10000
    );

    const data = await response.json();

    if (data.errors) {
      return {
        abuseScore: 0,
        totalReports: 0,
        isMalicious: false,
        error: data.errors[0]?.detail || 'AbuseIPDB API error',
      };
    }

    const result = data.data;
    return {
      abuseScore: result?.abuseConfidenceScore || 0,
      totalReports: result?.totalReports || 0,
      isMalicious: (result?.abuseConfidenceScore || 0) > 50,
      countryCode: result?.countryCode,
      usageType: result?.usageType,
      isp: result?.isp,
      domain: result?.domain,
      lastReportedAt: result?.lastReportedAt,
    };
  } catch (error) {
    return {
      abuseScore: 0,
      totalReports: 0,
      isMalicious: false,
      error: error instanceof Error ? error.message : 'AbuseIPDB lookup failed',
    };
  }
}
