/**
 * Root layout FlipOn — composition root (DI + navigation).
 */
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import 'react-native-reanimated';

import { AuthBridge } from '@/providers/AuthBridge';
import { ClerkMissingGate } from '@/providers/ClerkMissingGate';
import { I18nProvider } from '@/providers/I18nProvider';
import { ConfirmHost } from '@/components/ui/ConfirmHost';
import { FlipOn } from '@/constants/flipon';
import { setAccountCleanup } from '@/lib/account-cleanup';
import { clearAuthSessionHint } from '@/lib/auth/session-hint';
import { clerkPublishableKey, isClerkConfigured, tokenCache } from '@/lib/clerk';
import { addHistoryEntry, clearHistory, hydrateHistory } from '@/lib/history/store';
import { setSessionHistoryWriter } from '@/lib/session/history-port';
import { clearActiveSession, hydrateSession } from '@/lib/session/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

function wirePorts() {
  setSessionHistoryWriter(async (entry) => {
    await addHistoryEntry(entry);
  });
  setAccountCleanup(async () => {
    await Promise.all([clearActiveSession(), clearHistory(), clearAuthSessionHint()]);
  });
}

function RootNavigator({ gate }: { gate: 'auth' | 'missing' | 'none' }) {
  useEffect(() => {
    wirePorts();
    void Promise.all([hydrateSession(), hydrateHistory()]);
    return () => {
      setSessionHistoryWriter(null);
      setAccountCleanup(null);
    };
  }, []);

  const tree = (
    <I18nProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: FlipOn.bg },
          }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="vote" />
          <Stack.Screen name="result" />
          <Stack.Screen name="subscription" />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="history-entry/[id]" />
          <Stack.Screen name="join/[code]" />
        </Stack>
        <ConfirmHost />
        <StatusBar style="light" />
      </ThemeProvider>
    </I18nProvider>
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
