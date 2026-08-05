import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlipOn } from '@/constants/flipon';

const TYPES = ['Solo', 'Duo', 'Groupe'] as const;
type SessionType = (typeof TYPES)[number];

export default function SessionScreen() {
  const router = useRouter();
  const [type, setType] = useState<SessionType>('Duo');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Nouvelle session</Text>
          <Text style={styles.title}>Cadre rapide, décision claire.</Text>
          <Text style={styles.subtitle}>Les votes restent privés. Le code expire automatiquement.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Type</Text>
          <View style={styles.chipRow}>
            {TYPES.map((item) => {
              const selected = item === type;
              return (
                <Pressable
                  key={item}
                  onPress={() => setType(item)}
                  style={[styles.chip, selected && styles.chipSelected]}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cadre</Text>
          <SettingLine label="Moment" value="Après-midi" />
          <SettingLine label="Durée" value="2h" />
          <SettingLine label="Budget" value="0 - 25 EUR" />
          <SettingLine label="Énergie" value="Calme" />
          <SettingLine label="Zone" value="Autour de moi (5 km)" last />
        </View>

        {type !== 'Solo' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Invitation</Text>
            <SettingLine label="Code temporaire" value="FLIP-2841" />
            <SettingLine label="Participants" value="2/4 ont rejoint" last />
            <Text style={styles.hint}>Le lien n'expose aucun vote. Expire après 24h.</Text>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Partager le lien</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/vote')}>
          <Text style={styles.primaryButtonText}>Lancer le vote</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingLine({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.settingLine, !last && styles.settingBorder]}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FlipOn.bg },
  scroll: { flex: 1 },
  container: { flexGrow: 1, padding: 20, gap: 12, paddingBottom: 28 },
  hero: {
    backgroundColor: FlipOn.dark,
    borderRadius: 22,
    padding: 18,
    gap: 8,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: FlipOn.accent,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', lineHeight: 32 },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#C7CBD1' },
  card: {
    backgroundColor: FlipOn.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 16,
    gap: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: FlipOn.ink },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.surface,
  },
  chipSelected: {
    borderColor: FlipOn.accent,
    backgroundColor: FlipOn.accentSoft,
  },
  chipText: { fontSize: 14, fontWeight: '600', color: FlipOn.muted },
  chipTextSelected: { color: FlipOn.accentInk },
  settingLine: { paddingVertical: 10, gap: 2 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: FlipOn.soft },
  settingLabel: { fontSize: 12, color: FlipOn.muted },
  settingValue: { fontSize: 15, fontWeight: '600', color: FlipOn.ink },
  hint: { fontSize: 12, lineHeight: 18, color: FlipOn.muted },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FlipOn.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.surface,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '700', color: FlipOn.ink },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
