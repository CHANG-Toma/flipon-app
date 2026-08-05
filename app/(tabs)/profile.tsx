import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>HM</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>Haua M.</Text>
            <Text style={styles.email}>haua@example.com</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Boost actif</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Compte</Text>
          <SettingRow label="Modifier le profil" value="Nom, photo, bio" />
          <SettingRow label="Telephone" value="+33 6 12 34 56 78" />
          <SettingRow label="Ville" value="Paris, France" isLast />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Abonnement</Text>
          <SettingRow label="Offre actuelle" value="Boost mensuel 6,99 EUR" />
          <SettingRow label="Renouvellement" value="12 septembre 2026" />
          <SettingRow label="Gerer l abonnement" value="Facturation et options" isLast />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          <ToggleRow label="Notifications session" />
          <ToggleRow label="Notifications Boost" />
          <ToggleRow label="Partager les stats perso" isLast />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Securite</Text>
          <SettingRow label="Changer le mot de passe" value="Derniere mise a jour: il y a 2 mois" />
          <SettingRow label="Appareils connectes" value="iPhone, navigateur web" />
          <SettingRow label="Deconnexion de tous les appareils" value="Action immediate" isLast />
        </View>

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Enregistrer les modifications</Text>
        </Pressable>
        <Pressable style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Supprimer mon compte</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

type SettingRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

function SettingRow({ label, value, isLast = false }: SettingRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

type ToggleRowProps = {
  label: string;
  isLast?: boolean;
};

function ToggleRow({ label, isLast = false }: ToggleRowProps) {
  return (
    <View style={[styles.rowToggle, !isLast && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  container: { flexGrow: 1, padding: 20, gap: 12, backgroundColor: '#f8fafc' },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    height: 52,
    width: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fed7aa',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#9a3412' },
  headerText: { flex: 1, gap: 2 },
  name: { fontSize: 20, fontWeight: '800', color: '#111827' },
  email: { fontSize: 13, color: '#6b7280' },
  planBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  planBadgeText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  row: {
    paddingVertical: 10,
    gap: 2,
  },
  rowToggle: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  rowValue: { fontSize: 12, color: '#6b7280' },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
  },
  primaryButtonText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  dangerButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff1f2',
  },
  dangerButtonText: { fontSize: 14, fontWeight: '700', color: '#b91c1c' },
});
