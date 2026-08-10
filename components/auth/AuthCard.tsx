/**
 * Auth UI — composition Clerk (email / inscription / Google / profil)
 * -------------------------------------------------------------------
 * Exports publics :
 * - `AuthForm`  → écran `/login`
 * - `AuthCard`  → onglet Profil
 *
 * Implémentations : AuthEmailForm, AuthGoogleButton, AuthProfileCard.
 */
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { AuthEmailForm, type AuthMode } from '@/components/auth/AuthEmailForm';
import { AuthGoogleButton } from '@/components/auth/AuthGoogleButton';
import { AuthProfileCard } from '@/components/auth/AuthProfileCard';
import { authStyles as styles } from '@/components/auth/auth-styles';
import { isClerkConfigured } from '@/lib/clerk';

WebBrowser.maybeCompleteAuthSession();

type AuthFormProps = {
  onSuccess?: () => void;
  compact?: boolean;
};

/** @deprecated Alias historique — préférer `AuthCard`. */
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

  return <AuthProfileCard fallback={<AuthForm compact />} />;
}

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

function AuthFormInner({ onSuccess, compact = false }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [loading, setLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const isSignUp = mode === 'signUp';

  return (
    <AuthEmailForm
      mode={mode}
      compact={compact}
      loading={loading}
      onLoadingChange={setLoading}
      onSuccess={onSuccess}
      footer={
        <>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.divider} />
          </View>

          {oauthError ? <Text style={styles.error}>{oauthError}</Text> : null}

          <AuthGoogleButton
            loading={loading}
            disabled={loading}
            onLoadingChange={setLoading}
            onError={(message) => setOauthError(message || null)}
            onSuccess={onSuccess}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setMode(isSignUp ? 'signIn' : 'signUp');
              setOauthError(null);
            }}
            hitSlop={8}>
            <Text style={styles.link}>
              {isSignUp
                ? 'Déjà un compte ? Se connecter'
                : "Pas encore de compte ? S'inscrire"}
            </Text>
          </Pressable>
        </>
      }
    />
  );
}
