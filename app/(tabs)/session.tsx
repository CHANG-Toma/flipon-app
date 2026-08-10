import { useCallback, useEffect, useMemo, useState } from 'react';
import { Share } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { SessionLobby } from '@/components/session/SessionLobby';
import { SessionSetupForm } from '@/components/session/SessionSetupForm';
import { EndSessionCloseButton } from '@/components/session/EndSessionCloseButton';
import { Screen } from '@/components/ui/Screen';
import { countMatchingPlans, type Constraints } from '@/data/plans';
import { useMounted } from '@/hooks/use-mounted';
import { usePolling } from '@/hooks/use-polling';
import { ApiError, NetworkError } from '@/lib/http';
import { useI18n } from '@/lib/i18n';
import { getInviteLink } from '@/lib/session/invite';
import { defaultPartySize } from '@/lib/session/party';
import {
  canStartVoting,
  createSessionOnServer,
  getSession,
  refreshSession,
  startVoting,
  subscribeSession,
} from '@/lib/session/store';
import type { SessionState, SessionType } from '@/lib/session/types';

type Step = 'setup' | 'invite';

function stepFromSession(session: SessionState): Step {
  return session.status === 'lobby' && Boolean(session.code) ? 'invite' : 'setup';
}

export default function SessionScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const isMounted = useMounted();
  const existing = getSession();
  const [step, setStep] = useState<Step>(() => stepFromSession(existing));
  const [type, setType] = useState<SessionType>(
    existing.type === 'Groupe' ? 'Groupe' : 'Duo',
  );
  const [partySize, setPartySize] = useState(
    existing.partySize || defaultPartySize(existing.type === 'Groupe' ? 'Groupe' : 'Duo'),
  );
  const [constraints, setConstraints] = useState<Constraints>(existing.constraints);
  const [code, setCode] = useState(existing.code);
  const [joinedCount, setJoinedCount] = useState(existing.joinedCount);
  const [sessionPartySize, setSessionPartySize] = useState(existing.partySize || 2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncFromStore = useCallback(() => {
    const session = getSession();
    setCode(session.code);
    setJoinedCount(session.joinedCount);
    setSessionPartySize(session.partySize);
    // Session terminée / absente → toujours revenir à l’étape 1 (évite l’étape 2 fantôme).
    if (!session.code || session.status === 'idle') {
      setStep('setup');
      setError(null);
    }
  }, []);

  useEffect(() => subscribeSession(syncFromStore), [syncFromStore]);

  useFocusEffect(
    useCallback(() => {
      syncFromStore();
    }, [syncFromStore]),
  );

  usePolling(() => refreshSession().then(() => undefined).catch(() => undefined), {
    enabled: step === 'invite' && Boolean(code),
    intervalMs: 2000,
  });

  const matchCount = useMemo(() => countMatchingPlans(constraints), [constraints]);
  const readyToVote = canStartVoting();
  const missing = Math.max(0, sessionPartySize - joinedCount);

  const goToInvite = async () => {
    if (loading || matchCount === 0) {
      if (matchCount === 0) setError(t('session.noPlans'));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const size = type === 'Duo' ? 2 : partySize;
      const session = await createSessionOnServer(type, constraints, size);
      if (!isMounted()) return;
      setCode(session.code);
      setJoinedCount(session.joinedCount);
      setSessionPartySize(session.partySize);
      setStep('invite');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      if (!isMounted()) return;
      setError(
        e instanceof NetworkError || e instanceof ApiError || e instanceof Error
          ? e.message
          : t('session.createFailed'),
      );
    } finally {
      if (isMounted()) setLoading(false);
    }
  };

  const launchVote = async () => {
    if (loading) return;
    if (!canStartVoting()) {
      setError(t('session.waitToJoin'));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await startVoting();
      if (!isMounted()) return;
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/vote');
    } catch (e) {
      if (!isMounted()) return;
      setError(
        e instanceof NetworkError || e instanceof ApiError || e instanceof Error
          ? e.message
          : t('session.launchFailed'),
      );
    } finally {
      if (isMounted()) setLoading(false);
    }
  };

  const shareInvite = async () => {
    if (!code) return;
    await Share.share({
      message: t('session.shareMessage', { code, link: getInviteLink(code) }),
    });
  };

  const handleBack = () => {
    if (step === 'invite') {
      setStep('setup');
      setError(null);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <Screen
      showBack
      onBack={handleBack}
      title={step === 'setup' ? t('session.setupTitle') : t('session.lobbyTitle')}
      headerRight={
        step === 'invite' && code ? (
          <EndSessionCloseButton afterEnd={() => router.replace('/(tabs)')} />
        ) : undefined
      }>
      {step === 'setup' ? (
        <SessionSetupForm
          type={type}
          partySize={partySize}
          constraints={constraints}
          matchCount={matchCount}
          loading={loading}
          error={error}
          onTypeChange={(next) => {
            setType(next);
            setPartySize(defaultPartySize(next));
          }}
          onPartySizeChange={setPartySize}
          onConstraintsPatch={(patch) => setConstraints((prev) => ({ ...prev, ...patch }))}
          onContinue={() => void goToInvite()}
        />
      ) : (
        <SessionLobby
          type={type}
          code={code}
          joinedCount={joinedCount}
          sessionPartySize={sessionPartySize}
          readyToVote={readyToVote}
          missing={missing}
          loading={loading}
          error={error}
          onShare={() => void shareInvite()}
          onLaunchVote={() => void launchVote()}
        />
      )}
    </Screen>
  );
}
