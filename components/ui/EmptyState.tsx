import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn } from '@/constants/flipon';

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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 20,
    gap: 8,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FlipOn.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: '700', color: FlipOn.ink },
  text: { fontSize: 14, lineHeight: 20, color: FlipOn.muted },
  button: {
    marginTop: 8,
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
