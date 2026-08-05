import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>FLIPON</Text>
          <Text style={styles.title}>Ou tu veux, quand tu veux.</Text>
          <Text style={styles.subtitle}>
            Trouve vite une activite qui met tout le monde d accord.
          </Text>
          <Pressable style={styles.heroButton} onPress={() => router.push('/(tabs)/session')}>
            <Text style={styles.heroButtonText}>Commencer maintenant</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comment ca marche</Text>
          <View style={styles.steps}>
            <Text style={styles.step}>1. Cree une session</Text>
            <Text style={styles.step}>2. Le groupe vote en prive</Text>
            <Text style={styles.step}>3. FlipOn propose un plan a suivre</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Raccourcis</Text>
          <View style={styles.quickActions}>
            <Pressable style={styles.quickCard} onPress={() => router.push('/(tabs)/activity')}>
              <Text style={styles.quickTitle}>Derniere activite</Text>
              <Text style={styles.quickText}>Revoir le resultat et le plan Boost.</Text>
            </Pressable>
            <Pressable style={styles.quickCard} onPress={() => router.push('/(tabs)/profile')}>
              <Text style={styles.quickTitle}>Mon profil</Text>
              <Text style={styles.quickText}>Compte, abonnement et preferences.</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/session')}>
            <Text style={styles.primaryText}>Lancer une session</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/activity')}>
            <Text style={styles.secondaryText}>Voir mes activites</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
    backgroundColor: '#f8fafc',
  },
  heroCard: {
    borderRadius: 18,
    backgroundColor: '#111827',
    padding: 20,
    gap: 8,
  },
  kicker: {
    color: '#fb923c',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: 15,
    lineHeight: 22,
  },
  heroButton: {
    marginTop: 4,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
  },
  heroButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: 16,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  steps: {
    marginTop: 10,
    gap: 8,
  },
  step: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  quickActions: {
    marginTop: 10,
    gap: 8,
  },
  quickCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    backgroundColor: '#f9fafb',
    gap: 3,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  quickText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6b7280',
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  secondaryText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
});
