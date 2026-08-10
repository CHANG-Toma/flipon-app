/**
 * Port : purge locale après suppression de compte (DIP).
 * Branché depuis le composition root (`app/_layout`).
 */
export type AccountCleanup = () => Promise<void>;

let cleanup: AccountCleanup | null = null;

// Permet de définir la fonction de nettoyage des données du compte
export function setAccountCleanup(next: AccountCleanup | null) {
  cleanup = next;
}

// Permet de nettoyer les données du compte après la suppression
export async function runAccountCleanup() {
  if (!cleanup) return;
  await cleanup();
}
