/** Messages d’erreur Clerk souvent dans `errors[0].message`. */
export function humanClerkError(e: unknown, fallback = 'Une erreur est survenue.') {
  if (e && typeof e === 'object' && 'errors' in e) {
    const first = (e as { errors?: { message?: string; longMessage?: string }[] }).errors?.[0];
    if (first?.longMessage) return first.longMessage;
    if (first?.message) return first.message;
  }
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}
