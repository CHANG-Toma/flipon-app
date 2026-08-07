import { clearHistory } from '@/lib/history-store';
import { clearActiveSession } from '@/lib/session-store';

type DeletableUser = {
  delete: () => Promise<unknown>;
};

/**
 * Suppression de compte (RGPD / stores).
 * Prérequis Clerk dashboard : Users can delete their own accounts.
 * La purge Postgres serveur (DELETE /api/me) reste à brancher plus tard.
 */
export async function deleteAccountLocalAndClerk(user: DeletableUser) {
  await user.delete();
  await Promise.all([clearActiveSession(), clearHistory()]);
}

export function humanDeleteError(e: unknown): string {
  if (e && typeof e === 'object' && 'errors' in e) {
    const first = (e as { errors?: { message?: string; longMessage?: string }[] }).errors?.[0];
    if (first?.longMessage) return first.longMessage;
    if (first?.message) return first.message;
  }
  if (e instanceof Error && e.message) return e.message;
  return 'Impossible de supprimer le compte. Vérifie la config Clerk ou réessaie plus tard.';
}
