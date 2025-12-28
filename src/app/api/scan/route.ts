import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  checkWhois,
  checkSSL,
  checkHosting,
  scrapeWebsite,
  checkPatterns,
  checkGithub,
  checkArchive,
  getCachedThreatData,
} from '@/lib/checks';
import { calculateRiskScore } from '@/lib/scoring';
import { ScanResponse, ScanResult } from '@/lib/types';
import { withTimeout, fetchWithTimeout } from '@/lib/utils/timeout';
import { isKnownLegitDomain, getKnownEntityInfo, getKnownEntityCategory } from '@/lib/known-entities';
import { isVerifiedSite } from '@/lib/verified-sites';

const SCAN_TIMEOUT_MS = 30000;

// Helper to extract domain from URL
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    // If no protocol, try adding https
    try {
      const parsed = new URL(`https://${url}`);
      return parsed.hostname;
    } catch {
      return url;
    }
  }
}

// Helper to normalize URL
function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    // Remove trailing slash for consistency
    return parsed.origin + parsed.pathname.replace(/\/$/, '');
  } catch {
    return url;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ScanResponse>> {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(url.trim());
    const domain = extractDomain(normalizedUrl);

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // Early exit for known legitimate entities - skip detailed scanning
    if (isKnownLegitDomain(domain)) {
      const entityInfo = getKnownEntityInfo(domain);
      const category = getKnownEntityCategory(domain);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const result: ScanResult = {
        id: `known-${Date.now()}`,
        url: normalizedUrl,
        domain,
        riskScore: 5,
        riskLevel: 'low',
        whoisData: null,
        sslData: null,
        hostingData: null,
        scraperData: null,
        patternsData: null,
        githubData: null,
        archiveData: null,
        threatData: null,
        redFlags: [],
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        scanConfidence: 'high',
        scanNotes: [entityInfo?.note || 'Recognized established service', `Category: ${category}`],
        isKnownEntity: true,
      };

      return NextResponse.json({
        success: true,
        result,
        cached: false,
      });
    }

    // Check for cached result (within 24 hours)
    try {
      const cached = await prisma.scanResult.findFirst({
        where: {
          url: normalizedUrl,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (cached) {
        const scraperData = cached.scraperData as ScanResult['scraperData'];
        const result: ScanResult = {
          id: cached.id,
          url: cached.url,
          domain: cached.domain,
          riskScore: cached.riskScore,
          riskLevel: cached.riskLevel as ScanResult['riskLevel'],
          whoisData: cached.whoisData as ScanResult['whoisData'],
          sslData: cached.sslData as ScanResult['sslData'],
          hostingData: cached.hostingData as ScanResult['hostingData'],
          scraperData: scraperData,
          patternsData: cached.patternsData as ScanResult['patternsData'],
          githubData: cached.githubData as ScanResult['githubData'],
          archiveData: cached.archiveData as ScanResult['archiveData'],
          threatData: (cached as { threatData?: ScanResult['threatData'] }).threatData ?? null,
          redFlags: cached.redFlags as unknown as ScanResult['redFlags'],
          createdAt: cached.createdAt.toISOString(),
          expiresAt: cached.expiresAt.toISOString(),
          // Add new fields for cached results
          scanConfidence: scraperData?.scraperLimited ? 'low' : 'high',
          scanNotes: scraperData?.scraperNote ? [scraperData.scraperNote] : [],
          isKnownEntity: false,
        };

        return NextResponse.json({
          success: true,
          result,
          cached: true,
        });
      }
    } catch {
      // Database might not be available, continue with scan
    }

    // Perform all checks in parallel with timeout
    const [whoisResult, sslResult, hostingResult, scraperResult, archiveResult, threatResult] =
      await withTimeout(
        Promise.all([
          checkWhois(domain),
          checkSSL(domain),
          checkHosting(domain),
          scrapeWebsite(normalizedUrl),
          checkArchive(normalizedUrl),
          getCachedThreatData(normalizedUrl),
        ]),
        SCAN_TIMEOUT_MS,
        'Scan timed out - some checks may have failed'
      );

    // Scrape HTML for pattern analysis
    let patternsResult;
    let htmlContent = '';
    try {
      const response = await fetchWithTimeout(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }, 15000);
      htmlContent = await response.text();
      patternsResult = await checkPatterns(htmlContent);
    } catch {
      patternsResult = { matches: [], error: 'Failed to fetch page content' };
    }

    // Check GitHub using links found by scraper
    const githubResult = await checkGithub(
      domain,
      scraperResult.socialLinks || []
    );

    // Calculate risk score
    const { riskScore, riskLevel, redFlags } = calculateRiskScore({
      domain,
      whoisData: whoisResult,
      sslData: sslResult,
      hostingData: hostingResult,
      scraperData: scraperResult,
      patternsData: patternsResult,
      githubData: githubResult,
      archiveData: archiveResult,
      threatData: threatResult,
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    // Try to save to database
    let savedResult;
    try {
      // Delete old entry if exists
      await prisma.scanResult.deleteMany({
        where: { url: normalizedUrl },
      });

      savedResult = await prisma.scanResult.create({
        data: {
          url: normalizedUrl,
          domain,
          riskScore,
          riskLevel,
          whoisData: whoisResult as object,
          sslData: sslResult as object,
          hostingData: hostingResult as object,
          scraperData: scraperResult as object,
          patternsData: patternsResult as object,
          githubData: githubResult as object,
          archiveData: archiveResult as object,
          threatData: threatResult as object,
          redFlags: redFlags as object[],
          expiresAt,
        },
      });
    } catch {
      // Create a mock result without database
      savedResult = {
        id: `temp-${Date.now()}`,
        url: normalizedUrl,
        domain,
        riskScore,
        riskLevel,
        whoisData: whoisResult,
        sslData: sslResult,
        hostingData: hostingResult,
        scraperData: scraperResult,
        patternsData: patternsResult,
        githubData: githubResult,
        archiveData: archiveResult,
        threatData: threatResult,
        redFlags,
        createdAt: now,
        expiresAt,
      };
    }

    // Determine scan confidence based on scraper results
    const scanNotes: string[] = [];
    let scanConfidence: 'high' | 'medium' | 'low' = 'high';

    if (scraperResult.scraperLimited) {
      scanConfidence = 'low';
      if (scraperResult.scraperNote) {
        scanNotes.push(scraperResult.scraperNote);
      }
    } else if (scraperResult.error) {
      scanConfidence = 'medium';
      scanNotes.push('Some scan data may be incomplete');
    }

    // Check if site is verified
    const verifiedSite = isVerifiedSite(domain);
    const verifiedBadge = verifiedSite
      ? {
          isVerified: true,
          verifiedAt: verifiedSite.verifiedAt,
          expiresAt: verifiedSite.expiresAt,
          category: verifiedSite.category,
        }
      : { isVerified: false };

    const result: ScanResult = {
      id: savedResult.id,
      url: normalizedUrl,
      domain,
      riskScore,
      riskLevel,
      whoisData: whoisResult,
      sslData: sslResult,
      hostingData: hostingResult,
      scraperData: scraperResult,
      patternsData: patternsResult,
      githubData: githubResult,
      archiveData: archiveResult,
      threatData: threatResult,
      redFlags,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      scanConfidence,
      scanNotes,
      isKnownEntity: false,
      verifiedBadge,
    };

    return NextResponse.json({
      success: true,
      result,
      cached: false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scan URL',
      },
      { status: 500 }
    );
  }
}
