import { useCallback } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';

import { authStyles as styles } from '@/components/auth/auth-styles';
import { FlipOn } from '@/constants/flipon';
import { humanClerkError } from '@/lib/auth/human-clerk-error';

type Props = {
  disabled?: boolean;
  loading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (message: string) => void;
  onSuccess?: () => void;
};

/** Bouton OAuth Google (scheme `fliponapp`). */
export function AuthGoogleButton({
  disabled,
  loading,
  onLoadingChange,
  onError,
  onSuccess,
}: Props) {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onGoogle = useCallback(async () => {
    try {
      onLoadingChange?.(true);
      onError?.('');
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/login', { scheme: 'fliponapp' }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        onSuccess?.();
      }
    } catch (e) {
      onError?.(humanClerkError(e));
    } finally {
      onLoadingChange?.(false);
    }
  }, [onError, onLoadingChange, onSuccess, startOAuthFlow]);

  return (
    <Pressable
      accessibilityRole="button"
      style={styles.secondaryButton}
      onPress={onGoogle}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={FlipOn.ink} />
      ) : (
        <Text style={styles.secondaryText}>Continuer avec Google</Text>
      )}
    </Pressable>
  );
}
