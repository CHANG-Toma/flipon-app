type ExternalAccountLike = {
  provider?: string | null;
};

type UserLike = {
  passwordEnabled?: boolean;
  externalAccounts?: ExternalAccountLike[] | null;
};

function providerIsGoogle(provider: string | null | undefined): boolean {
  if (!provider) return false;
  const p = provider.toLowerCase();
  return p === 'google' || p === 'oauth_google';
}

/** Compte lié à Google (OAuth). */
export function isGoogleLinkedAccount(user: UserLike | null | undefined): boolean {
  return Boolean(user?.externalAccounts?.some((a) => providerIsGoogle(a.provider)));
}

/**
 * Affiche la section « modifier mon mot de passe » FlipOn
 * uniquement si le compte a déjà un mot de passe e-mail (pas Google seul).
 */
export function canChangeFlipOnPassword(user: UserLike | null | undefined): boolean {
  return Boolean(user?.passwordEnabled);
}
