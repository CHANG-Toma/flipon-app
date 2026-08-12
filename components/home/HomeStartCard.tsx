import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { homeStyles as styles } from '@/components/home/home-styles';
import { FlipOn } from '@/constants/flipon';
import { useI18n } from '@/lib/i18n';

export function HomeStartCard() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('home.startA11y')}
      style={({ pressed }) => [styles.startCard, pressed && styles.pressed]}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/session' as Href);
      }}>
      <View style={styles.startIcon}>
        <MaterialIcons name="bolt" size={26} color={FlipOn.accent} />
      </View>
      <Text style={styles.startTitle}>{t('home.startTitle')}</Text>
      <Text style={styles.startText}>{t('home.startText')}</Text>
      <View style={styles.startCta}>
        <Text style={styles.startCtaText}>{t('home.startCta')}</Text>
        <MaterialIcons name="arrow-forward" size={18} color={FlipOn.onAccent} />
      </View>
    </Pressable>
  );
}
