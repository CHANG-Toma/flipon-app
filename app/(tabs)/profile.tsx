/**
 * Onglet Profil (Basique)
 * -----------------------
 * - Compte Clerk (AuthCard : identité + modifier + déconnexion)
 * - Offre Basique
 * - Liens légaux (site) + support
 * - Suppression de compte (RGPD)
 * Pas de faux toggles (notifs / stats) tant qu’ils ne sont pas branchés.
 */
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { useRouter, type Href } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { AuthCard } from '@/components/auth/AuthCard';
import { FlipOn } from '@/constants/flipon';
import { deleteAccountLocalAndClerk, humanDeleteError } from '@/lib/account';
import { signOutAndClearHint } from '@/lib/auth/sign-out';
import { legalUrl, SUPPORT_EMAIL, supportMailto } from '@/lib/legal';

const APP_VERSION =
  Constants.expoConfig?.version ??
  Constants.nativeAppVersion ??
  '1.0.0';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [deleting, setDeleting] = useState(false);

  const openUrl = useCallback(async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        Alert.alert('Lien indisponible', 'Impossible d’ouvrir ce lien sur cet appareil.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Lien indisponible', 'Impossible d’ouvrir ce lien pour le moment.');
    }
  }, []);

  const onDeleteAccount = useCallback(() => {
    if (!user || deleting) return;

    Alert.alert(
      'Supprimer mon compte ?',
      'Cette action est définitive : ton compte FlipOn sera effacé. Les données locales (session, historique) seront aussi effacées sur cet appareil.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                setDeleting(true);
                await deleteAccountLocalAndClerk(user);
                await signOutAndClearHint(signOut);
                router.replace('/login' as Href);
              } catch (e) {
                Alert.alert('Suppression impossible', humanDeleteError(e));
              } finally {
                setDeleting(false);
              }
            })();
          },
        },
      ],
    );
  }, [user, deleting, signOut, router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <Text style={styles.screenTitle}>Profil</Text>

        <AuthCard />

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Offre</Text>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>Plan</Text>
            <Text style={styles.rowValue}>Basique (gratuit)</Text>
          </View>
          <LinkRow
            label="Gérer mon abonnement"
            onPress={() => router.push('/subscription' as Href)}
            last
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Informations légales</Text>
          <LinkRow
            label="Politique de confidentialité"
            onPress={() => void openUrl(legalUrl('confidentialite'))}
          />
          <LinkRow label="CGU" onPress={() => void openUrl(legalUrl('cgu'))} />
          <LinkRow
            label="Mentions légales"
            onPress={() => void openUrl(legalUrl('mentions'))}
          />
          <LinkRow
            label="Contacter le support"
            detail={SUPPORT_EMAIL}
            onPress={() => void openUrl(supportMailto())}
            last
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: deleting || !user }}
          style={[styles.dangerButton, (deleting || !user) && styles.dangerDisabled]}
          onPress={onDeleteAccount}
          disabled={deleting || !user}>
          {deleting ? (
            <ActivityIndicator color={FlipOn.danger} />
          ) : (
            <Text style={styles.dangerButtonText}>Supprimer mon compte</Text>
          )}
        </Pressable>

        <Text style={styles.version}>FlipOn · version {APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function LinkRow({
  label,
  detail,
  onPress,
  last = false,
}: {
  label: string;
  detail?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed }) => [
        styles.linkRow,
        !last && styles.rowBorder,
        pressed && styles.linkPressed,
      ]}>
      <View style={styles.linkTextCol}>
        <Text style={styles.rowLabel}>{label}</Text>
        {detail ? <Text style={styles.linkDetail}>{detail}</Text> : null}
      </View>
      <MaterialIcons name="chevron-right" size={22} color={FlipOn.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FlipOn.bg },
  scroll: { flex: 1 },
  container: { flexGrow: 1, padding: 20, gap: 14, paddingBottom: 110 },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: FlipOn.ink,
    letterSpacing: -0.4,
  },
  block: {
    backgroundColor: FlipOn.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: FlipOn.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  row: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  linkRow: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    minHeight: 48,
  },
  linkPressed: { opacity: 0.7 },
  linkTextCol: { flex: 1, gap: 2 },
  linkDetail: { fontSize: 12, color: FlipOn.muted },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: FlipOn.soft },
  rowLabel: { fontSize: 15, fontWeight: '600', color: FlipOn.ink },
  rowValue: { fontSize: 14, color: FlipOn.muted, fontWeight: '600' },
  dangerButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FlipOn.dangerLine,
    backgroundColor: FlipOn.dangerSoft,
  },
  dangerDisabled: { opacity: 0.55 },
  dangerButtonText: { fontSize: 15, fontWeight: '700', color: FlipOn.danger },
  version: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12,
    color: FlipOn.muted,
  },
});
