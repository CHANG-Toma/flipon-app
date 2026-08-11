import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useSegments, type Href } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useAuthSessionGuard } from '@/hooks/use-auth-session-guard';
import { SplashBoot } from '@/providers/SplashBoot';
import { setAuthTokenGetter } from '@/lib/api';
import {
  markAuthSessionActive,
  clearAuthSessionHint,
  hadAuthSessionHint,
} from '@/lib/auth/session-hint';
import { signOutAndClearHint } from '@/lib/auth/sign-out';
import { validateRemoteSession } from '@/lib/auth/validate-session';
import { pullCloudHistory, setHistoryScope } from '@/lib/history/store';
import {
  identifyPurchasesUser,
  resetPurchasesUser,
} from '@/lib/revenuecat';
import { setSessionScope } from '@/lib/session/store';
import { tr } from '@/lib/i18n';

/**
 * Pont Clerk ↔ app.
 * Bootstrap une seule fois (évite boucle infinie + spam /api/me).
 */
export function AuthBridge({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn, isLoaded, signOut, userId } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const bootstrapped = useRef(false);
  const historyPulled = useRef(false);
  const identityScopeRef = useRef<string>('guest');
  const [gateDone, setGateDone] = useState(false);
  const [splashMounted, setSplashMounted] = useState(true);
  const [splashMessage, setSplashMessage] = useState<string | undefined>();
  const overlayOpacity = useSharedValue(1);

  useAuthSessionGuard({ enabled: gateDone });

  const showSplash = !isLoaded || !gateDone;

  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        return (await getToken()) ?? null;
      } catch {
        return null;
      }
    });
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    const nextScope = isSignedIn && userId ? userId : 'guest';
    if (identityScopeRef.current === nextScope) return;

    identityScopeRef.current = nextScope;
    historyPulled.current = false;
    void (async () => {
      await setHistoryScope(nextScope);
      setSessionScope(nextScope);
      if (isSignedIn && userId) {
        try {
          await identifyPurchasesUser(userId);
        } catch {
          /* best-effort */
        }
        try {
          await pullCloudHistory();
          historyPulled.current = true;
        } catch {
          /* best-effort */
        }
      } else {
        try {
          await resetPurchasesUser();
        } catch {
          /* best-effort */
        }
      }
    })();
  }, [isLoaded, isSignedIn, userId]);

  useEffect(() => {
    if (!isLoaded || bootstrapped.current) return;
    bootstrapped.current = true;

    void (async () => {
      try {
        if (await hadAuthSessionHint()) {
          setSplashMessage(tr('login.reconnecting'));
        }

        if (isSignedIn) {
          const validation = await validateRemoteSession(getToken);

          if (validation === 'invalid') {
            await signOutAndClearHint(signOut);
            return;
          }

          await markAuthSessionActive();

          if (validation === 'valid' && !historyPulled.current) {
            historyPulled.current = true;
            try {
              await pullCloudHistory();
            } catch {
              /* best-effort */
            }
          }
        } else {
          await clearAuthSessionHint();
        }
      } finally {
        setGateDone(true);
      }
    })();
  }, [isLoaded, isSignedIn, getToken, signOut]);

  useEffect(() => {
    if (!isLoaded || !gateDone) return;

    const onLogin = segments[0] === ('login' as (typeof segments)[0]);

    if (!isSignedIn && !onLogin) {
      router.replace('/login' as Href);
    } else if (isSignedIn && onLogin) {
      router.replace('/(tabs)' as Href);
    }
  }, [isLoaded, gateDone, isSignedIn, segments, router]);

  useEffect(() => {
    if (showSplash) {
      overlayOpacity.value = 1;
      setSplashMounted(true);
      return;
    }

    overlayOpacity.value = withTiming(0, { duration: 420 }, (finished) => {
      if (finished) runOnJS(setSplashMounted)(false);
    });
  }, [showSplash, overlayOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View style={styles.root}>
      {children}
      {splashMounted ? (
        <Animated.View
          style={[styles.splashOverlay, overlayStyle]}
          pointerEvents={showSplash ? 'auto' : 'none'}>
          <SplashBoot message={splashMessage} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
