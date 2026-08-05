import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlipOn } from '@/constants/flipon';

export default function HomeScreen() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');

  const joinSession = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    // Plus tard: valider le code cote API avant d ouvrir le vote
    router.push('/(tabs)/vote');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <View style={styles.top}>
          <Text style={styles.brand}>FlipOn</Text>
          <Text style={styles.title}>Pret a trancher.</Text>
          <Text style={styles.subtitle}>Reprend, lance, ou rejoins une session.</Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.badgeLive}>
            <View style={styles.dot} />
            <Text style={styles.badgeLiveText}>En cours</Text>
          </View>
          <Text style={styles.heroTitle}>Duo · Vote en attente</Text>
          <Text style={styles.heroText}>1/2 a vote · Votes prives · Expire dans 22h</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/vote')}>
            <Text style={styles.primaryText}>Reprendre le vote</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rejoindre une session</Text>
          <View style={styles.joinCard}>
            <TextInput
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="Code ex: FLIP-2841"
              placeholderTextColor={FlipOn.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
              style={styles.input}
            />
            <Pressable
              style={[styles.joinButton, !joinCode.trim() && styles.joinButtonDisabled]}
              onPress={joinSession}
              disabled={!joinCode.trim()}>
              <Text style={styles.joinButtonText}>Rejoindre</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>Le code est temporaire. Aucun vote n est visible aux autres.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Derniere activite</Text>
          <Pressable style={styles.row} onPress={() => router.push('/(tabs)/history')}>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Balade + cafe</Text>
              <Text style={styles.rowMeta}>Hier · Duo · 1h30</Text>
            </View>
            <Text style={styles.rowStatus}>Validee</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FlipOn.bg },
  scroll: { flex: 1 },
  container: { flexGrow: 1, padding: 20, gap: 18, paddingBottom: 100 },
  top: { gap: 6 },
  brand: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: FlipOn.accent,
  },
  title: { fontSize: 30, fontWeight: '800', color: FlipOn.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22, color: FlipOn.muted },
  hero: {
    backgroundColor: FlipOn.dark,
    borderRadius: 22,
    padding: 18,
    gap: 8,
  },
  badgeLive: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: FlipOn.accent },
  badgeLiveText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  heroText: { color: '#C7CBD1', fontSize: 14, lineHeight: 20, marginBottom: 6 },
  primaryButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: FlipOn.muted },
  joinCard: {
    backgroundColor: FlipOn.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 12,
    gap: 10,
  },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FlipOn.line,
    backgroundColor: FlipOn.bg,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    color: FlipOn.ink,
    letterSpacing: 0.5,
  },
  joinButton: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.dark,
  },
  joinButtonDisabled: { opacity: 0.4 },
  joinButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  hint: { fontSize: 12, lineHeight: 18, color: FlipOn.muted },
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
  rowStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: FlipOn.success,
    backgroundColor: FlipOn.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
