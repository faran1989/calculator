/**
 * lib/rateLimit.ts
 *
 * In-memory rate limiter — works correctly on localhost/single-process.
 *
 * ⚠️ PRODUCTION NOTE (Vercel):
 * Vercel runs serverless functions in isolated instances.
 * This in-memory store does NOT persist across invocations in production.
 * Before deploying to Vercel, replace this with an Upstash Redis-backed limiter:
 * https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterMs: number };

export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1 };
  }

  if (entry.count >= options.limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, remaining: options.limit - entry.count };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
