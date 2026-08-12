import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Screen } from '@/components/ui/Screen';
import { EndSessionCloseButton } from '@/components/session/EndSessionCloseButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { flowStyles } from '@/components/ui/flow-styles';
import { FlipOn } from '@/constants/flipon';
import { useMounted } from '@/hooks/use-mounted';
import { usePolling } from '@/hooks/use-polling';
import { ApiError, NetworkError } from '@/lib/http';
import { useI18n } from '@/lib/i18n';
import {
  getSession,
  refreshSession,
  startVoting,
  subscribeSession,
  voteCurrent,
} from '@/lib/session/store';

export default function VoteScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const isMounted = useMounted();
  const [session, setSession] = useState(getSession());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeSession(() => setSession(getSession())), []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let current = getSession();
      if (!current.code || !current.deck.length) {
        router.replace('/session');
        return;
      }
      if (current.status === 'lobby' || current.status === 'idle') {
        if (current.role === 'guest' || current.joinedCount >= 2) {
          await startVoting();
          current = getSession();
        } else {
          router.replace('/session');
          return;
        }
      }
      if (current.status === 'done') {
        router.replace('/result');
        return;
      }
      if (isMounted()) setSession(current);
    } catch (e) {
      if (!isMounted()) return;
      setError(
        e instanceof NetworkError || e instanceof ApiError || e instanceof Error
          ? e.message
          : t('vote.loadFailed'),
      );
    } finally {
      if (isMounted()) setLoading(false);
    }
  }, [router, isMounted, t]);

  useEffect(() => {
    void load();
  }, [load]);

  usePolling(
    async () => {
      const next = await refreshSession();
      if (next.status === 'done') router.replace('/result');
    },
    { enabled: session.status === 'waiting_partner', intervalMs: 2000 },
  );

  useEffect(() => {
    if (session.status === 'done') {
      router.replace('/result');
    }
  }, [session.status, router]);

  const idea = session.deck[session.index];

  const onVote = async (accepted: boolean) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      void Haptics.impactAsync(
        accepted ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      );
      const next = await voteCurrent(accepted);
      if (!isMounted()) return;
      setSession(next);
      if (next.status === 'done') {
        router.replace('/result');
      }
    } catch (e) {
      if (!isMounted()) return;
      setError(
        e instanceof NetworkError || e instanceof ApiError || e instanceof Error
          ? e.message
          : t('vote.voteFailed'),
      );
    } finally {
      if (isMounted()) setSubmitting(false);
    }
  };

  const endSessionAction = () => router.replace('/(tabs)');
  const endSessionBtn = <EndSessionCloseButton afterEnd={endSessionAction} />;

  if (loading) {
    return (
      <Screen showBack title={t('vote.title')} headerRight={endSessionBtn}>
        <View style={flowStyles.loadingCenter} accessibilityLabel={t('vote.loadingA11y')}>
          <ActivityIndicator color={FlipOn.accent} size="large" />
          <Text style={flowStyles.loadingText}>{t('vote.loading')}</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen showBack title={t('vote.title')} headerRight={endSessionBtn}>
        <ErrorState text={error} onRetry={load} />
      </Screen>
    );
  }

  if (session.status === 'waiting_partner') {
    return (
      <Screen showBack title={t('vote.title')} headerRight={endSessionBtn}>
        <EmptyState
          title={t('vote.waitingPartnerTitle')}
          text={t('vote.waitingPartnerText')}
          icon="hourglass-empty"
        />
      </Screen>
    );
  }

  if (!idea) {
    return (
      <Screen showBack title={t('vote.title')}>
        <EmptyState
          title={t('vote.emptyDeckTitle')}
          text={t('vote.emptyDeckText')}
          actionLabel={t('vote.newSession')}
          onAction={() => router.replace('/session')}
          icon="style"
        />
      </Screen>
    );
  }

  const progress = `${Math.min(session.index + 1, session.deck.length)}/${session.deck.length}`;

  return (
    <Screen
      showBack
      title={t('vote.title')}
      headerRight={endSessionBtn}
      contentStyle={{ paddingBottom: 32 }}>
      <Text style={flowStyles.progress} accessibilityLiveRegion="polite">
        {t('vote.progress', { progress })}
      </Text>
      <Text style={flowStyles.question}>{t('vote.question')}</Text>

      <View style={flowStyles.voteCard} accessibilityLabel={`${idea.title}. ${idea.blurb}`}>
        <Text style={flowStyles.kicker}>{idea.category}</Text>
        <Text style={flowStyles.heroTitle}>{idea.title}</Text>
        <Text style={flowStyles.heroSubtitle}>{idea.blurb}</Text>
        <View style={flowStyles.metaRow}>
          <Text style={flowStyles.metaPill}>{idea.durationMin} min</Text>
          <Text style={flowStyles.metaPill}>≤ {idea.budgetMax} EUR</Text>
          <Text style={flowStyles.metaPill}>{idea.place}</Text>
          <Text style={flowStyles.metaPill}>{idea.energy}</Text>
        </View>
      </View>

      <View style={flowStyles.actionsRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('vote.passA11y')}
          style={[flowStyles.passBtn, submitting && flowStyles.disabled]}
          onPress={() => onVote(false)}
          disabled={submitting}>
          <Text style={flowStyles.passText}>{t('vote.pass')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('vote.yesA11y')}
          style={[flowStyles.yesBtn, submitting && flowStyles.disabled]}
          onPress={() => onVote(true)}
          disabled={submitting}>
          <Text style={flowStyles.yesText}>{submitting ? '…' : t('vote.yes')}</Text>
        </Pressable>
      </View>

      <Text style={flowStyles.hint}>{t('vote.hint')}</Text>
    </Screen>
  );
}
