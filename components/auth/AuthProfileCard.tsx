import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter, type Href } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { authStyles as styles } from '@/components/auth/auth-styles';
import { FlipOn } from '@/constants/flipon';
import { signOutAndClearHint } from '@/lib/auth/sign-out';
import { getSubscription } from '@/lib/subscription';

type Props = {
  /** Si non connecté, rendu alternatif (ex. AuthForm). */
  fallback?: ReactNode;
};

/**
 * Carte Profil : identité + modifier profil + déconnexion.
 * La déconnexion renvoie vers `/login` (le gate root refuse l’app sans session).
 */
export function AuthProfileCard({ fallback = null }: Props) {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const planLabel = getSubscription().label;

  if (!isSignedIn || !user) {
    return <>{fallback}</>;
  }

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

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Modifier mon profil"
        accessibilityHint="Ouvre l’édition du prénom et du nom"
        onPress={() => router.push('/edit-profile' as Href)}
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
          void signOutAndClearHint(signOut).then(() => router.replace('/login' as Href));
        }}>
        <Text style={styles.secondaryText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}
