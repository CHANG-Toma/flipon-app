/** Validation formulaire auth (OWASP ASVS — contrôles client, non exclusifs du serveur). */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const MIN_PASSWORD_LENGTH = 8;

export type AuthFieldError = { field?: 'email' | 'password' | 'confirm' | 'code'; message: string };

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateEmail(raw: string): AuthFieldError | null {
  const email = normalizeEmail(raw);
  if (!email) return { field: 'email', message: 'Indique ton e-mail.' };
  if (email.length > 254) return { field: 'email', message: 'E-mail trop long.' };
  if (!EMAIL_RE.test(email)) return { field: 'email', message: 'E-mail invalide.' };
  return null;
}

export function validateSignInCredentials(email: string, password: string): AuthFieldError | null {
  const emailErr = validateEmail(email);
  if (emailErr) return emailErr;
  if (!password) return { field: 'password', message: 'Indique ton mot de passe.' };
  return null;
}

export function validateSignUpCredentials(
  email: string,
  password: string,
  confirmPassword: string,
): AuthFieldError | null {
  const emailErr = validateEmail(email);
  if (emailErr) return emailErr;
  if (!password) return { field: 'password', message: 'Choisis un mot de passe.' };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      field: 'password',
      message: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
    };
  }
  if (password !== confirmPassword) {
    return { field: 'confirm', message: 'Les mots de passe ne correspondent pas.' };
  }
  return null;
}

export function validateVerificationCode(code: string): AuthFieldError | null {
  const trimmed = code.trim();
  if (!trimmed) return { field: 'code', message: 'Entre le code reçu par e-mail.' };
  if (!/^\d{4,8}$/.test(trimmed)) {
    return { field: 'code', message: 'Le code doit contenir uniquement des chiffres.' };
  }
  return null;
}

/**
 * Message générique connexion (OWASP : éviter l’énumération de comptes).
 * Les détails Clerk ne sont pas renvoyés tels quels à l’UI.
 */
export function genericSignInError(): string {
  return 'E-mail ou mot de passe incorrect.';
}

export { MIN_PASSWORD_LENGTH };
