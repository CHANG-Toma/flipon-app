import { humanClerkError } from '@/lib/auth/human-clerk-error';
import { runAccountCleanup } from '@/lib/account-cleanup';
import { tr } from '@/lib/i18n';

type DeletableUser = {
  delete: () => Promise<unknown>;
};

/**
 * Suppression de compte (RGPD / stores).
 * Prérequis Clerk dashboard : Users can delete their own accounts.
 * La purge locale passe par `setAccountCleanup` (DIP).
 */
export async function deleteAccountLocalAndClerk(user: DeletableUser) {
  await user.delete();
  await runAccountCleanup();
}

export function humanDeleteError(e: unknown): string {
  return humanClerkError(e, tr('errors.deleteAccount'));
}
