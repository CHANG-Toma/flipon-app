import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthCard } from '@/components/auth/AuthCard';
import { FlipOn } from '@/constants/flipon';

export default function ProfileScreen() {
  const [sessionNotif, setSessionNotif] = useState(true);
  const [boostNotif, setBoostNotif] = useState(true);
  const [shareStats, setShareStats] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <AuthCard />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Confidentialité</Text>
          <ToggleRow
            label="Notifications session"
            value={sessionNotif}
            onValueChange={setSessionNotif}
          />
          <ToggleRow label="Notifications Boost" value={boostNotif} onValueChange={setBoostNotif} />
          <ToggleRow
            label="Partager mes stats"
            value={shareStats}
            onValueChange={setShareStats}
            last
          />
          <Text style={styles.hint}>Désactivé par défaut. Tes votes restent privés.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Abonnement</Text>
          <SettingRow label="Offre" value="Basique" />
          <SettingRow label="Boost" value="Optionnel" last />
        </View>

        <Pressable style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Supprimer mon compte</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
  last = false,
}: {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.rowToggle, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: FlipOn.line, true: '#FDBA74' }}
        thumbColor={value ? FlipOn.accent : '#f4f4f5'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FlipOn.bg },
  scroll: { flex: 1 },
  container: { flexGrow: 1, padding: 20, gap: 12, paddingBottom: 110 },
  card: {
    backgroundColor: FlipOn.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 16,
    gap: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: FlipOn.ink, marginBottom: 6 },
  row: { paddingVertical: 11, gap: 2 },
  rowToggle: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: FlipOn.soft },
  rowLabel: { fontSize: 14, fontWeight: '600', color: FlipOn.ink },
  rowValue: { fontSize: 13, color: FlipOn.muted },
  hint: { marginTop: 8, fontSize: 12, lineHeight: 18, color: FlipOn.muted },
  dangerButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FlipOn.dangerLine,
    backgroundColor: FlipOn.dangerSoft,
  },
  dangerButtonText: { fontSize: 14, fontWeight: '700', color: FlipOn.danger },
});
