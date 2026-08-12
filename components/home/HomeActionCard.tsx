import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FlipOn, cardShadow } from '@/constants/flipon';

type Props = {
  title: string;
  children: ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'default';
  accessibilityLabel?: string;
  disabled?: boolean;
};

/** Grande carte d'action — visuel au centre, titre centré en bas. */
export function HomeActionCard({
  title,
  children,
  onPress,
  variant = 'default',
  accessibilityLabel,
  disabled = false,
}: Props) {
  const cardStyle = [
    styles.card,
    variant === 'primary' ? styles.cardPrimary : styles.cardDefault,
    disabled && styles.cardDisabled,
  ];

  const body = (
    <>
      <View style={styles.body}>{children}</View>
      <Text style={[styles.title, variant === 'primary' && styles.titlePrimary]}>{title}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [...cardStyle, pressed && styles.pressed]}>
        {body}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{body}</View>;
}

const styles = StyleSheet.create({
  card: {
    minHeight: 168,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    justifyContent: 'space-between',
    ...cardShadow,
  },
  cardDefault: {
    backgroundColor: FlipOn.surface,
    borderColor: FlipOn.line,
  },
  cardPrimary: {
    backgroundColor: FlipOn.dark,
    borderColor: FlipOn.accentBorder,
  },
  cardDisabled: { opacity: 0.55 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
  },
  title: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: FlipOn.ink,
    letterSpacing: -0.2,
  },
  titlePrimary: {
    color: FlipOn.ink,
  },
});
