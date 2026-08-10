import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, type Href } from 'expo-router';

import { EndSessionCloseButton } from '@/components/session/EndSessionCloseButton';
import { homeStyles as styles } from '@/components/home/home-styles';
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
  const typeLabel = session.type === 'Groupe' ? t('type.group') : t('type.duo');

  return (
    <View style={styles.heroWrap}>
      <View style={styles.hero} pointerEvents="box-none">
        <EndSessionCloseButton
          confirm
          title={isDone ? t('endSession.archiveTitle') : undefined}
          message={isDone ? t('endSession.archiveMessage') : undefined}
          confirmLabel={isDone ? t('endSession.archiveConfirm') : undefined}
          afterEnd={onClosed}
          variant="onDark"
          style={styles.heroClose}
        />

        <View style={styles.heroTop}>
          <View style={styles.badgeLive}>
            <View style={styles.dot} />
            <Text style={styles.badgeLiveText}>
              {isDone ? t('home.badgeDone') : t('home.badgeLive')}
            </Text>
          </View>
          <Text style={styles.heroCode}>{session.code}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${home.cta}. ${home.title}`}
          style={({ pressed }) => [styles.heroBody, pressed && styles.pressed]}
          onPress={() => router.push(home.target as Href)}>
          <Text style={styles.heroTitle}>
            {typeLabel} · {home.title}
          </Text>
          <Text style={styles.heroText}>{home.detail}</Text>

          {session.status === 'voting' || session.status === 'waiting_partner' ? (
            <View style={styles.progressBlock}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
              </View>
              <Text style={styles.progressLabel}>
                {t('home.ideasSeen', {
                  current: Math.min(session.index, session.deck.length),
                  total: session.deck.length || 6,
                })}
              </Text>
            </View>
          ) : null}

          <View style={styles.heroCta}>
            <Text style={styles.heroCtaText}>{home.cta}</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#fff" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
