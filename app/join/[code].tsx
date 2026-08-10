import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { ErrorState } from '@/components/ui/ErrorState';
import { FlipOn } from '@/constants/flipon';
import { useMounted } from '@/hooks/use-mounted';
import { usePolling } from '@/hooks/use-polling';
import { ApiError, NetworkError } from '@/lib/http';
import { isValidSessionCode, normalizeSessionCode } from '@/lib/session-code';
import { joinByCode, refreshSession } from '@/lib/session/store';

export default function JoinScreen() {
  const router = useRouter();
  const isMounted = useMounted();
  const { code } = useLocalSearchParams<{ code: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [waitingHost, setWaitingHost] = useState(false);
  const displayCode = normalizeSessionCode(String(code ?? ''));

  const join = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setWaitingHost(false);

      if (!isValidSessionCode(displayCode)) {
        throw new ApiError('Code invalide ou expiré.', 400);
      }

      const session = await joinByCode(displayCode);
      if (!isMounted()) return;

      if (session.role === 'host') {
        router.replace('/session');
        return;
      }

      if (session.status === 'voting' || session.hostReady) {
        router.replace('/vote');
        return;
      }

      setWaitingHost(true);
      setLoading(false);
    } catch (e) {
      if (!isMounted()) return;
      setError(
        e instanceof NetworkError || e instanceof ApiError || e instanceof Error
          ? e.message
          : 'Impossible de rejoindre la session.',
      );
      setLoading(false);
    }
  }, [displayCode, isMounted, router]);

  useEffect(() => {
    void join();
  }, [join]);

  usePolling(
    async () => {
      const session = await refreshSession();
      if (!isMounted()) return;
      if (session.status === 'done') {
        router.replace('/result');
        return;
      }
      if (session.status === 'voting' || session.hostReady || session.bothReady) {
        router.replace('/vote');
      }
    },
    { enabled: waitingHost, intervalMs: 2000 },
  );

  return (
    <Screen showBack title="Invitation">
      {loading && !error ? (
        <View style={styles.center} accessibilityLabel="Connexion à la session">
          <ActivityIndicator color={FlipOn.accent} size="large" />
          <Text style={styles.text}>Connexion à la session…</Text>
          <Text style={styles.code}>{displayCode || '—'}</Text>
        </View>
      ) : null}
      {waitingHost && !error ? (
        <View style={styles.center} accessibilityLiveRegion="polite">
          <Text style={styles.title}>Tu as rejoint la session</Text>
          <Text style={styles.code}>{displayCode}</Text>
          <Text style={styles.text}>En attente que l’hôte lance le vote…</Text>
        </View>
      ) : null}
      {error ? <ErrorState text={error} onRetry={join} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 10, paddingTop: 60, paddingHorizontal: 16 },
  title: { fontSize: 18, fontWeight: '800', color: FlipOn.ink, textAlign: 'center' },
  text: { color: FlipOn.muted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  code: { marginTop: 6, fontSize: 18, fontWeight: '800', color: FlipOn.ink, letterSpacing: 1 },
});
