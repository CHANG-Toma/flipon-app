import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn } from '@/constants/flipon';
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
            <ActivityIndicator color="#fff" />
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.dangerLine,
    padding: 20,
    gap: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: '700', color: FlipOn.danger },
  text: { fontSize: 14, lineHeight: 20, color: FlipOn.ink },
  button: {
    marginTop: 8,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.dark,
    paddingHorizontal: 14,
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
