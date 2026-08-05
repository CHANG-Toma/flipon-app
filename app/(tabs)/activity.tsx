import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActivityScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Activité</Text>
        <Text style={styles.subtitle}>
          Tout ce qui compte après le vote : résultat final et plan Boost.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Résultat commun</Text>
          <Text style={styles.item}>- Idée retenue, claire pour tout le groupe</Text>
          <Text style={styles.item}>- Résumé simple et partage rapide</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/result')}>
            <Text style={styles.primaryText}>Voir le résultat</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Plan Boost</Text>
          <Text style={styles.item}>- Étapes déjà choisies par l'IA</Text>
          <Text style={styles.item}>- Tu suis simplement le parcours proposé</Text>
          <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/boost')}>
            <Text style={styles.secondaryText}>Voir Boost</Text>
          </Pressable>
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
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  item: { fontSize: 13, lineHeight: 18, color: '#4b5563' },
  primaryButton: {
    marginTop: 6,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
  },
  primaryText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  secondaryButton: {
    marginTop: 6,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  secondaryText: { color: '#111827', fontSize: 15, fontWeight: '600' },
});
