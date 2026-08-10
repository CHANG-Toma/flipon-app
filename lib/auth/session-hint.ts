import * as SecureStore from 'expo-secure-store';

const HINT_KEY = 'flipon:auth-hint:v1';

type AuthSessionHint = {
  v: 1;
  at: number;
};

/**
 * Indice UX uniquement (OWASP) : « une session valide a existé sur cet appareil ».
 * Ne remplace jamais Clerk ni la validation serveur (/api/me).
 */
export async function markAuthSessionActive() {
  const payload: AuthSessionHint = { v: 1, at: Date.now() };
  try {
    await SecureStore.setItemAsync(HINT_KEY, JSON.stringify(payload));
  } catch {
    /* SecureStore indisponible — pas bloquant */
  }
}

export async function clearAuthSessionHint() {
  try {
    await SecureStore.deleteItemAsync(HINT_KEY);
  } catch {
    /* ignore */
  }
}

export async function hadAuthSessionHint() {
  try {
    const raw = await SecureStore.getItemAsync(HINT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<AuthSessionHint>;
    return parsed.v === 1;
  } catch {
    return false;
  }
}
