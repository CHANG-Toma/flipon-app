import { Platform, type ViewStyle } from 'react-native';

type ShadowOptions = {
  color?: string;
  offset?: { width: number; height: number };
  opacity?: number;
  radius?: number;
  elevation?: number;
};

/** Ombre cross-platform — boxShadow sur web, shadow* sur natif. */
export function platformShadow({
  color = '#000',
  offset = { width: 0, height: 8 },
  opacity = 0.28,
  radius = 16,
  elevation = 6,
}: ShadowOptions = {}): ViewStyle {
  if (Platform.OS === 'web') {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px rgba(${r}, ${g}, ${b}, ${opacity})`,
    };
  }

  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}
