import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useOAuth, useAuth, useUser } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

import { FlipOn } from '@/constants/flipon';
import { isClerkConfigured } from '@/lib/clerk';

WebBrowser.maybeCompleteAuthSession();

export function GoogleAuthCard() {
  if (!isClerkConfigured) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Connexion</Text>
        <Text style={styles.hint}>
          Ajoute `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` dans ton `.env` pour activer Google.
        </Text>
      </View>
    );
  }

  return <GoogleAuthCardInner />;
}

function GoogleAuthCardInner() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/(tabs)/profile', { scheme: 'fliponapp' }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connexion Google impossible.');
    } finally {
      setLoading(false);
    }
  }, [startOAuthFlow]);

  if (isSignedIn && user) {
    const name = user.fullName || user.firstName || 'Compte FlipOn';
    const email = user.primaryEmailAddress?.emailAddress ?? '';
    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'FO'}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{name}</Text>
            {email ? <Text style={styles.email}>{email}</Text> : null}
          </View>
        </View>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            void signOut().then(() => router.replace('/(tabs)/profile'));
          }}>
          <Text style={styles.secondaryText}>Se déconnecter</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Connexion</Text>
      <Text style={styles.hint}>
        Connecte-toi avec Google pour retrouver ton historique plus vite. Tu peux rejoindre une
        session avec un code sans compte.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.primaryButton} onPress={onGoogle} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Continuer avec Google</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FlipOn.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 16,
    gap: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: FlipOn.ink },
  hint: { fontSize: 12, lineHeight: 18, color: FlipOn.muted },
  error: { fontSize: 13, color: FlipOn.danger, lineHeight: 18 },
  header: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: {
    height: 56,
    width: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accentSoft,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: FlipOn.accentInk },
  headerText: { flex: 1, gap: 3 },
  name: { fontSize: 20, fontWeight: '800', color: FlipOn.ink },
  email: { fontSize: 13, color: FlipOn.muted },
  primaryButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FlipOn.line,
  },
  secondaryText: { fontSize: 14, fontWeight: '700', color: FlipOn.ink },
});
