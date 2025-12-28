// Upstash Redis Cache for Threat Intelligence
// Caches URLhaus lookups to reduce API calls and improve response time

import { Redis } from '@upstash/redis';
import { ThreatData } from '../types';
import { checkURLhaus } from './urlhaus';

// Cache TTL: 1 hour for clean URLs, 24 hours for malicious
const CLEAN_CACHE_TTL = 3600; // 1 hour
const MALICIOUS_CACHE_TTL = 86400; // 24 hours

// Initialize Redis client (uses env vars automatically)
function getRedisClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Generate cache key from URL
function getCacheKey(url: string): string {
  // Normalize URL for consistent caching
  try {
    const parsed = new URL(url);
    // Use origin + pathname (ignore query params for cache key)
    return `threat:${parsed.origin}${parsed.pathname}`.toLowerCase();
  } catch {
    return `threat:${url}`.toLowerCase();
  }
}

// Main function: Get threat data with caching
export async function getCachedThreatData(url: string): Promise<ThreatData> {
  const redis = getRedisClient();
  const cacheKey = getCacheKey(url);

  // If Redis is not configured, go direct to URLhaus
  if (!redis) {
    console.log('Upstash not configured, calling URLhaus directly');
    return checkURLhaus(url);
  }

  try {
    // Try to get from cache first
    const cached = await redis.get<ThreatData>(cacheKey);

    if (cached) {
      console.log(`Threat cache hit for ${url}`);
      return {
        ...cached,
        source: 'cache',
      };
    }

    // Cache miss - fetch from URLhaus
    console.log(`Threat cache miss for ${url}, fetching from URLhaus`);
    const freshData = await checkURLhaus(url);

    // Cache the result (longer TTL for malicious URLs since they don't change)
    const ttl = freshData.isMalicious ? MALICIOUS_CACHE_TTL : CLEAN_CACHE_TTL;
    await redis.setex(cacheKey, ttl, JSON.stringify(freshData));

    return freshData;
  } catch (error) {
    console.warn('Redis cache error, falling back to direct lookup:', error);
    // If Redis fails, still try to get the data
    return checkURLhaus(url);
  }
}

// Utility: Clear cache for a specific URL (useful for re-scanning)
export async function clearThreatCache(url: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    const cacheKey = getCacheKey(url);
    await redis.del(cacheKey);
    return true;
  } catch {
    return false;
  }
}

// Utility: Check if Redis is properly configured
export function hasRedisConfig(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
