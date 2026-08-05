import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.kicker}>NOUVELLE SESSION</Text>
          <Text style={styles.title}>On lance quoi maintenant ?</Text>
          <Text style={styles.subtitle}>
            Configure en 30 secondes, invite ton groupe et passe au vote.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Type de session</Text>
          <View style={styles.chipRow}>
            <Chip label="Solo" />
            <Chip label="Duo" selected />
            <Chip label="Groupe" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cadre rapide</Text>
          <View style={styles.stack}>
            <SettingLine label="Moment" value="Apres-midi" />
            <SettingLine label="Duree" value="2h" />
            <SettingLine label="Budget" value="0 - 25 EUR" />
            <SettingLine label="Energie" value="Calme" />
            <SettingLine label="Zone" value="Autour de moi (5 km)" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Participants</Text>
          <View style={styles.stack}>
            <SettingLine label="Code session" value="FLIP-2841" />
            <SettingLine label="Membres" value="2/4 ont rejoint" />
          </View>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Partager le lien d invitation</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Confidentialite</Text>
          <Text style={styles.item}>- Vote prive par participant</Text>
          <Text style={styles.item}>- Session expiree automatiquement apres 24h</Text>
        </View>

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Lancer le vote</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

type ChipProps = {
  label: string;
  selected?: boolean;
};

function Chip({ label, selected = false }: ChipProps) {
  return (
    <View style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </View>
  );
}

type SettingLineProps = {
  label: string;
  value: string;
};

function SettingLine({ label, value }: SettingLineProps) {
  return (
    <View style={styles.settingLine}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  container: { flexGrow: 1, padding: 20, gap: 12, backgroundColor: '#f8fafc' },
  headerCard: {
    borderRadius: 16,
    backgroundColor: '#111827',
    padding: 16,
    gap: 6,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#fdba74',
  },
  title: { fontSize: 27, fontWeight: '800', color: '#ffffff', lineHeight: 33 },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#d1d5db' },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  chipSelected: {
    borderColor: '#fb923c',
    backgroundColor: '#fff7ed',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  chipTextSelected: { color: '#c2410c' },
  stack: { gap: 8 },
  settingLine: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 2,
  },
  settingLabel: { fontSize: 12, color: '#6b7280' },
  settingValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  item: { fontSize: 13, lineHeight: 18, color: '#4b5563' },
  secondaryButton: {
    marginTop: 2,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
  },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
});
