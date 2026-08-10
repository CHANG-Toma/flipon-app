import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter, type Href } from 'expo-router';

import { signOutAndClearHint } from '@/lib/auth/sign-out';
import { validateRemoteSession } from '@/lib/auth/validate-session';

/** Re-vérif serveur au retour app : max 1× / 15 min (sauf cache expiré). */
const REVALIDATE_COOLDOWN_MS = 15 * 60 * 1000;

type Options = {
  enabled?: boolean;
};

/**
 * Re-valide la session au retour au premier plan (OWASP, throttlé).
 */
export function useAuthSessionGuard({ enabled = true }: Options = {}) {
  const { getToken, isSignedIn, isLoaded, signOut } = useAuth();
  const router = useRouter();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastCheck = useRef(0);
  const checking = useRef(false);

  useEffect(() => {
    if (!enabled || !isLoaded || !isSignedIn) return;

    const revalidate = async () => {
      if (checking.current) return;
      const now = Date.now();
      if (now - lastCheck.current < REVALIDATE_COOLDOWN_MS) return;

      checking.current = true;
      lastCheck.current = now;
      try {
        const result = await validateRemoteSession(getToken, { force: true });
        if (result === 'invalid') {
          await signOutAndClearHint(signOut);
          router.replace('/login' as Href);
        }
      } finally {
        checking.current = false;
      }
    };

    const sub = AppState.addEventListener('change', (next) => {
      const wasBackground = appState.current.match(/inactive|background/);
      appState.current = next;
      if (wasBackground && next === 'active') {
        void revalidate();
      }
    });

    return () => sub.remove();
  }, [enabled, getToken, isLoaded, isSignedIn, router, signOut]);
}
