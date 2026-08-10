import { Pressable, Text, TextInput, View } from 'react-native';

import { homeStyles as styles } from '@/components/home/home-styles';
import { FlipOn } from '@/constants/flipon';
import { useI18n } from '@/lib/i18n';
import { normalizeSessionCode } from '@/lib/session-code';

type Props = {
  joinCode: string;
  joinError: string | null;
  onChangeCode: (code: string) => void;
  onJoin: () => void;
};

export function HomeJoinCode({ joinCode, joinError, onChangeCode, onJoin }: Props) {
  const { t } = useI18n();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('home.joinTitle')}</Text>
      <View style={styles.joinRow}>
        <TextInput
          value={joinCode}
          onChangeText={(value) => onChangeCode(normalizeSessionCode(value))}
          placeholder={t('home.joinPlaceholder')}
          placeholderTextColor={FlipOn.muted}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          textContentType="oneTimeCode"
          maxLength={4}
          returnKeyType="go"
          onSubmitEditing={onJoin}
          accessibilityLabel={t('home.joinCodeA11y')}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.joinButtonA11y')}
          style={[styles.joinButton, !joinCode.trim() && styles.joinButtonDisabled]}
          onPress={onJoin}
          disabled={!joinCode.trim()}>
          <Text style={styles.joinButtonText}>{t('common.ok')}</Text>
        </Pressable>
      </View>
      {joinError ? <Text style={styles.joinError}>{joinError}</Text> : null}
      <Text style={styles.hint}>{t('home.joinHint')}</Text>
    </View>
  );
}
