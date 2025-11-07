import { Redis } from 'ioredis';

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;
  
  const REDIS_URL = process.env.REDIS_URL;
  if (!REDIS_URL) return null;
  
  try {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });
    return redisClient;
  } catch {
    return null;
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds: number = 300
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function deleteCache(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.del(key);
    return true;
  } catch {
    return false;
  }
}

export async function deleteCachePattern(pattern: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return true;
  } catch {
    return false;
  }
}

export function getCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 1800,
  VERY_LONG: 3600,
  STATIC: 86400,
};

