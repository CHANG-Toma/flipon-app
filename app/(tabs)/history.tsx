import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';

import { EmptyState } from '@/components/ui/EmptyState';
import { FlipOn } from '@/constants/flipon';
import {
  formatHistoryMeta,
  getHistory,
  hydrateHistory,
  subscribeHistory,
  type HistoryEntry,
} from '@/lib/history-store';
import { getSession, isActiveSession } from '@/lib/session-store';

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<HistoryEntry[]>(getHistory());

  useFocusEffect(
    useCallback(() => {
      void hydrateHistory().then(setSessions);
    }, []),
  );

  useEffect(() => subscribeHistory(() => setSessions(getHistory())), []);

  const openEntry = (entry: HistoryEntry) => {
    const active = getSession();
    if (isActiveSession(active) && active.status === 'done' && active.code === entry.id) {
      router.push('/result');
      return;
    }
    router.push('/(tabs)/history');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.top}>
          <Text style={styles.title}>Historique</Text>
          <Text style={styles.subtitle}>Uniquement tes sessions. Rien n’est partagé sans toi.</Text>
        </View>

        {sessions.length === 0 ? (
          <EmptyState
            title="Aucune session pour l’instant"
            text="Quand tu valides une activité, elle apparaît ici."
            actionLabel="Nouvelle session"
            onAction={() => router.push('/session')}
            icon="history"
          />
        ) : (
          <>
            <Text style={styles.count}>{sessions.length} sessions</Text>
            <View style={styles.list}>
              {sessions.map((session) => {
                const muted = session.status !== 'Validée';
                return (
                  <Pressable key={session.id} style={styles.row} onPress={() => openEntry(session)}>
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{session.title}</Text>
                      <Text style={styles.rowMeta}>{formatHistoryMeta(session)}</Text>
                    </View>
                    <Text style={[styles.pill, muted ? styles.pillMuted : styles.pillOk]}>
                      {session.status}
                    </Text>
                    <MaterialIcons name="chevron-right" size={22} color={FlipOn.muted} />
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FlipOn.bg },
  scroll: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
    gap: 12,
  },
  top: { gap: 6 },
  title: { fontSize: 30, fontWeight: '800', color: FlipOn.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 20, color: FlipOn.muted },
  count: { marginTop: 4, fontSize: 13, fontWeight: '600', color: FlipOn.muted },
  list: { gap: 10 },
  row: {
    backgroundColor: FlipOn.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: FlipOn.ink },
  rowMeta: { fontSize: 13, color: FlipOn.muted },
  pill: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  pillOk: { color: FlipOn.success, backgroundColor: FlipOn.successSoft },
  pillMuted: { color: FlipOn.muted, backgroundColor: FlipOn.soft },
});
