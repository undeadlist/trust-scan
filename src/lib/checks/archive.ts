import { ArchiveData } from '../types';
import { fetchWithTimeout } from '../utils/timeout';

export async function checkArchive(url: string): Promise<ArchiveData> {
  try {
    // Extract domain from URL - query domain not full URL path
    // This finds archive history for the entire domain, not just specific paths
    const domain = new URL(url).hostname;

    // Use matchType=prefix to get all snapshots for the domain
    const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&matchType=prefix&output=json&limit=1000&fl=timestamp`;

    const response = await fetchWithTimeout(cdxUrl, {
      headers: {
        'User-Agent': 'TrustScan/1.0',
      },
    }, 15000);

    if (!response.ok) {
      return createNoArchiveData();
    }

    const data = await response.json();

    // First row is headers, rest are timestamps
    if (!Array.isArray(data) || data.length < 2) {
      return createNoArchiveData();
    }

    const timestamps = data.slice(1).map((row: string[]) => row[0]);

    if (timestamps.length === 0) {
      return createNoArchiveData();
    }

    // Parse the oldest timestamp (format: YYYYMMDDHHmmss)
    const oldest = timestamps[0];
    const firstSnapshot = parseArchiveTimestamp(oldest);

    // Calculate age in days
    let oldestAge: number | null = null;
    if (firstSnapshot) {
      const firstDate = new Date(firstSnapshot);
      const now = new Date();
      oldestAge = Math.floor(
        (now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    return {
      found: true,
      firstSnapshot,
      snapshotCount: timestamps.length,
      oldestAge,
    };
  } catch (error) {
    return {
      found: false,
      firstSnapshot: null,
      snapshotCount: null,
      oldestAge: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function parseArchiveTimestamp(timestamp: string): string | null {
  try {
    // Format: YYYYMMDDHHmmss
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10) || '00';
    const minute = timestamp.substring(10, 12) || '00';
    const second = timestamp.substring(12, 14) || '00';

    return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  } catch {
    return null;
  }
}

function createNoArchiveData(): ArchiveData {
  return {
    found: false,
    firstSnapshot: null,
    snapshotCount: null,
    oldestAge: null,
  };
}
