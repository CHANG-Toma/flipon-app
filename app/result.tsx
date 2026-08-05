import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlipOn } from '@/constants/flipon';
import { clearActiveSession, getSession } from '@/lib/session-store';

export default function ResultScreen() {
  const router = useRouter();
  const session = getSession();
  const result = session.result;

  if (session.status !== 'done' && !result) {
    return (
      <Screen showBack title="Résultat">
        <EmptyState
          title="Pas encore de résultat"
          text="Termine un vote pour afficher l’idée retenue."
          actionLabel="Aller au vote"
          onAction={() => router.replace('/vote')}
          icon="emoji-events"
        />
      </Screen>
    );
  }

  if (!result) {
    return (
      <Screen showBack title="Résultat">
        <EmptyState
          title="Pas de match"
          text="Aucun Oui en commun. Élargis le cadre ou dis Oui à plus d’idées."
          actionLabel="Relancer une session"
          onAction={() => {
            void clearActiveSession().then(() => router.replace('/session'));
          }}
          icon="search-off"
        />
      </Screen>
    );
  }

  const share = async () => {
    await Share.share({
      message: `On a tranché avec FlipOn : ${result.title} (${result.durationMin} min, ≤ ${result.budgetMax} EUR).`,
    });
  };

  return (
    <Screen showBack title="Résultat">
      <View style={styles.hero}>
        <Text style={styles.kicker}>Idée retenue</Text>
        <Text style={styles.title}>{result.title}</Text>
        <Text style={styles.subtitle}>{result.blurb}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{result.durationMin} min</Text>
          <Text style={styles.meta}>≤ {result.budgetMax} EUR</Text>
          <Text style={styles.meta}>{result.place}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Étapes</Text>
        {result.steps.map((step, index) => (
          <Text key={step} style={styles.item}>
            {index + 1}. {step}
          </Text>
        ))}
      </View>

      <Pressable style={styles.primaryButton} onPress={share}>
        <Text style={styles.primaryText}>Partager le résultat</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => router.push('/boost')}>
        <Text style={styles.secondaryText}>Voir le plan Boost</Text>
      </Pressable>
      <Pressable
        style={styles.ghostButton}
        onPress={() => {
          void clearActiveSession().then(() => router.replace('/session'));
        }}>
        <Text style={styles.ghostText}>Relancer une session</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: FlipOn.dark,
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  kicker: {
    color: FlipOn.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#C7CBD1', fontSize: 15, lineHeight: 22 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
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
  card: {
    backgroundColor: FlipOn.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 16,
    gap: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: FlipOn.ink },
  item: { fontSize: 14, lineHeight: 20, color: FlipOn.muted },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.dark,
  },
  secondaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  ghostButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FlipOn.line,
    backgroundColor: FlipOn.surface,
  },
  ghostText: { color: FlipOn.ink, fontSize: 14, fontWeight: '700' },
});
