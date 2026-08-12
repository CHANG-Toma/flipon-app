import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn } from '@/constants/flipon';
import { useI18n } from '@/lib/i18n';

type Props = {
  remaining: number;
  onPress: () => void;
};

export function HistoryExpandRow({ remaining, onPress }: Props) {
  const { t } = useI18n();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('history.showMoreA11y', { n: remaining })}
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <View style={styles.line} />
      <View style={styles.center}>
        <Text style={styles.label}>{t('history.showMore', { n: remaining })}</Text>
        <MaterialIcons name="keyboard-arrow-down" size={22} color={FlipOn.muted} />
      </View>
      <View style={styles.line} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: FlipOn.line,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: FlipOn.muted,
  },
  pressed: { opacity: 0.75 },
});
