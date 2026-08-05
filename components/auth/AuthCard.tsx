import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth, useOAuth, useSignIn, useSignUp, useUser } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

import { FlipOn } from '@/constants/flipon';
import { isClerkConfigured } from '@/lib/clerk';

WebBrowser.maybeCompleteAuthSession();

type Mode = 'signIn' | 'signUp';

/** @deprecated use AuthCard */
export function GoogleAuthCard() {
  return <AuthCard />;
}

export function AuthCard() {
  if (!isClerkConfigured) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Compte</Text>
        <Text style={styles.hint}>
          Ajoute `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` dans ton `.env`, puis active Email + Google dans
          Clerk.
        </Text>
      </View>
    );
  }

  return <AuthCardInner />;
}

function AuthCardInner() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const humanError = (e: unknown) => {
    if (e && typeof e === 'object' && 'errors' in e) {
      const first = (e as { errors?: { message?: string }[] }).errors?.[0]?.message;
      if (first) return first;
    }
    return e instanceof Error ? e.message : 'Une erreur est survenue.';
  };

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
      setError(humanError(e));
    } finally {
      setLoading(false);
    }
  }, [startOAuthFlow]);

  const onEmailAuth = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      setError('Email et mot de passe requis.');
      return;
    }
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      if (mode === 'signIn') {
        if (!signInLoaded || !signIn || !setActiveSignIn) return;
        const result = await signIn.create({ identifier: trimmed, password });
        if (result.status === 'complete') {
          await setActiveSignIn({ session: result.createdSessionId });
          return;
        }
        setError('Connexion incomplète. Réessaie ou utilise Google.');
        return;
      }

      if (!signUpLoaded || !signUp || !setActiveSignUp) return;
      await signUp.create({ emailAddress: trimmed, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (e) {
      setError(humanError(e));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!signUpLoaded || !signUp || !setActiveSignUp) return;
    if (!code.trim()) {
      setError('Entre le code reçu par e-mail.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (result.status === 'complete') {
        await setActiveSignUp({ session: result.createdSessionId });
        setPendingVerification(false);
        return;
      }
      setError('Vérification incomplète. Vérifie le code.');
    } catch (e) {
      setError(humanError(e));
    } finally {
      setLoading(false);
    }
  };

  if (isSignedIn && user) {
    const name =
      user.fullName || user.firstName || user.username || user.primaryEmailAddress?.emailAddress || 'Compte FlipOn';
    const mail = user.primaryEmailAddress?.emailAddress ?? '';
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
            {mail ? <Text style={styles.email}>{mail}</Text> : null}
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={() => {
            void signOut().then(() => router.replace('/(tabs)/profile'));
          }}>
          <Text style={styles.secondaryText}>Se déconnecter</Text>
        </Pressable>
      </View>
    );
  }

  if (pendingVerification) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Confirme ton e-mail</Text>
        <Text style={styles.hint}>Un code a été envoyé à {email.trim().toLowerCase()}.</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Code à 6 chiffres"
          placeholderTextColor={FlipOn.muted}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          style={styles.input}
          accessibilityLabel="Code de vérification"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={onVerify}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Valider le compte</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => {
            setPendingVerification(false);
            setCode('');
            setError(null);
          }}
          hitSlop={8}>
          <Text style={styles.link}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{mode === 'signIn' ? 'Connexion' : 'Créer un compte'}</Text>
      <Text style={styles.hint}>
        Compte FlipOn ou Google. Tu peux aussi rejoindre une session avec un code sans compte.
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={FlipOn.muted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        style={styles.input}
        accessibilityLabel="Email"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Mot de passe"
        placeholderTextColor={FlipOn.muted}
        secureTextEntry
        autoComplete={mode === 'signIn' ? 'password' : 'new-password'}
        textContentType={mode === 'signIn' ? 'password' : 'newPassword'}
        style={styles.input}
        accessibilityLabel="Mot de passe"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        style={styles.primaryButton}
        onPress={onEmailAuth}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>
            {mode === 'signIn' ? 'Se connecter' : 'Créer mon compte'}
          </Text>
        )}
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.divider} />
      </View>

      <Pressable
        accessibilityRole="button"
        style={styles.secondaryButton}
        onPress={onGoogle}
        disabled={loading}>
        <Text style={styles.secondaryText}>Continuer avec Google</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          setMode(mode === 'signIn' ? 'signUp' : 'signIn');
          setError(null);
        }}
        hitSlop={8}>
        <Text style={styles.link}>
          {mode === 'signIn' ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
        </Text>
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
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingHorizontal: 12,
    fontSize: 15,
    color: FlipOn.ink,
    backgroundColor: FlipOn.bg,
  },
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
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  divider: { flex: 1, height: 1, backgroundColor: FlipOn.line },
  dividerText: { fontSize: 12, color: FlipOn.muted, fontWeight: '600' },
  link: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
    color: FlipOn.accentInk,
    textAlign: 'center',
  },
});
