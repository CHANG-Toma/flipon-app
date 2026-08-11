import { useCallback, useEffect, useMemo, useState } from 'react';
import { Share } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { SessionLobby } from '@/components/session/SessionLobby';
import { SessionSetupForm } from '@/components/session/SessionSetupForm';
import { EndSessionCloseButton } from '@/components/session/EndSessionCloseButton';
import { Screen } from '@/components/ui/Screen';
import {
  countMatchingPlans,
  preferredPlaceFromContext,
  type Constraints,
  type ContextHint,
} from '@/data/plans';
import { useMounted } from '@/hooks/use-mounted';
import { usePolling } from '@/hooks/use-polling';
import { usePremiumContext } from '@/hooks/use-premium-context';
import { useSubscription } from '@/hooks/use-subscription';
import { ApiError, NetworkError } from '@/lib/http';
import { useI18n } from '@/lib/i18n';
import {
  getCachedPremiumContext,
  snapshotToContextHint,
} from '@/lib/premium/context';
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

function resolveSessionContext(isPremium: boolean): ContextHint | null {
  if (!isPremium) return null;
  const cached = getCachedPremiumContext();
  return cached ? snapshotToContextHint(cached) : null;
}

export default function SessionScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const isMounted = useMounted();
  const { isPremium } = useSubscription();
  const premiumCtx = usePremiumContext(isPremium);
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
  const [guestReady, setGuestReady] = useState(existing.guestReady);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contextHint = useMemo((): ContextHint | null => {
    if (!isPremium) return null;
    if (premiumCtx.status === 'ready' && premiumCtx.snapshot) {
      return snapshotToContextHint(premiumCtx.snapshot);
    }
    return resolveSessionContext(isPremium);
  }, [isPremium, premiumCtx.snapshot, premiumCtx.status]);

  const syncFromStore = useCallback(() => {
    const session = getSession();
    setCode(session.code);
    setJoinedCount(session.joinedCount);
    setSessionPartySize(session.partySize);
    setGuestReady(session.guestReady);
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

  const matchCount = useMemo(
    () => countMatchingPlans(constraints, isPremium ? null : contextHint),
    [constraints, contextHint, isPremium],
  );
  /** Premium = idées générées → pas de compteur catalogue. */
  const showIdeaCount = !isPremium;
  const readyToVote = canStartVoting();
  const missing = Math.max(0, sessionPartySize - joinedCount);
  const waitingGuestReady = joinedCount >= 2 && !guestReady && type !== 'Groupe';

  const contextBanner = useMemo(() => {
    if (!isPremium) return null;
    if (!contextHint) {
      return {
        kind: 'missing' as const,
        text: t('sessionSetup.contextMissing'),
      };
    }
    const placeBias = preferredPlaceFromContext(contextHint);
    const weatherLabel = t(
      `premiumContext.weather.${contextHint.weather}` as 'premiumContext.weather.clear',
    );
    const momentLabel = t(
      `premiumContext.moment.${contextHint.moment}` as 'premiumContext.moment.morning',
    );
    return {
      kind: 'ready' as const,
      text: t('sessionSetup.contextReady', {
        city: contextHint.cityLabel || t('premiumContext.approxPlace'),
        weather: weatherLabel,
        moment: momentLabel,
        bias:
          placeBias === 'dedans'
            ? t('sessionSetup.contextBiasIn')
            : placeBias === 'dehors'
              ? t('sessionSetup.contextBiasOut')
              : t('sessionSetup.contextBiasNone'),
      }),
    };
  }, [contextHint, isPremium, t]);

  const goToInvite = async () => {
    if (loading) return;
    if (showIdeaCount && matchCount === 0) {
      setError(t('session.noPlans'));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const size = type === 'Duo' ? 2 : partySize;
      const session = await createSessionOnServer(
        type,
        constraints,
        size,
        contextHint,
      );
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
      setError(waitingGuestReady ? t('session.waitGuestReady') : t('session.waitToJoin'));
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
          showIdeaCount={showIdeaCount}
          loading={loading}
          error={error}
          contextBanner={contextBanner}
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
          waitingGuestReady={waitingGuestReady}
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
