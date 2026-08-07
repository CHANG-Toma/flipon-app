/**
 * Modifier mon profil
 * -------------------
 * Met à jour prénom / nom côté Clerk, puis sync `/api/me` → displayName Postgres.
 * L’e-mail est en lecture seule (changement = flux Clerk de vérif, hors scope Basique).
 */
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

import { Screen } from '@/components/ui/Screen';
import { FlipOn } from '@/constants/flipon';
import { syncMe } from '@/lib/api';

function humanClerkError(e: unknown): string {
  if (e && typeof e === 'object' && 'errors' in e) {
    const first = (e as { errors?: { longMessage?: string; message?: string }[] }).errors?.[0];
    if (first?.longMessage) return first.longMessage;
    if (first?.message) return first.message;
  }
  if (e instanceof Error && e.message) return e.message;
  return 'Impossible d’enregistrer le profil.';
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
  }, [user]);

  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  const onSave = useCallback(async () => {
    if (!user || saving) return;
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first && !last) {
      Alert.alert('Profil incomplet', 'Indique au moins un prénom ou un nom.');
      return;
    }

    try {
      setSaving(true);
      await user.update({
        firstName: first || null,
        lastName: last || null,
      });
      // Rafraîchir displayName côté API / Postgres
      try {
        await syncMe();
      } catch {
        /* offline : Clerk OK, sync BDD au prochain login */
      }
      Alert.alert('Profil mis à jour', 'Tes infos ont été enregistrées.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Enregistrement impossible', humanClerkError(e));
    } finally {
      setSaving(false);
    }
  }, [user, saving, firstName, lastName, router]);

  if (!isLoaded) {
    return (
      <Screen showBack title="Modifier mon profil">
        <View style={styles.center}>
          <ActivityIndicator color={FlipOn.accent} />
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

  return (
    <Screen showBack title="Modifier mon profil">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <Text style={styles.lead}>
          Ces infos apparaissent sur ton compte FlipOn. L’e-mail ne se change pas
          ici.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Prénom"
            placeholderTextColor={FlipOn.muted}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="givenName"
            style={styles.input}
            accessibilityLabel="Prénom"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nom"
            placeholderTextColor={FlipOn.muted}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="familyName"
            style={styles.input}
            accessibilityLabel="Nom"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputReadonly}>
            <Text style={styles.emailText} numberOfLines={1}>
              {email || '—'}
            </Text>
          </View>
          <Text style={styles.hint}>Géré par ton compte de connexion (Clerk).</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: saving }}
          style={[styles.primary, saving && styles.primaryDisabled]}
          onPress={() => void onSave()}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Enregistrer</Text>
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 14 },
  center: { paddingTop: 40, alignItems: 'center' },
  lead: { fontSize: 14, lineHeight: 21, color: FlipOn.muted, marginBottom: 4 },
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
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingHorizontal: 14,
    fontSize: 16,
    color: FlipOn.ink,
    backgroundColor: FlipOn.surface,
  },
  inputReadonly: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: FlipOn.soft,
  },
  emailText: { fontSize: 15, color: FlipOn.muted, fontWeight: '600' },
  hint: { fontSize: 12, lineHeight: 18, color: FlipOn.muted },
  primary: {
    marginTop: 8,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryDisabled: { opacity: 0.7 },
  primaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
