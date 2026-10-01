/**
 * In-Memory Sliding Window Rate Limiter
 * Layer 11: Rate Limiting
 *
 * Enforces per-IP and per-key rate limits with automated expiration
 * and retry-after tracking.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

// Clean up expired keys every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let cleanupScheduled = false;

function ensureCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  if (typeof setInterval !== 'undefined') {
    const timer = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of store.entries()) {
        if (now > record.resetAt) {
          store.delete(key);
        }
      }
    }, CLEANUP_INTERVAL_MS);
    if (timer.unref) timer.unref();
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfterSeconds: number;
}

/**
 * Check if a given key (IP or identifier) has exceeded the rate limit.
 *
 * @param key Unique identifier (e.g. client IP, phone number)
 * @param limit Maximum allowed requests in the time window (default: 60)
 * @param windowMs Time window in milliseconds (default: 60,000 ms = 1 min)
 */
export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60000
): RateLimitResult {
  ensureCleanup();

  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetAt,
      retryAfterSeconds: 0,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);

  if (record.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.resetAt,
      retryAfterSeconds,
    };
  }

  return {
    success: true,
    limit,
    remaining,
    reset: record.resetAt,
    retryAfterSeconds: 0,
  };
}

/**
 * Pre-configured rate limits for sensitive routes
 */
export const RateLimits = {
  // Sensitive endpoints: OTP requests, passwordless verification
  AUTH: { limit: 10, windowMs: 60 * 1000 },
  // Payment initiation: order creation
  PAYMENTS: { limit: 15, windowMs: 60 * 1000 },
  // General API queries
  STANDARD: { limit: 100, windowMs: 60 * 1000 },
} as const;
