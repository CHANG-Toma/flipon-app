import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FlipOn } from '@/constants/flipon';
import { NetworkError, mockRequest } from '@/lib/mock-api';
import { getSession, markBoostOpened, planToBoostSteps } from '@/lib/session-store';

export default function BoostScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const result = getSession().result;
  const [steps, setSteps] = useState(planToBoostSteps(result));

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      markBoostOpened();
      const data = await mockRequest(planToBoostSteps(getSession().result));
      setSteps(data);
    } catch (e) {
      setError(e instanceof NetworkError ? e.message : 'Impossible de charger le plan Boost.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!result) {
    return (
      <Screen showBack title="Boost">
        <EmptyState
          title="Boost indisponible"
          text="Il faut un résultat commun avant d'afficher un plan détaillé."
          actionLabel="Retour"
          onAction={() => router.replace('/(tabs)')}
          icon="bolt"
        />
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen showBack title="Boost">
        <View style={styles.center}>
          <ActivityIndicator color={FlipOn.accent} size="large" />
          <Text style={styles.loadingText}>Préparation du plan…</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen showBack title="Boost">
        <ErrorState text={error} onRetry={load} />
      </Screen>
    );
  }

  return (
    <Screen showBack title="Boost">
      <View style={styles.hero}>
        <Text style={styles.kicker}>Plan premium</Text>
        <Text style={styles.title}>{result.title}</Text>
        <Text style={styles.subtitle}>
          Étapes issues du plan validé. Aucune réservation automatique par FlipOn.
        </Text>
      </View>

      <View style={styles.list}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.step}>
            <View style={styles.stepIndex}>
              <Text style={styles.stepIndexText}>{index + 1}</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              {step.duration ? <Text style={styles.stepDuration}>{step.duration}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.primaryText}>Terminer</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  loadingText: { color: FlipOn.muted, fontSize: 14 },
  hero: {
    backgroundColor: FlipOn.dark,
    borderRadius: 22,
    padding: 18,
    gap: 8,
  },
  kicker: {
    color: FlipOn.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#C7CBD1', fontSize: 14, lineHeight: 20 },
  list: { gap: 10 },
  step: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: FlipOn.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 14,
  },
  stepIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FlipOn.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexText: { color: FlipOn.accentInk, fontWeight: '800' },
  stepBody: { flex: 1, gap: 3 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: FlipOn.ink },
  stepDuration: { marginTop: 4, fontSize: 12, fontWeight: '700', color: FlipOn.accentInk },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
