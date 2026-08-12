import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, type Href } from 'expo-router';

import { HomeActionCard } from '@/components/home/HomeActionCard';
import { homeStyles as styles } from '@/components/home/home-styles';
import { displayHistoryTitle, formatHistoryMeta } from '@/lib/history/format';
import type { HistoryEntry } from '@/lib/history/types';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type Props = {
  latest: HistoryEntry | null;
};

const STATUS_KEYS: Record<HistoryEntry['status'], TranslationKey> = {
  Validée: 'status.validated',
  'Sans match': 'status.noMatch',
  Expirée: 'status.expired',
};

export function HomeLatestActivity({ latest }: Props) {
  const router = useRouter();
  const { t } = useI18n();

  if (!latest) return null;

  const title = displayHistoryTitle(latest.title);

  return (
    <HomeActionCard
      title={t('home.latestTitle')}
      accessibilityLabel={t('home.latestA11y', { title })}
      onPress={() => router.push(`/history-entry/${encodeURIComponent(latest.id)}` as Href)}>
      <View style={styles.latestBody}>
        <Text style={styles.latestName} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.latestMeta}>{formatHistoryMeta(latest)}</Text>
        <Text
          style={[
            styles.latestStatus,
            latest.status === 'Validée' ? styles.rowStatusOk : styles.rowStatusMuted,
          ]}>
          {t(STATUS_KEYS[latest.status])}
        </Text>
      </View>
    </HomeActionCard>
  );
}
