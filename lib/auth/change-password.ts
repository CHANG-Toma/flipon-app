import type { UserResource } from '@clerk/types';

import { humanClerkError } from '@/lib/auth/human-clerk-error';

/** Change le mot de passe FlipOn (compte e-mail déjà avec MDP). */
export async function changeFlipOnPassword(
  user: UserResource,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  try {
    await user.updatePassword({
      currentPassword,
      newPassword,
      signOutOfOtherSessions: true,
    });
  } catch (e) {
    throw new Error(
      humanClerkError(e, 'Mot de passe actuel incorrect ou nouveau mot de passe refusé.'),
    );
  }
}
