const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function normalizeBdPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let phone = value.replace(/[\s()-]/g, "");
  if (phone.startsWith("+880")) phone = "0" + phone.slice(4);
  else if (phone.startsWith("880")) phone = "0" + phone.slice(3);
  return /^01[3-9]\d{8}$/.test(phone) ? phone : null;
}

/**
 * Process-local limiter for single-instance deployments.
 * Use a shared Redis/Upstash store before running multiple app instances.
 */
export function consumeRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  if (rateLimitStore.size > 10_000) {
    for (const [storedKey, entry] of rateLimitStore) {
      if (entry.resetAt <= now) rateLimitStore.delete(storedKey);
    }
  }
  return true;
}
