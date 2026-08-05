import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn } from '@/constants/flipon';

const PAST_SESSIONS = [
  { id: '1', title: 'Balade + café', meta: 'Duo · Hier · 1h30', status: 'Validée' as const },
  { id: '2', title: 'Cinéma centre-ville', meta: 'Groupe · Lun · 2h', status: 'Validée' as const },
  { id: '3', title: 'Brunch terrasse', meta: 'Solo · Dim · 1h', status: 'Expirée' as const },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.top}>
          <Text style={styles.title}>Historique</Text>
          <Text style={styles.subtitle}>Uniquement tes sessions. Rien n'est partagé sans toi.</Text>
        </View>

        <Text style={styles.count}>{PAST_SESSIONS.length} sessions</Text>

        <View style={styles.list}>
          {PAST_SESSIONS.map((session) => {
            const expired = session.status === 'Expirée';
            return (
              <Pressable key={session.id} style={styles.row}>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{session.title}</Text>
                  <Text style={styles.rowMeta}>{session.meta}</Text>
                </View>
                <Text style={[styles.pill, expired ? styles.pillMuted : styles.pillOk]}>
                  {session.status}
                </Text>
                <MaterialIcons name="chevron-right" size={22} color={FlipOn.muted} />
              </Pressable>
            );
          })}
        </View>
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
  count: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: FlipOn.muted,
  },
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
