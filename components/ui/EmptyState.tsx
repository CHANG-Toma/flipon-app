import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn, cardShadow } from '@/constants/flipon';
import { platformShadow } from '@/lib/platform-shadow';

type Props = {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export function EmptyState({ title, text, actionLabel, onAction, icon = 'inbox' }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <MaterialIcons name={icon} size={28} color={FlipOn.accentInk} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: FlipOn.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 24,
    gap: 8,
    alignItems: 'center',
    ...cardShadow,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: FlipOn.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 17, fontWeight: '800', color: FlipOn.ink, textAlign: 'center' },
  text: { fontSize: 14, lineHeight: 21, color: FlipOn.muted, textAlign: 'center' },
  button: {
    marginTop: 8,
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
    ...platformShadow({
      color: FlipOn.accent,
      offset: { width: 0, height: 4 },
      opacity: 0.3,
      radius: 8,
      elevation: 3,
    }),
  },
  buttonText: { color: FlipOn.onAccent, fontSize: 14, fontWeight: '700' },
});
