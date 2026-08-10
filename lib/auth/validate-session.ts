import { syncMe } from '@/lib/api/me';
import { ApiError, NetworkError } from '@/lib/http';
import {
  getCachedValidation,
  setCachedValidation,
} from '@/lib/auth/validation-cache';

export type SessionValidation = 'valid' | 'invalid' | 'offline';

const VALIDATION_TIMEOUT_MS = 8_000;

type Options = {
  /** Ignore le cache mémoire (ex. après 15 min en arrière-plan). */
  force?: boolean;
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new NetworkError()), ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

/**
 * Valide la session côté serveur (JWT Clerk → /api/me).
 * Résultat mis en cache 15 min pour limiter la charge API.
 */
export async function validateRemoteSession(
  getToken: () => Promise<string | null>,
  options?: Options,
): Promise<SessionValidation> {
  if (!options?.force) {
    const hit = getCachedValidation();
    if (hit) return hit;
  }

  let token: string | null = null;
  try {
    token = await getToken();
  } catch {
    return 'invalid';
  }

  if (!token) return 'invalid';

  let result: SessionValidation;
  try {
    await withTimeout(syncMe(), VALIDATION_TIMEOUT_MS);
    result = 'valid';
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      result = 'invalid';
    } else {
      result = 'offline';
    }
  }

  if (result === 'valid' || result === 'offline') {
    setCachedValidation(result);
  }

  return result;
}
