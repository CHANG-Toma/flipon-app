import { tr } from '@/lib/i18n';

const MIN_LENGTH = 8;

export type PasswordValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validatePasswordPair(
  password: string,
  confirmPassword: string,
): PasswordValidationResult {
  if (!password) {
    return { ok: false, message: tr('password.needNew') };
  }
  if (password.length < MIN_LENGTH) {
    return {
      ok: false,
      message: tr('password.minLength', { n: MIN_LENGTH }),
    };
  }
  if (password !== confirmPassword) {
    return { ok: false, message: tr('password.mismatch') };
  }
  return { ok: true };
}
