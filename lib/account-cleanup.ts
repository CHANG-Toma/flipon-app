/**
 * Port : purge locale après suppression de compte (DIP).
 * Branché depuis le composition root (`app/_layout`).
 */
export type AccountCleanup = () => Promise<void>;

let cleanup: AccountCleanup | null = null;

export function setAccountCleanup(next: AccountCleanup | null) {
  cleanup = next;
}

export async function runAccountCleanup() {
  if (!cleanup) return;
  await cleanup();
}
