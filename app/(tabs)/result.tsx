import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Résultat commun</Text>
        <Text style={styles.subtitle}>Une idée retenue pour tout le monde + étapes à suivre.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vision globale</Text>
        <Text style={styles.item}>- Idée finale avec résumé clair</Text>
        <Text style={styles.item}>- Étapes actionnables (chemin simple)</Text>
        <Text style={styles.item}>- CTA : partager, relancer, enregistrer</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>UX/UI</Text>
        <Text style={styles.item}>- Hero principal très lisible</Text>
        <Text style={styles.item}>- Priorité au bouton Partager</Text>
      </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sécurité & Performance</Text>
          <Text style={styles.item}>- Résultat visible uniquement aux membres session</Text>
          <Text style={styles.item}>- Cache local pour rouvrir vite l'écran</Text>
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
