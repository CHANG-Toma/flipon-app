import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { homeStyles as styles } from '@/components/home/home-styles';
import { FlipOn } from '@/constants/flipon';

export function HomeStartCard() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Nouvelle session"
      style={({ pressed }) => [styles.startCard, pressed && styles.pressed]}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/session' as Href);
      }}>
      <View style={styles.startIcon}>
        <MaterialIcons name="bolt" size={26} color={FlipOn.accent} />
      </View>
      <Text style={styles.startTitle}>Lancer une session</Text>
      <Text style={styles.startText}>
        Choisis le cadre, invite avec un code, votez chacun de votre côté.
      </Text>
      <View style={styles.startCta}>
        <Text style={styles.startCtaText}>Nouvelle session</Text>
        <MaterialIcons name="arrow-forward" size={18} color="#fff" />
      </View>
    </Pressable>
  );
}
