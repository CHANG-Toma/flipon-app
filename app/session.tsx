import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Session</Text>
        <Text style={styles.subtitle}>Configurer rapidement une session solo ou groupe.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vision globale</Text>
        <Text style={styles.item}>- Type: Solo, Duo, Groupe</Text>
        <Text style={styles.item}>- Cadre: duree, budget, energie, lieu, ambiance</Text>
        <Text style={styles.item}>- Partage: code session ou lien</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>UX/UI</Text>
        <Text style={styles.item}>- 1 ecran court, progression visible</Text>
        <Text style={styles.item}>- Bouton principal fixe: Continuer</Text>
      </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Securite & Performance</Text>
          <Text style={styles.item}>- Code session ephemere + expiration auto</Text>
          <Text style={styles.item}>- Validation locale avant appel API</Text>
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
