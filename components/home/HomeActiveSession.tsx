import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, type Href } from 'expo-router';

import { EndSessionCloseButton } from '@/components/session/EndSessionCloseButton';
import { homeStyles as styles } from '@/components/home/home-styles';
import { FlipOn } from '@/constants/flipon';
import { useI18n } from '@/lib/i18n';
import { getHomeCta } from '@/lib/session/home-cta';
import type { SessionState } from '@/lib/session/types';

type Props = {
  session: SessionState;
  onClosed: () => void;
};

export function HomeActiveSession({ session, onClosed }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const home = getHomeCta(session);
  const progressPct = Math.max(
    10,
    (Math.min(session.index, session.deck.length) / Math.max(session.deck.length, 1)) * 100,
  );
  const isDone = session.status === 'done';

  return (
    <View style={styles.heroWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${home.cta}. ${home.title}`}
        onPress={() => router.push(home.target as Href)}
        style={({ pressed }) => [styles.activeCard, pressed && styles.pressed]}>
        <EndSessionCloseButton
          confirm
          title={isDone ? t('endSession.archiveTitle') : undefined}
          message={isDone ? t('endSession.archiveMessage') : undefined}
          confirmLabel={isDone ? t('endSession.archiveConfirm') : undefined}
          afterEnd={onClosed}
          variant="onDark"
          style={styles.heroClose}
        />

        <View style={styles.activeBody}>
          <View style={styles.badgeLive}>
            <View style={styles.dot} />
            <Text style={styles.badgeLiveText}>
              {isDone ? t('home.badgeDone') : t('home.badgeLive')}
            </Text>
          </View>

          <Text style={styles.activeCode}>{session.code}</Text>

          {session.status === 'voting' || session.status === 'waiting_partner' ? (
            <View style={styles.progressBlock}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
              </View>
            </View>
          ) : (
            <MaterialIcons name="play-circle-outline" size={40} color={FlipOn.accent} />
          )}
        </View>

        <Text style={styles.activeTitle}>{home.cta}</Text>
      </Pressable>
    </View>
  );
}
