/**
 * Modifier mon profil
 * -------------------
 * Met à jour prénom / nom côté Clerk, puis sync `/api/me` → displayName Postgres.
 * Feedback succès / erreur inline (pas d’Alert système pour le happy path).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Screen } from '@/components/ui/Screen';
import { ChangePasswordSection } from '@/components/auth/ChangePasswordSection';
import { FlipOn } from '@/constants/flipon';
import { syncMe } from '@/lib/api';
import { humanClerkError } from '@/lib/auth/human-clerk-error';
import { canChangeFlipOnPassword } from '@/lib/auth/user-capabilities';

type Feedback =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

function initialsFrom(first: string, last: string, email: string) {
  const a = first.trim()[0] ?? '';
  const b = last.trim()[0] ?? '';
  const fromName = `${a}${b}`.toUpperCase();
  if (fromName) return fromName.slice(0, 2);
  return (email[0] ?? 'F').toUpperCase();
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [firstFocused, setFirstFocused] = useState(false);
  const [lastFocused, setLastFocused] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
  }, [user]);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const initials = useMemo(
    () => initialsFrom(firstName, lastName, email),
    [firstName, lastName, email],
  );

  const dirty = useMemo(() => {
    if (!user) return false;
    return (
      firstName.trim() !== (user.firstName ?? '').trim() ||
      lastName.trim() !== (user.lastName ?? '').trim()
    );
  }, [user, firstName, lastName]);

  const displayPreview = useMemo(() => {
    const full = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    return full || email || 'Compte FlipOn';
  }, [firstName, lastName, email]);

  const onSave = useCallback(async () => {
    if (!user || saving) return;
    setFeedback(null);

    const first = firstName.trim();
    const last = lastName.trim();
    if (!first && !last) {
      setFeedback({
        type: 'error',
        message: 'Indique au moins un prénom ou un nom pour ton profil.',
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!dirty) {
      setFeedback({
        type: 'success',
        message: 'Aucune modification — ton profil est déjà à jour.',
      });
      return;
    }

    try {
      setSaving(true);
      await user.update({
        firstName: first || null,
        lastName: last || null,
      });
      try {
        await syncMe();
      } catch {
        /* offline : Clerk OK */
      }

      const label = [first, last].filter(Boolean).join(' ');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback({
        type: 'success',
        message: `C’est enregistré — ton profil s’affiche maintenant comme « ${label} ».`,
      });

      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      leaveTimer.current = setTimeout(() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(tabs)/profile');
      }, 1400);
    } catch (e) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFeedback({ type: 'error', message: humanClerkError(e, 'Impossible d’enregistrer le profil. Réessaie dans un instant.') });
    } finally {
      setSaving(false);
    }
  }, [user, saving, firstName, lastName, dirty, router]);

  if (!isLoaded) {
    return (
      <Screen showBack title="Modifier mon profil">
        <View style={styles.center}>
          <ActivityIndicator color={FlipOn.accent} size="large" />
        </View>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen showBack title="Modifier mon profil">
        <Text style={styles.hint}>Connecte-toi pour modifier ton profil.</Text>
      </Screen>
    );
  }

  const formLocked = saving || feedback?.type === 'success';
  const showPasswordSection = canChangeFlipOnPassword(user);

  return (
    <Screen showBack title="Modifier mon profil">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.preview}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.previewText}>
            <Text style={styles.previewName} numberOfLines={1}>
              {displayPreview}
            </Text>
            <Text style={styles.previewSub}>Aperçu sur ton compte FlipOn</Text>
          </View>
        </View>

        {feedback ? (
          <View
            style={[
              styles.banner,
              feedback.type === 'success' ? styles.bannerSuccess : styles.bannerError,
            ]}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert">
            <MaterialIcons
              name={feedback.type === 'success' ? 'check-circle' : 'error-outline'}
              size={22}
              color={feedback.type === 'success' ? FlipOn.success : FlipOn.danger}
            />
            <Text
              style={[
                styles.bannerText,
                feedback.type === 'success' ? styles.bannerTextSuccess : styles.bannerTextError,
              ]}>
              {feedback.message}
            </Text>
          </View>
        ) : null}

        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              value={firstName}
              onChangeText={(v) => {
                setFirstName(v);
                if (feedback?.type === 'error') setFeedback(null);
              }}
              placeholder="Ex. Camille"
              placeholderTextColor={FlipOn.muted}
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="givenName"
              returnKeyType="next"
              onFocus={() => setFirstFocused(true)}
              onBlur={() => setFirstFocused(false)}
              style={[styles.input, firstFocused && styles.inputFocused]}
              accessibilityLabel="Prénom"
              editable={!formLocked}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              value={lastName}
              onChangeText={(v) => {
                setLastName(v);
                if (feedback?.type === 'error') setFeedback(null);
              }}
              placeholder="Ex. Martin"
              placeholderTextColor={FlipOn.muted}
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="familyName"
              returnKeyType="done"
              onSubmitEditing={() => void onSave()}
              onFocus={() => setLastFocused(true)}
              onBlur={() => setLastFocused(false)}
              style={[styles.input, lastFocused && styles.inputFocused]}
              accessibilityLabel="Nom"
              editable={!formLocked}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputReadonly}>
              <MaterialIcons name="lock-outline" size={16} color={FlipOn.muted} />
              <Text style={styles.emailText} numberOfLines={1}>
                {email || '—'}
              </Text>
            </View>
            <Text style={styles.hint}>
              L’e-mail est lié à ta connexion. Pour le changer, contacte le support.
            </Text>
          </View>
        </View>

        {showPasswordSection ? <ChangePasswordSection /> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: formLocked || !dirty }}
          style={[styles.primary, (formLocked || !dirty) && styles.primaryDisabled]}
          onPress={() => void onSave()}
          disabled={formLocked || !dirty}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>
              {feedback?.type === 'success' ? 'Enregistré' : 'Enregistrer'}
            </Text>
          )}
        </Pressable>

        {dirty && feedback?.type !== 'success' ? (
          <Text style={styles.dirtyHint}>Modifications non enregistrées</Text>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 14 },
  center: { paddingTop: 48, alignItems: 'center' },

  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: FlipOn.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 14,
  },
  avatar: {
    height: 56,
    width: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accentSoft,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: FlipOn.accentInk },
  previewText: { flex: 1, gap: 2, minWidth: 0 },
  previewName: { fontSize: 18, fontWeight: '800', color: FlipOn.ink },
  previewSub: { fontSize: 12, color: FlipOn.muted, fontWeight: '600' },

  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  bannerSuccess: {
    backgroundColor: FlipOn.successSoft,
    borderColor: '#A7F3D0',
  },
  bannerError: {
    backgroundColor: FlipOn.dangerSoft,
    borderColor: FlipOn.dangerLine,
  },
  bannerText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  bannerTextSuccess: { color: FlipOn.success },
  bannerTextError: { color: FlipOn.danger },

  formCard: {
    backgroundColor: FlipOn.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 16,
    gap: 14,
  },
  field: { gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: FlipOn.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: FlipOn.line,
    paddingHorizontal: 14,
    fontSize: 16,
    color: FlipOn.ink,
    backgroundColor: FlipOn.bg,
  },
  inputFocused: {
    borderColor: FlipOn.accent,
    backgroundColor: '#fff',
  },
  inputReadonly: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FlipOn.soft,
  },
  emailText: { flex: 1, fontSize: 15, color: FlipOn.muted, fontWeight: '600' },
  hint: { fontSize: 12, lineHeight: 18, color: FlipOn.muted },

  primary: {
    marginTop: 4,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryDisabled: { opacity: 0.45 },
  primaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  dirtyHint: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: FlipOn.muted,
    marginTop: -4,
  },
});
