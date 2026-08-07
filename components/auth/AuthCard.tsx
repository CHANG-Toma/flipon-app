/**
 * Auth UI — Clerk (email / inscription / Google)
 * ----------------------------------------------
 * Deux exports publics :
 * - `AuthForm`  → écran `/login` (formulaire seul ; `onSuccess` pour naviguer)
 * - `AuthCard`  → onglet Profil (compte connecté + déconnexion, ou form compact)
 *
 * Prérequis Clerk dashboard :
 * - Email/Password activé
 * - Google OAuth activé
 * - Redirect natif : `fliponapp://oauth-native-callback` (+ URL générée par Linking)
 *
 * Inscription email : Clerk envoie un code → état `pendingVerification`.
 * Après session active, `AuthBridge` (`app/_layout`) sync `/api/me` + historique.
 */
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
import { useRouter, type Href } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn } from '@/constants/flipon';
import { isClerkConfigured } from '@/lib/clerk';
import { getSubscription } from '@/lib/subscription';

/** Requis pour finaliser le retour OAuth (Google) dans Expo. */
WebBrowser.maybeCompleteAuthSession();

type Mode = 'signIn' | 'signUp';

type AuthFormProps = {
  /** Appelé une fois la session Clerk active (email, vérif code, ou Google). */
  onSuccess?: () => void;
  /**
   * `true` = carte bordée (Profil).
   * `false` = formulaire intégré dans le bloc login (sans double cadre).
   */
  compact?: boolean;
};

/** @deprecated Alias historique — préférer `AuthCard`. */
export function GoogleAuthCard() {
  return <AuthCard />;
}

/**
 * Carte Profil : identité + modifier profil + déconnexion.
 * La déconnexion renvoie vers `/login` (le gate root refuse l’app sans session).
 */
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

/**
 * Formulaire d’entrée (login / signup / Google).
 * Ne gère pas l’état « déjà connecté » — c’est le rôle d’`AuthCard` ou du gate.
 */
export function AuthForm({ onSuccess, compact = false }: AuthFormProps) {
  if (!isClerkConfigured) {
    return (
      <View style={[styles.card, !compact && styles.cardFlush]}>
        <Text style={styles.cardTitle}>Configuration requise</Text>
        <Text style={styles.hint}>
          Ajoute `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` dans `flipon-app/.env`, redémarre Expo, et active
          Email/Password + Google dans le dashboard Clerk (redirect `fliponapp://oauth-native-callback`).
        </Text>
      </View>
    );
  }

  return <AuthFormInner onSuccess={onSuccess} compact={compact} />;
}

function AuthCardInner() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const planLabel = getSubscription().label;

  if (isSignedIn && user) {
    const name =
      user.fullName ||
      user.firstName ||
      user.username ||
      user.primaryEmailAddress?.emailAddress ||
      'Compte FlipOn';
    const mail = user.primaryEmailAddress?.emailAddress ?? '';
    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const openEdit = () => {
      router.push('/edit-profile' as Href);
    };

    return (
      <View style={styles.card}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Modifier mon profil"
          accessibilityHint="Ouvre l’édition du prénom et du nom"
          onPress={openEdit}
          style={({ pressed }) => [styles.identityHit, pressed && styles.pressed]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'FO'}</Text>
          </View>
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <View style={styles.planPill}>
                <Text style={styles.planPillText}>{planLabel}</Text>
              </View>
            </View>
            {mail ? (
              <Text style={styles.email} numberOfLines={1}>
                {mail}
              </Text>
            ) : null}
            <Text style={styles.editHint}>Modifier mon profil</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={FlipOn.muted} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={() => {
            void signOut().then(() => router.replace('/login' as Href));
          }}>
          <Text style={styles.secondaryText}>Se déconnecter</Text>
        </Pressable>
      </View>
    );
  }

  // Cas rare (Profil ouvert sans session) : le gate aurait dû rediriger.
  return <AuthForm compact />;
}

