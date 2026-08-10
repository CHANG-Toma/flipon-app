import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { useEndSession } from '@/hooks/use-end-session';
import { FlipOn } from '@/constants/flipon';
import { useI18n } from '@/lib/i18n';

type Props = {
  afterEnd?: () => void;
  confirm?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  variant?: 'default' | 'onDark';
  style?: ViewStyle;
};

/** Croix header pour fermer une session (confirmation incluse). */
export function EndSessionCloseButton({
  afterEnd,
  confirm = true,
  title,
  message,
  confirmLabel,
  variant = 'default',
  style,
}: Props) {
  const { t } = useI18n();
  const { endSession, ending } = useEndSession();
  const onDark = variant === 'onDark';

  const handlePress = () => {
    if (ending) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    endSession({ confirm, title, message, confirmLabel, afterEnd });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={confirm ? t('endSession.a11yEnd') : t('endSession.a11yArchive')}
      accessibilityHint={confirm ? t('endSession.a11yHint') : undefined}

      accessibilityState={{ disabled: ending, busy: ending }}
      style={({ pressed }) => [
        styles.hit,
        style,
        ending && styles.hitDisabled,
        pressed && !ending && styles.hitPressed,
      ]}
      onPress={handlePress}
      disabled={ending}
      hitSlop={8}>
      <View
        style={[
          styles.btn,
          onDark ? styles.btnOnDark : styles.btnDefault,
          ending && (onDark ? styles.btnOnDarkBusy : styles.btnDefaultBusy),
        ]}>
        {ending ? (
          <ActivityIndicator color={onDark ? '#FECACA' : FlipOn.danger} size="small" />
        ) : (
          <MaterialIcons
            name="close"
            size={15}
            color={onDark ? '#FECACA' : FlipOn.danger}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  hitDisabled: {
    opacity: 0.5,
  },
  btn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnDefault: {
    backgroundColor: FlipOn.dangerSoft,
    borderColor: FlipOn.dangerLine,
  },
  btnDefaultBusy: {
    backgroundColor: '#FEE2E2',
  },
  btnOnDark: {
    backgroundColor: 'rgba(185, 28, 28, 0.2)',
    borderColor: 'rgba(254, 202, 202, 0.3)',
  },
  btnOnDarkBusy: {
    backgroundColor: 'rgba(185, 28, 28, 0.32)',
  },
});
