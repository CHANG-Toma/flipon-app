import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';

import { PasswordInput } from '@/components/auth/PasswordInput';
import { authStyles as styles } from '@/components/auth/auth-styles';
import { FlipOn } from '@/constants/flipon';
import {
  genericSignInError,
  normalizeEmail,
  validateSignInCredentials,
  validateSignUpCredentials,
  validateVerificationCode,
} from '@/lib/auth/auth-form-validation';
import { humanClerkError } from '@/lib/auth/human-clerk-error';

export type AuthMode = 'signIn' | 'signUp';

type Props = {
  mode: AuthMode;
  compact?: boolean;
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onSuccess?: () => void;
  /** Contenu sous le bouton primaire (ex. Google + toggle mode). */
  footer?: ReactNode;
};

/** Formulaire email/password + vérification code inscription (OWASP-minded). */
export function AuthEmailForm({
  mode,
  compact = false,
  loading,
  onLoadingChange,
  onSuccess,
  footer,
}: Props) {
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = () => onSuccess?.();

  const onEmailAuth = async () => {
    if (loading) return;

    const validation =
      mode === 'signIn'
        ? validateSignInCredentials(email, password)
        : validateSignUpCredentials(email, password, confirmPassword);

    if (validation) {
      setError(validation.message);
      return;
    }

    const trimmed = normalizeEmail(email);

    try {
      onLoadingChange(true);
      setError(null);

      if (mode === 'signIn') {
        if (!signInLoaded || !signIn || !setActiveSignIn) return;
        const result = await signIn.create({ identifier: trimmed, password });
        if (result.status === 'complete') {
          await setActiveSignIn({ session: result.createdSessionId });
          setPassword('');
          finish();
          return;
        }
        setError(genericSignInError());
        return;
      }

      if (!signUpLoaded || !signUp || !setActiveSignUp) return;
      await signUp.create({ emailAddress: trimmed, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPassword('');
      setConfirmPassword('');
      setPendingVerification(true);
    } catch (e) {
      // Connexion : message générique (pas d’énumération). Inscription : détail utile Clerk.
      setError(mode === 'signIn' ? genericSignInError() : humanClerkError(e));
    } finally {
      onLoadingChange(false);
    }
  };

  const onVerify = async () => {
    if (!signUpLoaded || !signUp || !setActiveSignUp) return;
    const codeErr = validateVerificationCode(code);
    if (codeErr) {
      setError(codeErr.message);
      return;
    }
    try {
      onLoadingChange(true);
      setError(null);
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (result.status === 'complete') {
        await setActiveSignUp({ session: result.createdSessionId });
        setPendingVerification(false);
        setCode('');
        finish();
        return;
      }
      setError('Vérification incomplète. Vérifie le code.');
    } catch (e) {
      setError(humanClerkError(e, 'Code invalide. Réessaie.'));
    } finally {
      onLoadingChange(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={[styles.card, !compact && styles.cardFlush]}>
        <Text style={styles.cardTitle}>Confirme ton e-mail</Text>
        <Text style={styles.hint}>Un code a été envoyé à {normalizeEmail(email)}.</Text>
        <TextInput
          value={code}
          onChangeText={(v) => {
            setCode(v);
            if (error) setError(null);
          }}
          placeholder="Code à 6 chiffres"
          placeholderTextColor={FlipOn.muted}
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          style={styles.input}
          accessibilityLabel="Code de vérification"
        />
        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
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
        <Text style={styles.hint}>Tu recevras un code par e-mail pour valider ton compte.</Text>
      ) : null}

      <TextInput
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (error) setError(null);
        }}
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
      <PasswordInput
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          if (error) setError(null);
        }}
        placeholder={isSignUp ? 'Mot de passe (8 caractères min.)' : 'Mot de passe'}
        autoComplete={isSignUp ? 'new-password' : 'password'}
        textContentType={isSignUp ? 'newPassword' : 'password'}
        accessibilityLabel="Mot de passe"
      />
      {isSignUp ? (
        <PasswordInput
          value={confirmPassword}
          onChangeText={(v) => {
            setConfirmPassword(v);
            if (error) setError(null);
          }}
          placeholder="Confirmer le mot de passe"
          autoComplete="new-password"
          textContentType="newPassword"
          accessibilityLabel="Confirmer le mot de passe"
        />
      ) : null}

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        style={styles.primaryButton}
        onPress={() => void onEmailAuth()}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>{isSignUp ? "S'inscrire" : 'Se connecter'}</Text>
        )}
      </Pressable>

      {footer}
    </View>
  );
}
