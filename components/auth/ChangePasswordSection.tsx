import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn } from '@/constants/flipon';
import { useChangePassword } from '@/hooks/use-change-password';

/** Section MDP FlipOn — visible seulement si `useChangePassword().available`. */
export function ChangePasswordSection() {
  const {
    available,
    currentPassword,
    newPassword,
    confirmPassword,
    busy,
    feedback,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    clearError,
    submit,
  } = useChangePassword();

  if (!available) return null;

  const locked = busy || feedback?.type === 'success';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Mot de passe</Text>
      <Text style={styles.sub}>
        Change le mot de passe utilisé pour te connecter par e-mail sur FlipOn.
      </Text>

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
            size={20}
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

      <View style={styles.field}>
        <Text style={styles.label}>Mot de passe actuel</Text>
        <TextInput
          value={currentPassword}
          onChangeText={(v) => {
            setCurrentPassword(v);
            clearError();
          }}
          placeholder="Ton mot de passe actuel"
          placeholderTextColor={FlipOn.muted}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          style={styles.input}
          accessibilityLabel="Mot de passe actuel"
          editable={!locked}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Nouveau mot de passe</Text>
        <TextInput
          value={newPassword}
          onChangeText={(v) => {
            setNewPassword(v);
            clearError();
          }}
          placeholder="8 caractères minimum"
          placeholderTextColor={FlipOn.muted}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          style={styles.input}
          accessibilityLabel="Nouveau mot de passe"
          editable={!locked}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Confirmer</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={(v) => {
            setConfirmPassword(v);
            clearError();
          }}
          placeholder="Répète le nouveau mot de passe"
          placeholderTextColor={FlipOn.muted}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={() => void submit()}
          style={styles.input}
          accessibilityLabel="Confirmer le mot de passe"
          editable={!locked}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        style={[styles.primary, locked && styles.primaryDisabled]}
        onPress={() => void submit()}
        disabled={locked}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>
            {feedback?.type === 'success' ? 'Mis à jour' : 'Mettre à jour le mot de passe'}
          </Text>
        )}
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
    gap: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: FlipOn.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sub: { fontSize: 12, lineHeight: 18, color: FlipOn.muted, marginTop: -4 },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  bannerSuccess: { backgroundColor: FlipOn.successSoft, borderColor: '#A7F3D0' },
  bannerError: { backgroundColor: FlipOn.dangerSoft, borderColor: FlipOn.dangerLine },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  bannerTextSuccess: { color: FlipOn.success },
  bannerTextError: { color: FlipOn.danger },
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
  primary: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryDisabled: { opacity: 0.45 },
  primaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
