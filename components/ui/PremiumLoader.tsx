import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { PulseRing } from '@/components/ui/pulse-ring';
import { FlipOn } from '@/constants/flipon';
import { tr } from '@/lib/i18n';

type Props = {
  message?: string;
  fullScreen?: boolean;
};

/** Splash / overlay premium — Pulse Ring + logo centré. */
export function PremiumLoader({ message, fullScreen = true }: Props) {
  return (
    <View style={[styles.root, fullScreen ? styles.fullScreen : styles.inline]}>
      <View style={styles.center}>
        <Animated.View entering={FadeIn.duration(500)} style={styles.ringBlock}>
          <PulseRing size="lg" color={FlipOn.accent}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              accessibilityLabel={tr('loader.brandA11y')}
            />
          </PulseRing>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(120).duration(450)} style={styles.brand}>
          FlipOn
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(200).duration(450)} style={styles.tagline}>
          {tr('loader.tagline')}
        </Animated.Text>

        {message ? (
          <Animated.Text entering={FadeInDown.delay(280).duration(350)} style={styles.message}>
            {message}
          </Animated.Text>
        ) : null}
      </View>

      <Animated.Text entering={FadeIn.delay(360).duration(350)} style={styles.footer}>
        {tr('loader.footer')}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FlipOn.dark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
  },
  inline: {
    flex: 1,
    borderRadius: 12,
  },
  center: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 320,
  },
  ringBlock: {
    marginBottom: 4,
    overflow: 'visible',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 20,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.28)',
  },
});
