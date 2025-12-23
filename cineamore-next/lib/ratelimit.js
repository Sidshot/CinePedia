
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Cache for local development (In-Memory Map)
const localCache = new Map();

export function getRateLimit() {
    // PRODUCTION: Use Upstash Redis
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        return new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(10, '10 s'), // Default safe fallback
            analytics: true,
            prefix: '@upstash/ratelimit',
        });
    }

    // DEVELOPMENT: Mock Implementation using Map
    // This ensures local dev doesn't break without Redis credentials
    console.warn('⚠️ Rate Limiting is running in LOCAL MEMORY mode. Do not use in production.');

    return {
        limit: async (identifier) => {
            const now = Date.now();
            const windowSize = 60 * 1000; // 1 minute window for local testing

            if (!localCache.has(identifier)) {
                localCache.set(identifier, { count: 1, reset: now + windowSize });
                return { success: true, limit: 10, remaining: 9, reset: now + windowSize };
            }

            const record = localCache.get(identifier);
            if (now > record.reset) {
                // Window expired, reset
                localCache.set(identifier, { count: 1, reset: now + windowSize });
                return { success: true, limit: 10, remaining: 9, reset: now + windowSize };
            }

            record.count += 1;
            const remaining = Math.max(0, 10 - record.count);
            return {
                success: record.count <= 10,
                limit: 10,
                remaining,
                reset: record.reset
            };
        }
    };
}
