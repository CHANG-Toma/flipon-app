import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BoostScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Boost</Text>
        <Text style={styles.subtitle}>Plans contextuels premium: lieu, meteo, moment, groupe.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vision globale</Text>
        <Text style={styles.item}>- Plan IA deja structure avec etapes</Text>
        <Text style={styles.item}>- Suggestions proches en temps reel</Text>
        <Text style={styles.item}>- Variantes auto si aucun match</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>UX/UI</Text>
        <Text style={styles.item}>- Ticket plan premium simple a suivre</Text>
        <Text style={styles.item}>- Valeur Boost visible en 5 secondes</Text>
      </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Securite & Performance</Text>
          <Text style={styles.item}>- Permissions geoloc demandees au bon moment</Text>
          <Text style={styles.item}>- Cache des resultats pour limiter les appels IA</Text>
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
