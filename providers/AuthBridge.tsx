import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useSegments, type Href } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

import { SplashBoot } from '@/providers/SplashBoot';
import { setAuthTokenGetter, syncMe } from '@/lib/api';
import { pullCloudHistory } from '@/lib/history/store';

/**
 * Pont Clerk ↔ app.
 * Le Stack (children) est toujours monté dès le 1er render — obligatoire pour
 * Expo Router. Le splash est un overlay jusqu’à ce que Clerk + gate soient prêts.
 */
export function AuthBridge({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  /** Navigator monté (après 1er paint avec le Stack). */
  const [navReady, setNavReady] = useState(false);
  /** Gate auth déjà évalué — on peut retirer le splash. */
  const [gateDone, setGateDone] = useState(false);

  useEffect(() => {
    setNavReady(true);
  }, []);

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
    if (!isSignedIn) return;

    let cancelled = false;
    void (async () => {
      try {
        let token: string | null = null;
        for (let i = 0; i < 10; i++) {
          token = await getToken();
          if (token) break;
          await new Promise((r) => setTimeout(r, 150));
        }
        if (cancelled) return;
        if (!token) {
          if (__DEV__) {
            console.warn('[FlipOn] syncMe: pas de JWT Clerk — User non créé en BDD');
          }
          return;
        }
        await syncMe();
        await pullCloudHistory();
      } catch (e) {
        if (__DEV__) {
          console.warn('[FlipOn] syncMe / history failed', e);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (!isLoaded || !navReady) return;

    const onLogin = segments[0] === ('login' as (typeof segments)[0]);

    if (!isSignedIn && !onLogin) {
      router.replace('/login' as Href);
    } else if (isSignedIn && onLogin) {
      router.replace('/(tabs)' as Href);
    }

    setGateDone(true);
  }, [isLoaded, isSignedIn, segments, router, navReady]);

  const showSplash = !isLoaded || !gateDone;

  return (
    <View style={styles.root}>
      {children}
      {showSplash ? (
        <View style={styles.splashOverlay} pointerEvents="auto">
          <SplashBoot />
        </View>
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
