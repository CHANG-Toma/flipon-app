import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Compte, abonnement Boost et preferences utilisateur.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vision globale</Text>
        <Text style={styles.item}>- Infos compte et plan actuel</Text>
        <Text style={styles.item}>- Gestion abonnement Boost</Text>
        <Text style={styles.item}>- Langue, notifications, confidentialite</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>UX/UI</Text>
        <Text style={styles.item}>- Sections courtes, acces rapide aux actions clees</Text>
        <Text style={styles.item}>- Etat abonnement toujours visible</Text>
      </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Securite & Performance</Text>
          <Text style={styles.item}>- Deconnexion de tous les appareils</Text>
          <Text style={styles.item}>- Protection compte (2FA plus tard)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  container: { flexGrow: 1, padding: 20, gap: 12, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#6b7280' },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 6,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  item: { fontSize: 13, lineHeight: 18, color: '#4b5563' },
});
