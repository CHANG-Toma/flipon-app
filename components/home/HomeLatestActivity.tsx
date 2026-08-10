import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, type Href } from 'expo-router';

import { homeStyles as styles } from '@/components/home/home-styles';
import { FlipOn } from '@/constants/flipon';
import { formatHistoryMeta } from '@/lib/history/format';
import type { HistoryEntry } from '@/lib/history/types';

type Props = {
  latest: HistoryEntry | null;
  showTip: boolean;
};

export function HomeLatestActivity({ latest, showTip }: Props) {
  const router = useRouter();

  if (latest) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dernière activité</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voir tout l’historique"
            onPress={() => router.push('/(tabs)/history' as Href)}
            hitSlop={8}>
            <Text style={styles.sectionLink}>Voir tout</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Dernière activité ${latest.title}`}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() =>
            router.push(`/history-entry/${encodeURIComponent(latest.id)}` as Href)
          }>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle} numberOfLines={2}>
              {latest.title}
            </Text>
            <Text style={styles.rowMeta}>{formatHistoryMeta(latest)}</Text>
          </View>
          <Text
            style={[
              styles.rowStatus,
              latest.status === 'Validée' ? styles.rowStatusOk : styles.rowStatusMuted,
            ]}>
            {latest.status}
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
      <Text style={styles.tipText}>
        Astuce : après un match, la session apparaît dans Historique. Tu peux la partager ou en
        relancer une.
      </Text>
    </View>
  );
}
