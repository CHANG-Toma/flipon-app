import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { TokenCache } from '@clerk/clerk-expo';

const createTokenCache = (): TokenCache => ({
  getToken: async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  saveToken: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      /* ignore */
    }
  },
});

/** SecureStore n’existe pas sur le web : Clerk utilise le storage navigateur. */
export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;

export const clerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || '';

export const isClerkConfigured = Boolean(clerkPublishableKey);
