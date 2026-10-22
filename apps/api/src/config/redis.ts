import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();


// seperate redis service for cache storage - using upstash redis
const redisUri = process.env.REDIS_URI_CACHE;
if (!redisUri) {
  throw new Error('Redis URL not provided');
}

export const redis = new Redis(redisUri, {
  // lazyConnect: true,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    console.log(`Retrying Redis connection (attempt ${times})...`);
    return delay;
  },
});

export type redisClientType = typeof redis;

redis.on('connect', () => {
  console.log('✓ Connected to Redis Cloud ❤️');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});