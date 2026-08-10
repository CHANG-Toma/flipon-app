import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useSegments, type Href } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { SplashBoot } from '@/providers/SplashBoot';
import { setAuthTokenGetter, syncMe } from '@/lib/api';
import { pullCloudHistory } from '@/lib/history/store';

/**
 * Pont Clerk ↔ app.
 * Le Stack (children) est toujours monté dès le 1er render — obligatoire pour
 * Expo Router. Le splash premium est un overlay avec sortie en fondu.
 */
export function AuthBridge({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [navReady, setNavReady] = useState(false);
  const [gateDone, setGateDone] = useState(false);
  const [splashMounted, setSplashMounted] = useState(true);
  const overlayOpacity = useSharedValue(1);

  const showSplash = !isLoaded || !gateDone;

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
          <SplashBoot />
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
