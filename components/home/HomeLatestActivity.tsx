import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, type Href } from 'expo-router';

import { homeStyles as styles } from '@/components/home/home-styles';
import { FlipOn } from '@/constants/flipon';
import { displayHistoryTitle, formatHistoryMeta } from '@/lib/history/format';
import type { HistoryEntry } from '@/lib/history/types';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type Props = {
  latest: HistoryEntry | null;
  showTip: boolean;
};

const STATUS_KEYS: Record<HistoryEntry['status'], TranslationKey> = {
  Validée: 'status.validated',
  'Sans match': 'status.noMatch',
  Expirée: 'status.expired',
};

export function HomeLatestActivity({ latest, showTip }: Props) {
  const router = useRouter();
  const { t } = useI18n();

  if (latest) {
    const title = displayHistoryTitle(latest.title);
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.latestTitle')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.latestSeeAllA11y')}
            onPress={() => router.push('/(tabs)/history' as Href)}
            hitSlop={8}>
            <Text style={styles.sectionLink}>{t('home.latestSeeAll')}</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.latestA11y', { title })}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() =>
            router.push(`/history-entry/${encodeURIComponent(latest.id)}` as Href)
          }>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.rowMeta}>{formatHistoryMeta(latest)}</Text>
          </View>
          <Text
            style={[
              styles.rowStatus,
              latest.status === 'Validée' ? styles.rowStatusOk : styles.rowStatusMuted,
            ]}>
            {t(STATUS_KEYS[latest.status])}
          </Text>
          <MaterialIcons name="chevron-right" size={22} color={FlipOn.muted} />
        </Pressable>
      </View>
    );
  }

  if (!showTip) return null;

  return (
    <View style={styles.tipCard}>
      <MaterialIcons name="lightbulb-outline" size={20} color={FlipOn.accentInk} />
      <Text style={styles.tipText}>{t('home.tip')}</Text>
    </View>
  );
}
