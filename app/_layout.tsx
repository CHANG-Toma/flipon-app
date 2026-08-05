import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { FlipOn } from '@/constants/flipon';
import { setAuthTokenGetter, syncMe } from '@/lib/api';
import { clerkPublishableKey, isClerkConfigured, tokenCache } from '@/lib/clerk';
import { hydrateHistory, pullCloudHistory } from '@/lib/history-store';
import { hydrateSession } from '@/lib/session-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthBridge({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

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
    void (async () => {
      try {
        await syncMe();
        await pullCloudHistory();
      } catch {
        /* offline / not configured */
      }
    })();
  }, [isSignedIn]);

  return children;
}

function RootNavigator({ withAuthBridge = false }: { withAuthBridge?: boolean }) {
  const colorScheme = useColorScheme();

  useEffect(() => {
    void Promise.all([hydrateSession(), hydrateHistory()]);
  }, []);

  const tree = (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: FlipOn.bg },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="vote" />
        <Stack.Screen name="result" />
        <Stack.Screen name="boost" />
        <Stack.Screen name="join/[code]" />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );

  if (withAuthBridge) {
    return <AuthBridge>{tree}</AuthBridge>;
  }
  return tree;
}

export default function RootLayout() {
  if (!isClerkConfigured) {
    return <RootNavigator />;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <RootNavigator withAuthBridge />
    </ClerkProvider>
  );
}
