import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { FlipOn } from '@/constants/flipon';

export type PulseRingSize = 'sm' | 'md' | 'lg';

type Props = {
  size?: PulseRingSize;
  color?: string;
  rings?: number;
  style?: ViewStyle;
  children?: ReactNode;
};

const SIZE_MAP: Record<PulseRingSize, number> = {
  sm: 56,
  md: 96,
  lg: 152,
};

const LOGO_BOX: Record<PulseRingSize, number> = {
  sm: 28,
  md: 44,
  lg: 64,
};

const RING_COUNT = 2;
const PULSE_MS = 2400;
const STAGGER_MS = 800;

function PulseRingWave({
  box,
  color,
  strokeWidth,
  delayMs,
}: {
  box: number;
  color: string;
  strokeWidth: number;
  delayMs: number;
}) {
  const scale = useSharedValue(0.72);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const run = () => {
      scale.value = 0.72;
      opacity.value = 0.55;
      scale.value = withDelay(
        delayMs,
        withRepeat(
          withTiming(1.28, { duration: PULSE_MS, easing: Easing.out(Easing.cubic) }),
          -1,
          false,
        ),
      );
      opacity.value = withDelay(
        delayMs,
        withRepeat(
          withTiming(0, { duration: PULSE_MS, easing: Easing.out(Easing.quad) }),
          -1,
          false,
        ),
      );
    };
    run();
  }, [delayMs, opacity, scale]);

  const waveStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const radius = box / 2 - strokeWidth;

  return (
    <Animated.View style={[styles.ringLayer, waveStyle]}>
      <Svg width={box} height={box} viewBox={`0 0 ${box} ${box}`}>
        <Circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      </Svg>
    </Animated.View>
  );
}

/**
 * Pulse Ring — ondes SVG concentriques (propre, sans artefacts de border CSS).
 */
export function PulseRing({
  size = 'md',
  color = FlipOn.accent,
  rings = RING_COUNT,
  style,
  children,
}: Props) {
  const box = SIZE_MAP[size];
  const strokeWidth = size === 'sm' ? 1.5 : 2;
  const inner = LOGO_BOX[size];

  return (
    <View
      style={[styles.wrap, { width: box, height: box }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Chargement">
      {/* Anneau fixe discret — ancrage visuel */}
      <View style={styles.ringLayer} pointerEvents="none">
        <Svg width={box} height={box} viewBox={`0 0 ${box} ${box}`}>
          <Circle
            cx={box / 2}
            cy={box / 2}
            r={box / 2 - strokeWidth}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
        </Svg>
      </View>

      {Array.from({ length: rings }, (_, i) => (
        <PulseRingWave
          key={i}
          box={box}
          color={color}
          strokeWidth={strokeWidth}
          delayMs={i * STAGGER_MS}
        />
      ))}

      {children ? (
        <View style={[styles.center, { width: inner, height: inner, borderRadius: inner * 0.22 }]}>
          {children}
        </View>
      ) : (
        <View style={[styles.dot, { width: inner * 0.35, height: inner * 0.35, backgroundColor: color }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  ringLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  dot: {
    borderRadius: 999,
    zIndex: 2,
  },
});
