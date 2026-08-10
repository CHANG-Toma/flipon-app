import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FlipOn } from '@/constants/flipon';
import { useMounted } from '@/hooks/use-mounted';
import { usePolling } from '@/hooks/use-polling';
import { ApiError, NetworkError } from '@/lib/http';
import {
  getSession,
  refreshSession,
  startVoting,
  subscribeSession,
  voteCurrent,
} from '@/lib/session/store';

export default function VoteScreen() {
  const router = useRouter();
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
          : 'Impossible de charger les idées.',
      );
    } finally {
      if (isMounted()) setLoading(false);
    }
  }, [router, isMounted]);

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
          : 'Impossible d’envoyer le vote.',
      );
    } finally {
      if (isMounted()) setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Screen showBack title="Vote privé">
        <View style={styles.center} accessibilityLabel="Chargement du vote">
          <ActivityIndicator color={FlipOn.accent} size="large" />
          <Text style={styles.loadingText}>Chargement du deck…</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen showBack title="Vote privé">
        <ErrorState text={error} onRetry={load} />
      </Screen>
    );
  }

  if (session.status === 'waiting_partner') {
    return (
      <Screen showBack title="Vote privé">
        <EmptyState
          title="En attente du partenaire"
          text="Tes choix sont enregistrés. Dès que l’autre a fini, on calcule le match."
          icon="hourglass-empty"
        />
      </Screen>
    );
  }

  if (!idea) {
    return (
      <Screen showBack title="Vote privé">
        <EmptyState
          title="Deck vide"
          text="Relance une session avec un cadre plus large."
          actionLabel="Nouvelle session"
          onAction={() => router.replace('/session')}
          icon="style"
        />
      </Screen>
    );
  }

  const progress = `${Math.min(session.index + 1, session.deck.length)}/${session.deck.length}`;

  return (
    <Screen showBack title="Vote privé" contentStyle={{ paddingBottom: 32 }}>
      <Text style={styles.progress} accessibilityLiveRegion="polite">
        Idée {progress} · votes privés
      </Text>

      <View
        style={styles.card}
        accessibilityLabel={`${idea.title}. ${idea.blurb}`}>
        <Text style={styles.kicker}>{idea.category}</Text>
        <Text style={styles.title}>{idea.title}</Text>
        <Text style={styles.detail}>{idea.blurb}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{idea.durationMin} min</Text>
          <Text style={styles.meta}>≤ {idea.budgetMax} EUR</Text>
          <Text style={styles.meta}>{idea.place}</Text>
          <Text style={styles.meta}>{idea.energy}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Passer cette idée"
          style={[styles.passBtn, submitting && styles.disabled]}
          onPress={() => onVote(false)}
          disabled={submitting}>
          <Text style={styles.passText}>Passer</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Oui pour cette idée"
          style={[styles.yesBtn, submitting && styles.disabled]}
          onPress={() => onVote(true)}
          disabled={submitting}>
          <Text style={styles.yesText}>{submitting ? '…' : 'Oui'}</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>Tes choix restent privés. On ne garde que les idées en commun.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  loadingText: { color: FlipOn.muted, fontSize: 14 },
  progress: { fontSize: 13, fontWeight: '600', color: FlipOn.muted },
  card: {
    backgroundColor: FlipOn.dark,
    borderRadius: 24,
    padding: 20,
    gap: 10,
    minHeight: 240,
  },
  kicker: {
    alignSelf: 'flex-start',
    color: FlipOn.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', lineHeight: 34 },
  detail: { color: '#C7CBD1', fontSize: 15, lineHeight: 22 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  meta: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  actions: { flexDirection: 'row', gap: 12 },
  passBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FlipOn.line,
    backgroundColor: FlipOn.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passText: { fontSize: 16, fontWeight: '700', color: FlipOn.ink },
  yesBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: FlipOn.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  disabled: { opacity: 0.5 },
  hint: { fontSize: 12, color: FlipOn.muted, lineHeight: 18 },
});
