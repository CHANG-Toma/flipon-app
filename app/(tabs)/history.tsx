import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlipOn } from '@/constants/flipon';

const PAST_SESSIONS = [
  { id: '1', title: 'Balade + cafe', meta: 'Duo · Hier · 1h30', status: 'Validee' },
  { id: '2', title: 'Cinema centre-ville', meta: 'Groupe · Lun · 2h', status: 'Validee' },
  { id: '3', title: 'Brunch terrasse', meta: 'Solo · Dim · 1h', status: 'Expiree' },
];

export default function HistoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.top}>
          <Text style={styles.title}>Historique</Text>
          <Text style={styles.subtitle}>Uniquement tes sessions. Rien n est partage sans toi.</Text>
        </View>

        <View style={styles.list}>
          {PAST_SESSIONS.map((session) => {
            const expired = session.status === 'Expiree';
            return (
              <Pressable key={session.id} style={styles.row}>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{session.title}</Text>
                  <Text style={styles.rowMeta}>{session.meta}</Text>
                </View>
                <Text style={[styles.pill, expired ? styles.pillMuted : styles.pillOk]}>
                  {session.status}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.cta} onPress={() => router.push('/(tabs)/session')}>
          <Text style={styles.ctaText}>Nouvelle session</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FlipOn.bg },
  scroll: { flex: 1 },
  container: { flexGrow: 1, padding: 20, gap: 16, paddingBottom: 28 },
  top: { gap: 6 },
  title: { fontSize: 30, fontWeight: '800', color: FlipOn.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 20, color: FlipOn.muted },
  list: { gap: 10 },
  row: {
    backgroundColor: FlipOn.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  cta: {
    marginTop: 'auto',
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
