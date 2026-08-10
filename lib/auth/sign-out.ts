import { clearAuthSessionHint } from '@/lib/auth/session-hint';
import { invalidateValidationCache } from '@/lib/auth/validation-cache';

/** Déconnexion Clerk + purge caches locaux (hint + validation). */
export async function signOutAndClearHint(signOut: () => Promise<unknown>) {
  invalidateValidationCache();
  try {
    await signOut();
  } finally {
    await clearAuthSessionHint();
  }
}
