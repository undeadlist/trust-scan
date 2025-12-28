// Spamhaus DNS Block List Check
// Free DNS-based lookup - no signup required
// Queries Spamhaus DBL (Domain Block List)

import dns from 'dns/promises';
import { withTimeout } from '@/lib/utils/timeout';

export interface SpamhausResult {
  listed: boolean;
  source?: string;
  returnCode?: string;
  error?: string;
}

// Spamhaus return codes for DBL
const DBL_RETURN_CODES: Record<string, string> = {
  '127.0.1.2': 'spam_domain',
  '127.0.1.4': 'phishing_domain',
  '127.0.1.5': 'malware_domain',
  '127.0.1.6': 'botnet_cc_domain',
  '127.0.1.102': 'abused_legit_spam',
  '127.0.1.103': 'abused_spammed_redirector',
  '127.0.1.104': 'abused_legit_phishing',
  '127.0.1.105': 'abused_legit_malware',
  '127.0.1.106': 'abused_legit_botnet',
};

export async function checkSpamhaus(domain: string): Promise<SpamhausResult> {
  try {
    // Query Spamhaus DBL (Domain Block List) with 10s timeout
    const lookup = `${domain}.dbl.spamhaus.org`;
    const addresses = await withTimeout(
      dns.resolve4(lookup),
      10000,
      'Spamhaus DNS lookup timed out'
    );

    // If we get a response, the domain is listed
    if (addresses.length > 0) {
      const returnCode = addresses[0];
      return {
        listed: true,
        source: 'spamhaus_dbl',
        returnCode: DBL_RETURN_CODES[returnCode] || returnCode,
      };
    }

    return { listed: false };
  } catch (error) {
    // NXDOMAIN (not found) means the domain is NOT listed - this is good
    if (error instanceof Error && error.message.includes('ENOTFOUND')) {
      return { listed: false };
    }

    // Timeout or other DNS errors - fail gracefully
    return {
      listed: false,
      error: error instanceof Error ? error.message : 'DNS lookup failed',
    };
  }
}
