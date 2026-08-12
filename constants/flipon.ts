import { platformShadow } from '@/lib/platform-shadow';

/** Palette FlipOn — sombre premium + accents orange. */
export const FlipOn = {
  bg: '#151820',
  surface: '#1C212B',
  soft: '#232936',
  ink: '#F5F7FB',
  muted: '#A0A8BA',
  line: '#343B4C',
  accent: '#FF6A2B',
  accentSoft: '#2A1A12',
  accentInk: '#FF9A6C',
  accentBorder: '#4E2B1A',
  dark: '#12161F',
  onAccent: '#FFFFFF',
  danger: '#F87171',
  dangerSoft: '#2D1515',
  dangerLine: '#5E2A2A',
  success: '#34D399',
  successSoft: '#152A24',
  successLine: '#1F4D3A',
  shadow: '#000000',
  /** Contour léger sur cartes photo. */
  cardStroke: 'rgba(255, 255, 255, 0.18)',
  /** Tab bar flottante (glass). */
  tabGlass: 'rgba(28, 28, 32, 0.72)',
  tabGlassBorder: 'rgba(255, 255, 255, 0.1)',
  tabActive: 'rgba(255, 255, 255, 0.12)',
  tabInactive: 'rgba(255, 255, 255, 0.55)',
};

/** Ombre douce sur fond sombre. */
export const cardShadow = platformShadow({
  offset: { width: 0, height: 8 },
  opacity: 0.28,
  radius: 16,
  elevation: 6,
});

/** Ombre tab bar flottante. */
export const tabBarShadow = platformShadow({
  offset: { width: 0, height: 12 },
  opacity: 0.45,
  radius: 24,
  elevation: 12,
});