function AuthFormInner({ onSuccess, compact = false }: AuthFormProps) {
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  /** Après signup email : saisie du code à 6 chiffres reçu par mail. */
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Messages Clerk souvent dans `errors[0].message`. */
  const humanError = (e: unknown) => {
    if (e && typeof e === 'object' && 'errors' in e) {
      const first = (e as { errors?: { message?: string }[] }).errors?.[0]?.message;
      if (first) return first;
    }
    return e instanceof Error ? e.message : 'Une erreur est survenue.';
  };

  const finish = useCallback(() => {
    onSuccess?.();
  }, [onSuccess]);

  /** OAuth Google — redirect via scheme `fliponapp` (deep link). */
  const onGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/login', { scheme: 'fliponapp' }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        finish();
      }
    } catch (e) {
      setError(humanError(e));
    } finally {
      setLoading(false);
    }
  }, [finish, startOAuthFlow]);

  /** Connexion email OU démarrage inscription (+ envoi code vérif). */
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
          finish();
          return;
        }
        // Ex. 2FA Clerk non géré ici — basculer sur Google ou étendre plus tard.
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

  /** Valide le code email et active la session. */
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
        finish();
        return;
      }
      setError('Vérification incomplète. Vérifie le code.');
    } catch (e) {
      setError(humanError(e));
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={[styles.card, !compact && styles.cardFlush]}>
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

  const isSignUp = mode === 'signUp';

  return (
    <View style={[styles.card, !compact && styles.cardFlush]}>
      <Text style={compact ? styles.cardTitle : styles.screenTitle}>
        {isSignUp ? 'Créer un compte' : 'Connexion'}
      </Text>
      {isSignUp ? (
        <Text style={styles.hint}>
          Tu recevras un code par e-mail pour valider ton compte.
        </Text>
      ) : null}

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
        placeholder={isSignUp ? 'Mot de passe (8 caractères min.)' : 'Mot de passe'}
        placeholderTextColor={FlipOn.muted}
        secureTextEntry
        autoComplete={isSignUp ? 'new-password' : 'password'}
        textContentType={isSignUp ? 'newPassword' : 'password'}
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
          <Text style={styles.primaryText}>{isSignUp ? "S'inscrire" : 'Se connecter'}</Text>
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
        accessibilityRole="button"
        onPress={() => {
          setMode(isSignUp ? 'signIn' : 'signUp');
          setError(null);
          setPendingVerification(false);
          setCode('');
        }}
        hitSlop={8}>
        <Text style={styles.link}>
          {isSignUp
            ? 'Déjà un compte ? Se connecter'
            : "Pas encore de compte ? S'inscrire"}
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
  /** Sans bordure : le parent (`login` formBlock) fournit déjà le cadre. */
  cardFlush: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: FlipOn.ink },
  screenTitle: { fontSize: 18, fontWeight: '800', color: FlipOn.ink, marginBottom: 2 },
  hint: { fontSize: 12, lineHeight: 18, color: FlipOn.muted },
  error: { fontSize: 13, color: FlipOn.danger, lineHeight: 18 },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingHorizontal: 14,
    fontSize: 15,
    color: FlipOn.ink,
    backgroundColor: FlipOn.surface,
  },
  header: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  identityHit: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    paddingVertical: 2,
  },
  pressed: { opacity: 0.72 },
  avatar: {
    height: 56,
    width: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accentSoft,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: FlipOn.accentInk },
  headerText: { flex: 1, gap: 3, minWidth: 0 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: { fontSize: 20, fontWeight: '800', color: FlipOn.ink, flexShrink: 1 },
  planPill: {
    backgroundColor: FlipOn.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  planPillText: { fontSize: 11, fontWeight: '800', color: FlipOn.accentInk },
  email: { fontSize: 13, color: FlipOn.muted },
  editHint: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
    color: FlipOn.accentInk,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FlipOn.line,
    backgroundColor: FlipOn.surface,
  },
  secondaryText: { fontSize: 14, fontWeight: '700', color: FlipOn.ink },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  divider: { flex: 1, height: 1, backgroundColor: FlipOn.line },
  dividerText: { fontSize: 12, color: FlipOn.muted, fontWeight: '600' },
  link: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: FlipOn.accentInk,
    textAlign: 'center',
  },
});
