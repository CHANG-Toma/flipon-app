/** Validation formulaire auth (OWASP ASVS — contrôles client, non exclusifs du serveur). */

import { tr } from '@/lib/i18n';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const MIN_PASSWORD_LENGTH = 8;

export type AuthFieldError = { field?: 'email' | 'password' | 'confirm' | 'code'; message: string };

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateEmail(raw: string): AuthFieldError | null {
  const email = normalizeEmail(raw);
  if (!email) return { field: 'email', message: tr('errors.authEmailRequired') };
  if (email.length > 254) return { field: 'email', message: tr('errors.authEmailTooLong') };
  if (!EMAIL_RE.test(email)) return { field: 'email', message: tr('errors.authEmailInvalid') };
  return null;
}

export function validateSignInCredentials(email: string, password: string): AuthFieldError | null {
  const emailErr = validateEmail(email);
  if (emailErr) return emailErr;
  if (!password) return { field: 'password', message: tr('errors.authPasswordRequired') };
  return null;
}

export function validateSignUpCredentials(
  email: string,
  password: string,
  confirmPassword: string,
): AuthFieldError | null {
  const emailErr = validateEmail(email);
  if (emailErr) return emailErr;
  if (!password) return { field: 'password', message: tr('errors.authPasswordChoose') };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      field: 'password',
      message: tr('errors.authPasswordMin', { n: MIN_PASSWORD_LENGTH }),
    };
  }
  if (password !== confirmPassword) {
    return { field: 'confirm', message: tr('errors.authPasswordMismatch') };
  }
  return null;
}

export function validateVerificationCode(code: string): AuthFieldError | null {
  const trimmed = code.trim();
  if (!trimmed) return { field: 'code', message: tr('errors.authCodeRequired') };
  if (!/^\d{4,8}$/.test(trimmed)) {
    return { field: 'code', message: tr('errors.authCodeDigits') };
  }
  return null;
}

/**
 * Message générique connexion (OWASP : éviter l’énumération de comptes).
 * Les détails Clerk ne sont pas renvoyés tels quels à l’UI.
 */
export function genericSignInError(): string {
  return tr('errors.authSignInGeneric');
}

export { MIN_PASSWORD_LENGTH };
