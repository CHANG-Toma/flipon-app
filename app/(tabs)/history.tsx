/**
 * Onglet Historique
 * -----------------
 * Liste groupée par jour, pull-to-refresh (sync cloud), détail via /history-entry/[id].
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { EmptyState } from '@/components/ui/EmptyState';
import { FlipOn, cardShadow } from '@/constants/flipon';
import { displayHistoryTitle, formatHistoryMeta, groupHistoryByDay } from '@/lib/history/format';
import {
  getHistory,
  hydrateHistory,
  pullCloudHistory,
  subscribeHistory,
} from '@/lib/history/store';
import type { HistoryEntry } from '@/lib/history/types';
import { useI18n } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

function statusKey(status: HistoryEntry['status']): TranslationKey {
  if (status === 'Validée') return 'status.validated';
  if (status === 'Sans match') return 'status.noMatch';
  return 'status.expired';
}

export default function HistoryScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [sessions, setSessions] = useState<HistoryEntry[]>(getHistory());
  const [refreshing, setRefreshing] = useState(false);

  const reloadLocal = useCallback(async () => {
    const items = await hydrateHistory();
    setSessions(items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reloadLocal();
    }, [reloadLocal]),
  );

  useEffect(() => subscribeHistory(() => setSessions(getHistory())), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await hydrateHistory();
      const merged = await pullCloudHistory();
      setSessions(merged);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const groups = useMemo(() => groupHistoryByDay(sessions), [sessions]);

  const openEntry = (entry: HistoryEntry) => {
    router.push(`/history-entry/${encodeURIComponent(entry.id)}` as Href);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={FlipOn.accent}
            colors={[FlipOn.accent]}
          />
        }>
        <View style={styles.top}>
          <Text style={styles.title}>{t('history.title')}</Text>
          <Text style={styles.subtitle}>{t('history.subtitle')}</Text>
        </View>

        {sessions.length === 0 ? (
          <EmptyState
            title={t('history.emptyTitle')}
            text={t('history.emptyText')}
            actionLabel={t('history.emptyAction')}
            onAction={() => router.push('/session' as Href)}
            icon="history"
          />
        ) : (
          <>
            <Text style={styles.count}>
              {sessions.length > 1
                ? t('history.countPlural', { n: sessions.length })
                : t('history.count', { n: sessions.length })}
            </Text>
            {groups.map((group) => (
              <View key={group.label} style={styles.group}>
                <Text style={styles.groupLabel}>{group.label}</Text>
                <View style={styles.list}>
                  {group.items.map((session) => {
                    const muted = session.status !== 'Validée';
                    const statusText = t(statusKey(session.status));
                    const title = displayHistoryTitle(session.title);
                    return (
                      <Pressable
                        key={session.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${title}, ${statusText}`}
                        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                        onPress={() => openEntry(session)}>
                        <View style={styles.rowBody}>
                          <Text style={styles.rowTitle} numberOfLines={2}>
                            {title}
                          </Text>
                          <Text style={styles.rowMeta}>{formatHistoryMeta(session)}</Text>
                        </View>
                        <Text style={[styles.pill, muted ? styles.pillMuted : styles.pillOk]}>
                          {statusText}
                        </Text>
                        <MaterialIcons name="chevron-right" size={22} color={FlipOn.muted} />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FlipOn.bg },
  scroll: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
    gap: 12,
  },
  top: { gap: 6 },
  title: { fontSize: 30, fontWeight: '800', color: FlipOn.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 20, color: FlipOn.muted },
  count: { marginTop: 4, fontSize: 13, fontWeight: '600', color: FlipOn.muted },
  group: { gap: 8, marginTop: 4 },
  groupLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: FlipOn.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  list: { gap: 10 },
  row: {
    backgroundColor: FlipOn.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...cardShadow,
  },
  rowPressed: { opacity: 0.72 },
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: FlipOn.ink },
  rowMeta: { fontSize: 13, color: FlipOn.muted },
  pill: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  pillOk: { color: FlipOn.success, backgroundColor: FlipOn.successSoft },
  pillMuted: { color: FlipOn.muted, backgroundColor: FlipOn.soft },
});
