import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { FlipOn } from '@/constants/flipon';

/** Splash brand pendant le boot auth. */
export function SplashBoot() {
  return (
    <View style={styles.boot}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.bootLogo}
        accessibilityLabel="FlipOn"
      />
      <Text style={styles.bootName}>FlipOn</Text>
      <ActivityIndicator color={FlipOn.accent} style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.bg,
    gap: 8,
  },
  bootLogo: {
    width: 88,
    height: 88,
    borderRadius: 22,
  },
  bootName: {
    fontSize: 28,
    fontWeight: '800',
    color: FlipOn.ink,
    letterSpacing: -0.5,
  },
});
