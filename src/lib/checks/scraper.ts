import * as cheerio from 'cheerio';
import { ScraperData, TestimonialData } from '../types';
import { fetchWithTimeout } from '../utils/timeout';

// Dangerous permission patterns
const DANGEROUS_PERMISSIONS = [
  'read all your data',
  'access all websites',
  'modify all data',
  'read and change all your data',
  'manage your downloads',
  'access your tabs',
  'read your browsing history',
  'access your clipboard',
  'capture screen',
  'access webcam',
  'access microphone',
  'access location',
  'read your contacts',
  'send emails',
  'access your files',
  'manage your apps',
  'system administrator',
  'root access',
  'sudo',
  'full disk access',
];

// Generic testimonial patterns
const GENERIC_TESTIMONIAL_PATTERNS = [
  /amazing (product|tool|app|service)/i,
  /changed my life/i,
  /best (product|tool|app|service) ever/i,
  /highly recommend/i,
  /game changer/i,
  /10\/10 would recommend/i,
  /can't live without/i,
  /must have/i,
  /love this (product|tool|app|service)/i,
  /- [A-Z]\.[A-Z]\.$/,  // "- J.D." style anonymous
  /- [A-Z][a-z]+ [A-Z]\.$/,  // "- John D." style
  /verified (user|buyer|customer)/i,
];

export async function scrapeWebsite(url: string): Promise<ScraperData> {
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    }, 15000);

    if (!response.ok) {
      return createErrorScraperData(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract basic info
    const title = $('title').text().trim() || $('h1').first().text().trim() || null;
    const description = $('meta[name="description"]').attr('content') ||
                       $('meta[property="og:description"]').attr('content') || null;

    // Check for important pages
    const allLinks = $('a[href]').map((_, el) => $(el).attr('href')).get();
    const allText = $('body').text().toLowerCase();

    const hasContactPage = allLinks.some(link =>
      /contact|support|help/i.test(link || '')
    ) || /contact us|get in touch|support@/i.test(allText);

    const hasPrivacyPolicy = allLinks.some(link =>
      /privacy/i.test(link || '')
    ) || /privacy policy/i.test(allText);

    const hasTermsOfService = allLinks.some(link =>
      /terms|tos|legal/i.test(link || '')
    ) || /terms of service|terms and conditions|terms of use/i.test(allText);

    const hasPricing = allLinks.some(link =>
      /pricing|plans|subscribe/i.test(link || '')
    ) || /pricing|our plans|\$\d+|per month|per year/i.test(allText);

    const hasDocumentation = allLinks.some(link =>
      /docs|documentation|guide|tutorial|api/i.test(link || '')
    ) || /documentation|getting started|api reference/i.test(allText);

    // Extract social links
    const socialPatterns = [
      /twitter\.com|x\.com/,
      /github\.com/,
      /linkedin\.com/,
      /facebook\.com/,
      /instagram\.com/,
      /youtube\.com/,
      /discord\.(gg|com)/,
    ];

    const socialLinks = allLinks.filter(link =>
      link && socialPatterns.some(pattern => pattern.test(link))
    ).slice(0, 10);

    // Extract external links (for pattern analysis)
    const externalLinks = allLinks.filter(link => {
      if (!link) return false;
      try {
        const linkUrl = new URL(link, url);
        const baseUrl = new URL(url);
        return linkUrl.hostname !== baseUrl.hostname;
      } catch {
        return false;
      }
    }).slice(0, 20);

    // Detect permission requests
    const permissionsRequested = DANGEROUS_PERMISSIONS.filter(perm =>
      allText.includes(perm.toLowerCase())
    );

    // Extract and analyze testimonials
    const testimonials: TestimonialData[] = [];

    // Look for testimonial sections
    const testimonialSelectors = [
      '.testimonial',
      '.review',
      '.quote',
      '[class*="testimonial"]',
      '[class*="review"]',
      'blockquote',
    ];

    testimonialSelectors.forEach(selector => {
      $(selector).each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 20 && text.length < 500) {
          // Try to extract author
          const authorMatch = text.match(/[-–—]\s*([^,\n]+)$/);
          const author = authorMatch ? authorMatch[1].trim() : null;
          const testimonialText = authorMatch ? text.replace(authorMatch[0], '').trim() : text;

          const isGeneric = GENERIC_TESTIMONIAL_PATTERNS.some(pattern =>
            pattern.test(testimonialText) || (author && pattern.test(author))
          );

          if (testimonials.length < 5) {
            testimonials.push({
              text: testimonialText.substring(0, 200),
              author,
              isGeneric,
            });
          }
        }
      });
    });

    // Detect if scraper got meaningful content (JS-heavy sites may return empty)
    const gotMeaningfulContent =
      hasPrivacyPolicy ||
      hasTermsOfService ||
      hasContactPage ||
      hasPricing ||
      hasDocumentation ||
      (title !== null && title.length > 0) ||
      (description !== null && description.length > 0) ||
      socialLinks.length > 0;

    // Check if page seems to be JS-rendered (minimal HTML content)
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const isLikelyJsRendered = bodyText.length < 200 && !gotMeaningfulContent;

    return {
      title,
      description,
      hasContactPage,
      hasPrivacyPolicy,
      hasTermsOfService,
      hasPricing,
      hasDocumentation,
      socialLinks,
      externalLinks,
      permissionsRequested,
      testimonials,
      scraperLimited: isLikelyJsRendered || !gotMeaningfulContent,
      scraperNote: isLikelyJsRendered
        ? 'Could not detect standard pages (may be JS-rendered)'
        : !gotMeaningfulContent
        ? 'Limited content detected - results may be incomplete'
        : undefined,
    };
  } catch (error) {
    return createErrorScraperData(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

function createErrorScraperData(error: string): ScraperData {
  return {
    title: null,
    description: null,
    hasContactPage: false,
    hasPrivacyPolicy: false,
    hasTermsOfService: false,
    hasPricing: false,
    hasDocumentation: false,
    socialLinks: [],
    externalLinks: [],
    permissionsRequested: [],
    testimonials: [],
    error,
  };
}
