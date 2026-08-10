const MIN_LENGTH = 8;

export type PasswordValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validatePasswordPair(
  password: string,
  confirmPassword: string,
): PasswordValidationResult {
  if (!password) {
    return { ok: false, message: 'Indique un nouveau mot de passe.' };
  }
  if (password.length < MIN_LENGTH) {
    return {
      ok: false,
      message: `Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`,
    };
  }
  if (password !== confirmPassword) {
    return { ok: false, message: 'Les mots de passe ne correspondent pas.' };
  }
  return { ok: true };
}
