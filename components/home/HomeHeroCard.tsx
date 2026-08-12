import type { ImageSourcePropType, ReactNode } from 'react';
import {
  Dimensions,
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

import { FlipOn, cardShadow } from '@/constants/flipon';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DEFAULT_CARD_HEIGHT = Math.round(Math.min(SCREEN_HEIGHT * 0.68, 600));

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
  height?: number;
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
  height = DEFAULT_CARD_HEIGHT,
}: Props) {
  const body = (
    <ImageBackground
      source={image}
      style={[styles.card, { height }, style]}
      imageStyle={styles.image}
      resizeMode="cover">
      <LinearGradient
        colors={['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.28)', 'rgba(0,0,0,0.92)']}
        locations={[0.15, 0.5, 1]}
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
            <MaterialIcons name={icon} size={20} color="#fff" />
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
        style={({ pressed }) => [
          styles.press,
          { height },
          pressed && styles.pressed,
        ]}>
        {body}
      </Pressable>
    );
  }

  return <View style={[styles.press, { height }]}>{body}</View>;
}

export const homeHeroCardHeight = DEFAULT_CARD_HEIGHT;

const styles = StyleSheet.create({
  press: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FlipOn.cardStroke,
    ...cardShadow,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.985 }] },
  card: {
    justifyContent: 'space-between',
    padding: 22,
  },
  image: { borderRadius: 27 },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 27,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#0A0A0A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  footer: { gap: 8, paddingBottom: 6 },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.4,
    lineHeight: 34,
    textTransform: 'uppercase',
  },
  meta: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
