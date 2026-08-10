import { Pressable, Text, TextInput, View } from 'react-native';

import { homeStyles as styles } from '@/components/home/home-styles';
import { FlipOn } from '@/constants/flipon';
import { normalizeSessionCode } from '@/lib/session-code';

type Props = {
  joinCode: string;
  joinError: string | null;
  onChangeCode: (code: string) => void;
  onJoin: () => void;
};

export function HomeJoinCode({ joinCode, joinError, onChangeCode, onJoin }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Rejoindre avec un code</Text>
      <View style={styles.joinRow}>
        <TextInput
          value={joinCode}
          onChangeText={(value) => onChangeCode(normalizeSessionCode(value))}
          placeholder="ABCD"
          placeholderTextColor={FlipOn.muted}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          textContentType="oneTimeCode"
          maxLength={4}
          returnKeyType="go"
          onSubmitEditing={onJoin}
          accessibilityLabel="Code de session"
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rejoindre la session"
          style={[styles.joinButton, !joinCode.trim() && styles.joinButtonDisabled]}
          onPress={onJoin}
          disabled={!joinCode.trim()}>
          <Text style={styles.joinButtonText}>OK</Text>
        </Pressable>
      </View>
      {joinError ? <Text style={styles.joinError}>{joinError}</Text> : null}
      <Text style={styles.hint}>
        4 lettres · votes privés · pas besoin d’avoir créé la session
      </Text>
    </View>
  );
}
