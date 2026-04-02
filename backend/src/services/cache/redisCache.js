import Redis from 'ioredis';
import { promisify } from 'util';

class RedisCache {
  constructor() {
    this.client = new Redis(process.env.REDIS_URL);
    this.defaultTTL = 3600; // 1 hour
    
    this.client.on('error', (err) => console.error('Redis error:', err));
    this.client.on('connect', () => console.log('Redis connected'));
  }

  async get(key) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key, value, ttl = this.defaultTTL) {
    await this.client.setex(key, ttl, JSON.stringify(value));
  }

  async del(key) {
    await this.client.del(key);
  }

  async clearPattern(pattern) {
    const keys = await this.client.keys(pattern);
    if (keys.length) {
      await this.client.del(keys);
    }
  }

  async increment(key, by = 1) {
    return await this.client.incrby(key, by);
  }

  // Cache aside pattern
  async remember(key, callback, ttl = this.defaultTTL) {
    const cached = await this.get(key);
    if (cached) return cached;
    
    const fresh = await callback();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  // Rate limiting
  async rateLimit(key, limit = 100, window = 60) {
    const current = await this.client.incr(key);
    if (current === 1) {
      await this.client.expire(key, window);
    }
    return current <= limit;
  }

  // Distributed locks
  async acquireLock(key, ttl = 10) {
    const lockKey = `lock:${key}`;
    const acquired = await this.client.setnx(lockKey, Date.now());
    if (acquired) {
      await this.client.expire(lockKey, ttl);
      return true;
    }
    return false;
  }

  async releaseLock(key) {
    await this.client.del(`lock:${key}`);
  }
}

export const cache = new RedisCache();