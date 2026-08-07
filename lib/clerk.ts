/**
 * Config Clerk côté app mobile
 * ----------------------------
 * - Publishable key : `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (jamais la secret key ici)
 * - Token cache : SecureStore sur iOS/Android pour persister la session entre relaunches
 * - Web : pas de SecureStore → Clerk utilise le storage navigateur (`tokenCache` undefined)
 *
 * `isClerkConfigured` pilote le gate dans `app/_layout` :
 * - false → écran login avec instructions (pas d’accès app)
 * - true  → ClerkProvider + AuthBridge
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { TokenCache } from '@clerk/clerk-expo';

const createTokenCache = (): TokenCache => ({
  getToken: async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      // SecureStore peut échouer (device lock, quota) : session non restaurée.
      return null;
    }
  },
  saveToken: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      /* ignore — l’utilisateur devra se reconnecter au prochain lancement */
    }
  },
});

/** Cache session natif uniquement (pas sur web). */
export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;

export const clerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || '';

/** True si une publishable key est présente dans l’env au build/runtime Metro. */
export const isClerkConfigured = Boolean(clerkPublishableKey);
