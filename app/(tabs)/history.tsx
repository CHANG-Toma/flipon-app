/**
 * Onglet Historique — liste filtrée locale, sync cloud à la demande uniquement.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { HistoryDayDivider } from '@/components/history/HistoryDayDivider';
import { HistoryEntryCard } from '@/components/history/HistoryEntryCard';
import { HistoryExpandRow } from '@/components/history/HistoryExpandRow';
import { HistoryFilterBar } from '@/components/history/HistoryFilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlipOn } from '@/constants/flipon';
import {
  filterHistoryEntries,
  type HistoryFilterId,
  visibleHistoryFilters,
} from '@/lib/history/filters';
import { groupHistoryByDay } from '@/lib/history/format';
import {
  getHistory,
  hydrateHistory,
  pullCloudHistory,
  subscribeHistory,
} from '@/lib/history/store';
import type { HistoryEntry } from '@/lib/history/types';
import { useI18n } from '@/lib/i18n';

const INITIAL_VISIBLE_COUNT = 5;

export default function HistoryScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [sessions, setSessions] = useState<HistoryEntry[]>(getHistory());
  const [filter, setFilter] = useState<HistoryFilterId>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const reloadLocal = useCallback(async () => {
    await hydrateHistory();
    setSessions(getHistory());
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
      const merged = await pullCloudHistory({ force: true });
      setSessions(merged);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filters = useMemo(() => visibleHistoryFilters(sessions), [sessions]);

  const filtered = useMemo(
    () => filterHistoryEntries(sessions, filter),
    [sessions, filter],
  );

  const hiddenCount = Math.max(0, filtered.length - INITIAL_VISIBLE_COUNT);

  const visibleEntries = useMemo(() => {
    if (expanded || hiddenCount === 0) return filtered;
    return filtered.slice(0, INITIAL_VISIBLE_COUNT);
  }, [expanded, filtered, hiddenCount]);

  const sections = useMemo(
    () =>
      groupHistoryByDay(visibleEntries).map((group) => ({
        title: group.label,
        data: group.items,
      })),
    [visibleEntries],
  );

  useEffect(() => {
    if (!filters.some((item) => item.id === filter)) {
      setFilter('all');
    }
  }, [filters, filter]);

  useEffect(() => {
    setExpanded(false);
  }, [filter]);

  const openEntry = useCallback(
    (entry: HistoryEntry) => {
      router.push(`/history-entry/${encodeURIComponent(entry.id)}` as Href);
    },
    [router],
  );

  const onExpand = useCallback(() => {
    setExpanded(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const listEmpty = sessions.length === 0;
  const filterEmpty = !listEmpty && filtered.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={FlipOn.accent}
            colors={[FlipOn.accent]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{t('history.title')}</Text>
            {!listEmpty ? (
              <HistoryFilterBar
                filters={filters}
                active={filter}
                onChange={setFilter}
              />
            ) : null}
          </View>
        }
        ListFooterComponent={
          !expanded && hiddenCount > 0 ? (
            <HistoryExpandRow remaining={hiddenCount} onPress={onExpand} />
          ) : null
        }
        ListEmptyComponent={
          listEmpty ? (
            <EmptyState
              title={t('history.emptyTitle')}
              text={t('history.emptyText')}
              actionLabel={t('history.emptyAction')}
              onAction={() => router.push('/session' as Href)}
              icon="history"
            />
          ) : filterEmpty ? (
            <View style={styles.filterEmpty}>
              <Text style={styles.filterEmptyText}>{t('history.filterEmpty')}</Text>
              <Pressable onPress={() => setFilter('all')} style={styles.filterReset}>
                <Text style={styles.filterResetText}>{t('history.filterReset')}</Text>
              </Pressable>
            </View>
          ) : null
        }
        renderSectionHeader={({ section }) => <HistoryDayDivider label={section.title} />}
        renderItem={({ item }) => (
          <HistoryEntryCard entry={item} onPress={() => openEntry(item)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FlipOn.bg },
  list: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  header: { gap: 16, marginBottom: 8 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: FlipOn.ink,
    letterSpacing: -0.6,
  },
  separator: { height: 10 },
  sectionGap: { height: 4 },
  filterEmpty: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  filterEmptyText: {
    fontSize: 15,
    color: FlipOn.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  filterReset: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: FlipOn.soft,
  },
  filterResetText: {
    fontSize: 14,
    fontWeight: '700',
    color: FlipOn.accentInk,
  },
});
