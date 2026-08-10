/**
 * Détail d’une entrée d’historique
 * --------------------------------
 * Idée retenue (Basique : pas d’étapes), partage, relancer, supprimer local.
 */
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlipOn } from '@/constants/flipon';
import { getPlanById } from '@/data/plans';
import { formatHistoryMeta } from '@/lib/history/format';
import {
  getHistoryEntry,
  hydrateHistory,
  removeHistoryEntry,
  subscribeHistory,
} from '@/lib/history/store';
import type { HistoryEntry } from '@/lib/history/types';
import { clearActiveSession } from '@/lib/session/store';

export default function HistoryEntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entryId = String(id ?? '');
  const [entry, setEntry] = useState<HistoryEntry | null>(
    entryId ? getHistoryEntry(entryId) : null,
  );

  const refresh = useCallback(async () => {
    await hydrateHistory();
    setEntry(entryId ? getHistoryEntry(entryId) : null);
  }, [entryId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => subscribeHistory(() => {
    setEntry(entryId ? getHistoryEntry(entryId) : null);
  }), [entryId]);

  if (!entry) {
    return (
      <Screen showBack title="Session">
        <EmptyState
          title="Session introuvable"
          text="Cette entrée n’est plus dans ton historique local."
          actionLabel="Retour à l’historique"
          onAction={() => router.replace('/(tabs)/history' as Href)}
          icon="history"
        />
      </Screen>
    );
  }

  const plan = getPlanById(entry.planId);
  const muted = entry.status !== 'Validée';
  const blurb = plan?.blurb;

  const share = async () => {
    const message =
      entry.status === 'Validée'
        ? `On a tranché avec FlipOn : ${entry.title}${
            entry.durationMin ? ` (${entry.durationMin} min)` : ''
          }.`
        : `Session FlipOn « ${entry.title} » — ${entry.status}.`;
    await Share.share({ message });
  };

  const relance = () => {
    void clearActiveSession().then(() => {
      router.replace('/session' as Href);
    });
  };

  const onDelete = () => {
    Alert.alert(
      'Retirer de l’historique ?',
      'La session disparaît de cet appareil. Ça ne relance pas de suppression cloud pour l’instant.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await removeHistoryEntry(entry.id);
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              if (router.canGoBack()) router.back();
              else router.replace('/(tabs)/history' as Href);
            })();
          },
        },
      ],
    );
  };

  return (
    <Screen showBack title="Session">
      <View style={[styles.hero, muted && styles.heroMuted]}>
        <Text style={styles.kicker}>{entry.status}</Text>
        <Text style={styles.title}>{entry.title}</Text>
        {blurb ? <Text style={styles.subtitle}>{blurb}</Text> : null}
        <Text style={styles.meta}>{formatHistoryMeta(entry)}</Text>
      </View>

      {entry.status === 'Sans match' ? (
        <View style={styles.tip}>
          <Text style={styles.tipTitle}>Pas de match cette fois</Text>
          <Text style={styles.tipText}>
            Élargis le cadre ou dis Oui à plus d’idées au prochain vote.
          </Text>
        </View>
      ) : null}

      <Pressable style={styles.primary} onPress={() => void share()}>
        <Text style={styles.primaryText}>Partager</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={relance}>
        <Text style={styles.secondaryText}>Relancer une session</Text>
      </Pressable>
      <Pressable style={styles.ghost} onPress={onDelete}>
        <Text style={styles.ghostText}>Retirer de l’historique</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: FlipOn.dark,
    borderRadius: 22,
    padding: 20,
    gap: 8,
  },
  heroMuted: {
    backgroundColor: '#2A2E36',
  },
  kicker: {
    color: FlipOn.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { color: '#C7CBD1', fontSize: 15, lineHeight: 22 },
  meta: { marginTop: 4, color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
  tip: {
    backgroundColor: FlipOn.accentSoft,
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tipTitle: { fontSize: 14, fontWeight: '800', color: FlipOn.accentInk },
  tipText: { fontSize: 13, lineHeight: 19, color: FlipOn.accentInk },
  primary: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondary: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.dark,
  },
  secondaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  ghost: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FlipOn.dangerLine,
    backgroundColor: FlipOn.dangerSoft,
  },
  ghostText: { color: FlipOn.danger, fontSize: 14, fontWeight: '700' },
});
