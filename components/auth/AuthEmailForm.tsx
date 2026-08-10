import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';

import { authStyles as styles } from '@/components/auth/auth-styles';
import { FlipOn } from '@/constants/flipon';
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

/** Formulaire email/password + vérification code inscription. */
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
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = () => onSuccess?.();

  const onEmailAuth = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      setError('Email et mot de passe requis.');
      return;
    }
    if (loading) return;

    try {
      onLoadingChange(true);
      setError(null);

      if (mode === 'signIn') {
        if (!signInLoaded || !signIn || !setActiveSignIn) return;
        const result = await signIn.create({ identifier: trimmed, password });
        if (result.status === 'complete') {
          await setActiveSignIn({ session: result.createdSessionId });
          finish();
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
      setError(humanClerkError(e));
    } finally {
      onLoadingChange(false);
    }
  };

  const onVerify = async () => {
    if (!signUpLoaded || !signUp || !setActiveSignUp) return;
    if (!code.trim()) {
      setError('Entre le code reçu par e-mail.');
      return;
    }
    try {
      onLoadingChange(true);
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
      setError(humanClerkError(e));
    } finally {
      onLoadingChange(false);
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
        <Text style={styles.hint}>Tu recevras un code par e-mail pour valider ton compte.</Text>
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

      {footer}
    </View>
  );
}
