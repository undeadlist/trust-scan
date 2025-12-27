import { WhoisData } from '../types';
import { fetchWithTimeout } from '../utils/timeout';

// Simple WHOIS lookup using public APIs
export async function checkWhois(domain: string): Promise<WhoisData> {
  try {
    // Use a public WHOIS API
    const response = await fetchWithTimeout(
      `https://api.api-ninjas.com/v1/whois?domain=${encodeURIComponent(domain)}`,
      {
        headers: {
          'X-Api-Key': process.env.API_NINJAS_KEY || '',
        },
      },
      10000
    );

    if (!response.ok) {
      // Fallback: try to parse domain age from creation patterns
      return await fallbackWhoisCheck(domain);
    }

    const data = await response.json();

    const creationDate = data.creation_date
      ? new Date(data.creation_date * 1000).toISOString()
      : null;
    const expirationDate = data.expiration_date
      ? new Date(data.expiration_date * 1000).toISOString()
      : null;

    let domainAge: number | null = null;
    if (creationDate) {
      const created = new Date(creationDate);
      const now = new Date();
      domainAge = Math.floor(
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    return {
      domainAge,
      creationDate,
      expirationDate,
      registrar: data.registrar || null,
      registrantOrganization: data.org || null,
      registrantCountry: data.country || null,
      privacyProtected: !data.org || data.org.toLowerCase().includes('privacy'),
    };
  } catch {
    return await fallbackWhoisCheck(domain);
  }
}

async function fallbackWhoisCheck(domain: string): Promise<WhoisData> {
  try {
    // Try RDAP (Registration Data Access Protocol) as fallback
    const tld = domain.split('.').pop() || '';
    const rdapServers: Record<string, string> = {
      com: 'https://rdap.verisign.com/com/v1/domain/',
      net: 'https://rdap.verisign.com/net/v1/domain/',
      org: 'https://rdap.publicinterestregistry.org/rdap/domain/',
      io: 'https://rdap.nic.io/domain/',
    };

    const rdapUrl = rdapServers[tld];
    if (!rdapUrl) {
      return createUnknownWhoisData();
    }

    const response = await fetchWithTimeout(`${rdapUrl}${domain}`, {
      headers: { Accept: 'application/rdap+json' },
    }, 10000);

    if (!response.ok) {
      return createUnknownWhoisData();
    }

    const data = await response.json();

    // Parse RDAP response
    const events = data.events || [];
    const registrationEvent = events.find(
      (e: { eventAction: string }) => e.eventAction === 'registration'
    );
    const expirationEvent = events.find(
      (e: { eventAction: string }) => e.eventAction === 'expiration'
    );

    const creationDate = registrationEvent?.eventDate || null;
    const expirationDate = expirationEvent?.eventDate || null;

    let domainAge: number | null = null;
    if (creationDate) {
      const created = new Date(creationDate);
      const now = new Date();
      domainAge = Math.floor(
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Find registrar from entities
    const registrarEntity = data.entities?.find(
      (e: { roles?: string[] }) => e.roles?.includes('registrar')
    );

    return {
      domainAge,
      creationDate,
      expirationDate,
      registrar: registrarEntity?.vcardArray?.[1]?.[1]?.[3] || data.port43 || null,
      registrantOrganization: null,
      registrantCountry: null,
      privacyProtected: true, // Assume privacy if we can't determine
    };
  } catch {
    return createUnknownWhoisData();
  }
}

function createUnknownWhoisData(): WhoisData {
  return {
    domainAge: null,
    creationDate: null,
    expirationDate: null,
    registrar: null,
    registrantOrganization: null,
    registrantCountry: null,
    privacyProtected: true,
    error: 'Unable to fetch WHOIS data',
  };
}
