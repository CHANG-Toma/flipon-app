import { clearAuthSessionHint } from '@/lib/auth/session-hint';
import { invalidateValidationCache } from '@/lib/auth/validation-cache';
import { resetPurchasesUser } from '@/lib/revenuecat';

/** Déconnexion Clerk + purge caches locaux (hint + validation) + RevenueCat. */
export async function signOutAndClearHint(signOut: () => Promise<unknown>) {
  invalidateValidationCache();
  try {
    await signOut();
  } finally {
    try {
      await resetPurchasesUser();
    } catch {
      /* ignore */
    }
    await clearAuthSessionHint();
  }
}
