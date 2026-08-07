/**
 * Root layout FlipOn
 * -----------------
 * Point d’entrée Expo Router. Responsabilités :
 * 1. Fournir Clerk (session JWT) si `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` est défini
 * 2. Gate d’auth : l’app (tabs, vote, join…) n’est accessible que connecté
 * 3. Brancher le JWT sur les appels API (`setAuthTokenGetter`) + sync user/historique
 * 4. Hydrater le stockage local (session duo / historique) au démarrage
 *
 * Flux UX : splash logo → /login → (tabs) une fois signed-in.
 * Sans clé Clerk : on reste sur /login avec le message de config (gate "missing").
 */
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { FlipOn } from '@/constants/flipon';
import { setAuthTokenGetter, syncMe } from '@/lib/api';
import { clerkPublishableKey, isClerkConfigured, tokenCache } from '@/lib/clerk';
import { hydrateHistory, pullCloudHistory } from '@/lib/history-store';
import { hydrateSession } from '@/lib/session-store';

/** Écran initial tant que Clerk n’a pas chargé / que la redirection n’est pas décidée. */
export const unstable_settings = {
  anchor: 'login',
};

/** Splash brand pendant le boot auth (logo remplaçable : assets/images/logo.png). */
function SplashBoot() {
  return (
    <View style={styles.boot}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.bootLogo}
        accessibilityLabel="FlipOn"
      />
      <Text style={styles.bootName}>FlipOn</Text>
      <ActivityIndicator color={FlipOn.accent} style={{ marginTop: 20 }} />
    </View>
  );
}

/**
 * Pont Clerk ↔ app.
 * - Injecte le JWT dans `lib/api` pour /api/me, /api/history, etc.
 * - Après login : upsert user serveur + pull historique cloud
 * - Redirige non-connecté → /login, connecté sur /login → /(tabs)
 */
function AuthBridge({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Chaque requête API authentifiée lit ce getter (Bearer).
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

  // Sync best-effort : ne bloque pas l’UI si API / réseau down.
  useEffect(() => {
    if (!isSignedIn) return;
    void (async () => {
      try {
        await syncMe();
        await pullCloudHistory();
      } catch {
        /* offline / API non configurée */
      }
    })();
  }, [isSignedIn]);

  // Garde de navigation (toutes les routes app sauf /login).
  useEffect(() => {
    if (!isLoaded) return;

    // Cast : typed routes Expo peut être en retard juste après l’ajout de login.tsx
    const onLogin = segments[0] === ('login' as (typeof segments)[0]);

    if (!isSignedIn && !onLogin) {
      router.replace('/login' as Href);
    } else if (isSignedIn && onLogin) {
      router.replace('/(tabs)' as Href);
    }

    setReady(true);
  }, [isLoaded, isSignedIn, segments, router]);

  if (!isLoaded || !ready) {
    return <SplashBoot />;
  }

  return <>{children}</>;
}

/**
 * Fallback si la publishable key Clerk est absente :
 * on force /login pour afficher les instructions, sans ouvrir l’app.
 */
function ClerkMissingGate({ children }: { children: ReactNode }) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (segments[0] !== ('login' as (typeof segments)[0])) {
      router.replace('/login' as Href);
    }
  }, [segments, router]);

  return <>{children}</>;
}

/**
 * Stack racine + hydratation AsyncStorage.
 * `gate` choisit le wrapper auth selon la présence de Clerk.
 */
function RootNavigator({ gate }: { gate: 'auth' | 'missing' | 'none' }) {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Données locales (sessions / historique) — indépendant de Clerk
    void Promise.all([hydrateSession(), hydrateHistory()]);
  }, []);

  const tree = (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: FlipOn.bg },
        }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="vote" />
        <Stack.Screen name="result" />
        <Stack.Screen name="boost" />
        <Stack.Screen name="join/[code]" />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );

  if (gate === 'auth') {
    return <AuthBridge>{tree}</AuthBridge>;
  }
  if (gate === 'missing') {
    return <ClerkMissingGate>{tree}</ClerkMissingGate>;
  }
  return tree;
}

export default function RootLayout() {
  if (!isClerkConfigured) {
    return <RootNavigator gate="missing" />;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <RootNavigator gate="auth" />
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.bg,
    gap: 8,
  },
  bootLogo: {
    width: 88,
    height: 88,
    borderRadius: 22,
  },
  bootName: {
    fontSize: 28,
    fontWeight: '800',
    color: FlipOn.ink,
    letterSpacing: -0.5,
  },
});
