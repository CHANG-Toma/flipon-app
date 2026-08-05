import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const items = [
  { label: 'Session', hint: "Création et configuration d'une session", route: '/session' },
  { label: 'Vote privé', hint: 'Écran de décisions Oui / Passer', route: '/vote' },
  { label: 'Résultat', hint: 'Idée commune + prochaines étapes', route: '/result' },
  { label: 'Boost', hint: 'Plan contextuel prêt à suivre', route: '/boost' },
  { label: 'Historique', hint: 'Sessions précédentes et favoris', route: '/history' },
  { label: 'Profil', hint: 'Compte, abonnement, préférences', route: '/profile' },
];

export default function MenuScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Menu</Text>
        <Text style={styles.subtitle}>Base globale de l'application mobile FlipOn.</Text>

        <View style={styles.list}>
          {items.map((item, index) => (
            <Pressable key={item.label} style={styles.item} onPress={() => router.push(item.route as never)}>
              <Text style={styles.index}>{index + 1}</Text>
              <View style={styles.itemBody}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemHint}>{item.hint}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Principes produit</Text>
          <Text style={styles.footerText}>- UX/UI : flux clair en 3 étapes, 1 action principale par écran.</Text>
          <Text style={styles.footerText}>- Sécurité : votes privés, données minimales, sessions expirées.</Text>
          <Text style={styles.footerText}>- Performance : rendu léger, chargements paresseux, cache local.</Text>
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
    backgroundColor: '#f8fafc',
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
  },
  list: {
    marginTop: 16,
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: 12,
  },
  index: {
    width: 24,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#f97316',
  },
  itemBody: {
    flex: 1,
    gap: 2,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  itemHint: {
    fontSize: 13,
    color: '#6b7280',
  },
  footerCard: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 6,
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  footerText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4b5563',
  },
});
