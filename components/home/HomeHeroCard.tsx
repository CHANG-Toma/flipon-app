import type { ImageSourcePropType, ReactNode } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { cardShadow } from '@/constants/flipon';

type Props = {
  image: ImageSourcePropType;
  title: string;
  meta?: string;
  badge?: string;
  onPress?: () => void;
  overlay?: ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  icon?: keyof typeof MaterialIcons.glyphMap;
};

/** Carte hero photo — même gabarit pour le carrousel accueil. */
export function HomeHeroCard({
  image,
  title,
  meta,
  badge,
  onPress,
  overlay,
  accessibilityLabel,
  style,
  icon = 'arrow-forward',
}: Props) {
  const body = (
    <ImageBackground
      source={image}
      style={[styles.card, style]}
      imageStyle={styles.image}
      resizeMode="cover">
      <LinearGradient
        colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.9)']}
        locations={[0.2, 0.55, 1]}
        style={styles.gradient}
      />

      <View style={styles.topRow}>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : (
          <View />
        )}
        {onPress ? (
          <View style={styles.iconBtn}>
            <MaterialIcons name={icon} size={18} color="#fff" />
          </View>
        ) : null}
      </View>

      {overlay ? <View style={styles.overlay}>{overlay}</View> : <View style={styles.spacer} />}

      <View style={styles.footer}>
        <Text style={styles.title}>{title}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
    </ImageBackground>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        onPress={onPress}
        style={({ pressed }) => [styles.press, pressed && styles.pressed]}>
        {body}
      </Pressable>
    );
  }

  return <View style={styles.press}>{body}</View>;
}

const CARD_HEIGHT = 280;

export const homeHeroCardHeight = CARD_HEIGHT;

const styles = StyleSheet.create({
  press: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
    ...cardShadow,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.985 }] },
  card: {
    height: CARD_HEIGHT,
    justifyContent: 'space-between',
    padding: 16,
  },
  image: { borderRadius: 22 },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: '#0A0A0A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  spacer: { flex: 1 },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  footer: { gap: 6, paddingBottom: 4 },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 28,
    textTransform: 'uppercase',
  },
  meta: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
