import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { FlipOn } from '@/constants/flipon';
import { clerkPublishableKey, isClerkConfigured, tokenCache } from '@/lib/clerk';
import { hydrateHistory } from '@/lib/history-store';
import { hydrateSession } from '@/lib/session-store';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    void Promise.all([hydrateSession(), hydrateHistory()]);
  }, []);

  return (
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
}

export default function RootLayout() {
  if (!isClerkConfigured) {
    return <RootNavigator />;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <RootNavigator />
    </ClerkProvider>
  );
}
