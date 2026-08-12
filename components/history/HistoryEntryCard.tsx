import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn, cardShadow } from '@/constants/flipon';
import { displayHistoryTitle, formatHistorySubtitle } from '@/lib/history/format';
import type { HistoryEntry } from '@/lib/history/types';
import { useI18n } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

type Props = {
  entry: HistoryEntry;
  onPress: () => void;
};

function statusKey(status: HistoryEntry['status']): TranslationKey {
  if (status === 'Validée') return 'status.validated';
  if (status === 'Sans match') return 'status.noMatch';
  return 'status.expired';
}

export function HistoryEntryCard({ entry, onPress }: Props) {
  const { t } = useI18n();
  const title = displayHistoryTitle(entry.title);
  const subtitle = formatHistorySubtitle(entry, { includeWhen: false });
  const validated = entry.status === 'Validée';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${t(statusKey(entry.status))}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
        <Text style={[styles.status, validated ? styles.statusOk : styles.statusMuted]}>
          {t(statusKey(entry.status))}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={FlipOn.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FlipOn.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...cardShadow,
  },
  pressed: { opacity: 0.82 },
  body: { flex: 1, gap: 6 },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: FlipOn.ink,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: FlipOn.muted,
  },
  status: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 2,
  },
  statusOk: { color: FlipOn.success, backgroundColor: FlipOn.successSoft },
  statusMuted: { color: FlipOn.muted, backgroundColor: FlipOn.soft },
});
