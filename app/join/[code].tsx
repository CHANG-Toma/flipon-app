import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { ErrorState } from '@/components/ui/ErrorState';
import { PulseRing } from '@/components/ui/pulse-ring';
import { flowStyles } from '@/components/ui/flow-styles';
import { FlipOn } from '@/constants/flipon';
import { useMounted } from '@/hooks/use-mounted';
import { usePolling } from '@/hooks/use-polling';
import { ApiError, NetworkError } from '@/lib/http';
import { useI18n } from '@/lib/i18n';
import { isValidSessionCode, normalizeSessionCode } from '@/lib/session-code';
import { joinByCode, confirmLobbyReady, refreshSession } from '@/lib/session/store';

export default function JoinScreen() {
  const router = useRouter();
  const { t } = useI18n();
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
        throw new ApiError(t('join.invalidCode'), 400);
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

      try {
        await confirmLobbyReady();
      } catch {
        /* best-effort */
      }
      if (!isMounted()) return;

      setWaitingHost(true);
      setLoading(false);
    } catch (e) {
      if (!isMounted()) return;
      setError(
        e instanceof NetworkError || e instanceof ApiError || e instanceof Error
          ? e.message
          : t('join.joinFailed'),
      );
      setLoading(false);
    }
  }, [displayCode, isMounted, router, t]);

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
    <Screen showBack title={t('join.title')}>
      {loading && !error ? (
        <View style={flowStyles.joinHero} accessibilityLabel={t('join.connectingA11y')}>
          <PulseRing size="md" color={FlipOn.accent}>
            <ActivityIndicator color={FlipOn.accent} size="small" />
          </PulseRing>
          <Text style={flowStyles.kicker}>{t('join.kicker')}</Text>
          <Text style={flowStyles.joinTitle}>{t('join.connecting')}</Text>
          <Text style={flowStyles.joinCode}>{displayCode || '—'}</Text>
        </View>
      ) : null}

      {waitingHost && !error ? (
        <View style={flowStyles.joinHero} accessibilityLiveRegion="polite">
          <PulseRing size="md" color={FlipOn.accent}>
            <ActivityIndicator color={FlipOn.accent} size="small" />
          </PulseRing>
          <Text style={flowStyles.kicker}>{t('join.kickerJoined')}</Text>
          <Text style={flowStyles.joinTitle}>{t('join.joined')}</Text>
          <Text style={flowStyles.joinCode}>{displayCode}</Text>
          <Text style={flowStyles.joinText}>{t('join.waitingHost')}</Text>
        </View>
      ) : null}

      {error ? <ErrorState text={error} onRetry={join} /> : null}
    </Screen>
  );
}
