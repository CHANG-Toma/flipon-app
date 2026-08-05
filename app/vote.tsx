import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VoteScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Vote prive</Text>
        <Text style={styles.subtitle}>Chaque membre vote Oui / Passer sans pression sociale.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vision globale</Text>
        <Text style={styles.item}>- Carte idee: titre, duree, budget, contexte</Text>
        <Text style={styles.item}>- Actions rapides: Oui / Passer</Text>
        <Text style={styles.item}>- Etat: progression dans le deck</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>UX/UI</Text>
        <Text style={styles.item}>- Boutons larges pour une decision en 1 tap</Text>
        <Text style={styles.item}>- Retour visuel immediat apres le vote</Text>
      </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Securite & Performance</Text>
          <Text style={styles.item}>- Vote chiffre en transit (HTTPS)</Text>
          <Text style={styles.item}>- Envoi asynchrone + retry si connexion faible</Text>
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
