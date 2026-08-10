/**
 * Écran login — formulaire uniquement si pas de session Clerk.
 */
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

import { AuthForm } from '@/components/auth/AuthCard';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { FlipOn } from '@/constants/flipon';

export default function LoginScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  // Clerk charge encore la session SecureStore
  if (!isLoaded) {
    return (
      <View style={styles.restoring}>
        <PremiumLoader fullScreen />
      </View>
    );
  }

  // Session active : AuthBridge redirige vers (tabs)
  if (isSignedIn) {
    return (
      <View style={styles.restoring}>
        <PremiumLoader fullScreen message="Reconnexion…" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.brand}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              accessibilityLabel="Logo FlipOn"
            />
            <Text style={styles.brandName}>FlipOn</Text>
            <Text style={styles.tagline}>Connecte-toi pour choisir quoi faire.</Text>
          </View>

          <View style={styles.formBlock}>
            <AuthForm
              onSuccess={() => {
                router.replace('/(tabs)' as Href);
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  restoring: { flex: 1 },
  safe: { flex: 1, backgroundColor: FlipOn.bg },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
    justifyContent: 'center',
    gap: 28,
  },
  brand: { alignItems: 'center', gap: 10 },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  brandName: {
    fontSize: 34,
    fontWeight: '800',
    color: FlipOn.ink,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
    color: FlipOn.muted,
    textAlign: 'center',
    maxWidth: 280,
  },
  formBlock: {
    backgroundColor: FlipOn.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 18,
    gap: 12,
  },
});
