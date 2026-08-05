/** Normalise un code session saisi (A-Z / 2-9, max 4). */
export function normalizeSessionCode(raw: string) {
  return raw
    .trim()
    .toUpperCase()
    .replace(/^FLIP-/, '')
    .replace(/[^A-Z2-9]/g, '')
    .slice(0, 4);
}

export function isValidSessionCode(code: string) {
  return /^[A-Z2-9]{4}$/.test(code);
}
