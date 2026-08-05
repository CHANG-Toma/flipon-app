import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.subtitle}>Retrouver les sessions passees et eviter les repetitions.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vision globale</Text>
        <Text style={styles.item}>- Liste des sessions recentes</Text>
        <Text style={styles.item}>- Idees deja validees / ignorees</Text>
        <Text style={styles.item}>- Favoris rapides pour redecoller</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>UX/UI</Text>
        <Text style={styles.item}>- Filtres simples: date, ambiance, groupe</Text>
        <Text style={styles.item}>- Resume compact par session</Text>
      </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Securite & Performance</Text>
          <Text style={styles.item}>- Donnees perso masquees dans les exports</Text>
          <Text style={styles.item}>- Pagination / infinite scroll pour gros volume</Text>
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
