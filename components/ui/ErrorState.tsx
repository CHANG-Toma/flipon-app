import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn, cardShadow } from '@/constants/flipon';
import { useI18n } from '@/lib/i18n';

type Props = {
  title?: string;
  text: string;
  onRetry?: () => void;
  loading?: boolean;
};

export function ErrorState({ title, text, onRetry, loading = false }: Props) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t('emptyError.networkTitle');

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="wifi-off" size={26} color={FlipOn.danger} />
      </View>
      <Text style={styles.title}>{resolvedTitle}</Text>
      <Text style={styles.text}>{text}</Text>
      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={FlipOn.accent} />
          ) : (
            <Text style={styles.buttonText}>{t('common.retry')}</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: FlipOn.dangerSoft,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FlipOn.dangerLine,
    padding: 24,
    gap: 8,
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: FlipOn.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: FlipOn.dangerLine,
  },
  title: { fontSize: 17, fontWeight: '800', color: FlipOn.danger, textAlign: 'center' },
  text: { fontSize: 14, lineHeight: 21, color: FlipOn.ink, textAlign: 'center' },
  button: {
    marginTop: 8,
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.surface,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingHorizontal: 18,
    ...cardShadow,
  },
  buttonText: { color: FlipOn.ink, fontSize: 14, fontWeight: '700' },
});
