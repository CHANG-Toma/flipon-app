import { useEffect, useMemo, useState } from 'react';
import { Share } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { SessionLobby } from '@/components/session/SessionLobby';
import { SessionSetupForm } from '@/components/session/SessionSetupForm';
import { Screen } from '@/components/ui/Screen';
import { countMatchingPlans, type Constraints } from '@/data/plans';
import { useMounted } from '@/hooks/use-mounted';
import { usePolling } from '@/hooks/use-polling';
import { ApiError, NetworkError } from '@/lib/http';
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
import type { SessionType } from '@/lib/session/types';

type Step = 'setup' | 'invite';

export default function SessionScreen() {
  const router = useRouter();
  const isMounted = useMounted();
  const existing = getSession();
  const [step, setStep] = useState<Step>(
    existing.status === 'lobby' && existing.code ? 'invite' : 'setup',
  );
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

  useEffect(
    () =>
      subscribeSession(() => {
        const session = getSession();
        setCode(session.code);
        setJoinedCount(session.joinedCount);
        setSessionPartySize(session.partySize);
      }),
    [],
  );

  usePolling(() => refreshSession().then(() => undefined).catch(() => undefined), {
    enabled: step === 'invite' && Boolean(code),
    intervalMs: 2000,
  });

  const matchCount = useMemo(() => countMatchingPlans(constraints), [constraints]);
  const readyToVote = canStartVoting();
  const missing = Math.max(0, 2 - joinedCount);

  const goToInvite = async () => {
    if (loading || matchCount === 0) {
      if (matchCount === 0) setError('Aucun plan pour ce cadre. Élargis un critère.');
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
          : 'Impossible de créer la session.',
      );
    } finally {
      if (isMounted()) setLoading(false);
    }
  };

  const launchVote = async () => {
    if (loading) return;
    if (!canStartVoting()) {
      setError('Attends que quelqu’un rejoigne la session.');
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
          : 'Impossible de lancer la session.',
      );
    } finally {
      if (isMounted()) setLoading(false);
    }
  };

  const shareInvite = async () => {
    if (!code) return;
    await Share.share({
      message: `Rejoins ma session FlipOn : ${code}\n${getInviteLink(code)}`,
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
      title={step === 'setup' ? 'Nouvelle session' : 'Invitation'}>
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
