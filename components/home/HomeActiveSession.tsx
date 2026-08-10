import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, type Href } from 'expo-router';

import { homeStyles as styles } from '@/components/home/home-styles';
import { getHomeCta } from '@/lib/session/home-cta';
import type { SessionState } from '@/lib/session/types';

type Props = {
  session: SessionState;
  clearing: boolean;
  onDismiss: () => void;
};

export function HomeActiveSession({ session, clearing, onDismiss }: Props) {
  const router = useRouter();
  const home = getHomeCta(session);
  const progressPct = Math.max(
    10,
    (Math.min(session.index, session.deck.length) / Math.max(session.deck.length, 1)) * 100,
  );

  return (
    <View style={styles.heroWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${home.cta}. ${home.title}`}
        style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
        onPress={() => router.push(home.target as Href)}>
        <View style={styles.heroTop}>
          <View style={styles.badgeLive}>
            <View style={styles.dot} />
            <Text style={styles.badgeLiveText}>
              {session.status === 'done' ? 'Terminée' : 'En cours'}
            </Text>
          </View>
          <Text style={styles.heroCode}>{session.code}</Text>
        </View>

        <Text style={styles.heroTitle}>
          {session.type} · {home.title}
        </Text>
        <Text style={styles.heroText}>{home.detail}</Text>

        {session.status === 'voting' || session.status === 'waiting_partner' ? (
          <View style={styles.progressBlock}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {Math.min(session.index, session.deck.length)}/{session.deck.length || 6} idées
              vues
            </Text>
          </View>
        ) : null}

        <View style={styles.heroCta}>
          <Text style={styles.heroCtaText}>{home.cta}</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#fff" />
        </View>
      </Pressable>

      {session.status === 'done' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Archiver la session terminée"
          style={styles.dismissBtn}
          onPress={onDismiss}
          disabled={clearing}>
          <Text style={styles.dismissText}>
            {clearing ? '…' : 'Archiver et revenir à l’accueil'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
