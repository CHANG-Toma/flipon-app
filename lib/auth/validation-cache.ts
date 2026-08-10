import type { SessionValidation } from '@/lib/auth/validate-session';

/** Cache mémoire : évite de spammer /api/me (TTL 15 min). */
const CACHE_TTL_MS = 15 * 60 * 1000;

let cached: { at: number; result: SessionValidation } | null = null;

export function getCachedValidation(): SessionValidation | null {
  if (!cached) return null;
  if (Date.now() - cached.at > CACHE_TTL_MS) {
    cached = null;
    return null;
  }
  return cached.result;
}

export function setCachedValidation(result: SessionValidation) {
  cached = { at: Date.now(), result };
}

export function invalidateValidationCache() {
  cached = null;
}
