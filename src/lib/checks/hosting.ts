import { HostingData } from '../types';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);
const resolve4 = promisify(dns.resolve4);

// Known free hosting providers and their indicators
const FREE_HOSTING_PATTERNS: { pattern: RegExp; provider: string }[] = [
  { pattern: /\.netlify\.app$/i, provider: 'Netlify (Free)' },
  { pattern: /\.vercel\.app$/i, provider: 'Vercel (Free)' },
  { pattern: /\.github\.io$/i, provider: 'GitHub Pages (Free)' },
  { pattern: /\.gitlab\.io$/i, provider: 'GitLab Pages (Free)' },
  { pattern: /\.pages\.dev$/i, provider: 'Cloudflare Pages (Free)' },
  { pattern: /\.herokuapp\.com$/i, provider: 'Heroku (Free)' },
  { pattern: /\.firebaseapp\.com$/i, provider: 'Firebase (Free)' },
  { pattern: /\.web\.app$/i, provider: 'Firebase (Free)' },
  { pattern: /\.surge\.sh$/i, provider: 'Surge (Free)' },
  { pattern: /\.glitch\.me$/i, provider: 'Glitch (Free)' },
  { pattern: /\.repl\.co$/i, provider: 'Replit (Free)' },
  { pattern: /\.wixsite\.com$/i, provider: 'Wix (Free)' },
  { pattern: /\.weebly\.com$/i, provider: 'Weebly (Free)' },
  { pattern: /\.squarespace\.com$/i, provider: 'Squarespace' },
  { pattern: /\.wordpress\.com$/i, provider: 'WordPress.com (Free)' },
  { pattern: /\.blogspot\.com$/i, provider: 'Blogger (Free)' },
  { pattern: /\.carrd\.co$/i, provider: 'Carrd (Free)' },
  { pattern: /\.webflow\.io$/i, provider: 'Webflow (Free)' },
  { pattern: /\.000webhostapp\.com$/i, provider: '000webhost (Free)' },
  { pattern: /\.infinityfree/i, provider: 'InfinityFree (Free)' },
  { pattern: /\.rf\.gd$/i, provider: 'FreeHosting (Free)' },
];

// CDN detection patterns
const CDN_PATTERNS: { pattern: RegExp; name: string }[] = [
  { pattern: /cloudflare/i, name: 'Cloudflare' },
  { pattern: /fastly/i, name: 'Fastly' },
  { pattern: /akamai/i, name: 'Akamai' },
  { pattern: /cloudfront/i, name: 'CloudFront (AWS)' },
  { pattern: /incapsula/i, name: 'Incapsula' },
  { pattern: /sucuri/i, name: 'Sucuri' },
];

// Known hosting provider IP ranges (simplified)
const HOSTING_PROVIDERS: { range: string; provider: string }[] = [
  { range: '104.16.', provider: 'Cloudflare' },
  { range: '104.17.', provider: 'Cloudflare' },
  { range: '104.18.', provider: 'Cloudflare' },
  { range: '104.19.', provider: 'Cloudflare' },
  { range: '104.20.', provider: 'Cloudflare' },
  { range: '104.21.', provider: 'Cloudflare' },
  { range: '104.22.', provider: 'Cloudflare' },
  { range: '172.67.', provider: 'Cloudflare' },
  { range: '52.', provider: 'AWS' },
  { range: '54.', provider: 'AWS' },
  { range: '35.', provider: 'Google Cloud' },
  { range: '34.', provider: 'Google Cloud' },
  { range: '13.', provider: 'Azure/AWS' },
  { range: '20.', provider: 'Azure' },
  { range: '40.', provider: 'Azure' },
  { range: '76.76.', provider: 'Vercel' },
  { range: '151.101.', provider: 'Fastly' },
  { range: '185.199.', provider: 'GitHub' },
];

export async function checkHosting(domain: string): Promise<HostingData> {
  try {
    // Check if domain itself is a free hosting subdomain
    for (const { pattern, provider } of FREE_HOSTING_PATTERNS) {
      if (pattern.test(domain)) {
        return {
          provider,
          isFreeHosting: true,
          cdnDetected: null,
          ipAddress: null,
          country: null,
        };
      }
    }

    // Resolve DNS to get more info
    let ipAddress: string | null = null;
    let cname: string | null = null;

    try {
      const ips = await resolve4(domain);
      ipAddress = ips[0] || null;
    } catch {
      // Ignore DNS resolution errors
    }

    try {
      const cnames = await resolveCname(domain);
      cname = cnames[0] || null;
    } catch {
      // Ignore CNAME resolution errors
    }

    // Check CNAME for hosting indicators
    let provider: string | null = null;
    let isFreeHosting = false;
    let cdnDetected: string | null = null;

    if (cname) {
      for (const { pattern, provider: p } of FREE_HOSTING_PATTERNS) {
        if (pattern.test(cname)) {
          provider = p;
          isFreeHosting = true;
          break;
        }
      }

      // Check for CDN
      for (const { pattern, name } of CDN_PATTERNS) {
        if (pattern.test(cname)) {
          cdnDetected = name;
          break;
        }
      }
    }

    // Check IP for hosting provider
    if (ipAddress && !provider) {
      for (const { range, provider: p } of HOSTING_PROVIDERS) {
        if (ipAddress.startsWith(range)) {
          provider = p;
          break;
        }
      }
    }

    return {
      provider,
      isFreeHosting,
      cdnDetected,
      ipAddress,
      country: null, // Would require GeoIP lookup
    };
  } catch (error) {
    return {
      provider: null,
      isFreeHosting: false,
      cdnDetected: null,
      ipAddress: null,
      country: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
