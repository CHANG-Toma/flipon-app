/**
 * Onglet Historique — présentation uniquement ; logique dans useHistoryList.
 */
import { useCallback } from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
  type SectionListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';

import { HistoryDayDivider } from '@/components/history/HistoryDayDivider';
import { HistoryEntryCard } from '@/components/history/HistoryEntryCard';
import { HistoryExpandRow } from '@/components/history/HistoryExpandRow';
import { HistoryFilterBar } from '@/components/history/HistoryFilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlipOn } from '@/constants/flipon';
import { useHistoryList } from '@/hooks/use-history-list';
import { HISTORY_LIST_WINDOW, HISTORY_ICON } from '@/lib/history/constants';
import type { HistoryListSection } from '@/lib/history/list-model';
import type { HistoryEntry } from '@/lib/history/types';
import { useI18n } from '@/lib/i18n';

function ItemSeparator() {
  return <View style={styles.separator} />;
}

function SectionSeparator() {
  return <View style={styles.sectionGap} />;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const {
    filter,
    setFilter,
    filters,
    sections,
    hiddenCount,
    showExpand,
    listEmpty,
    filterEmpty,
    refreshing,
    onRefresh,
    expand,
  } = useHistoryList();

  const openEntry = useCallback(
    (entry: HistoryEntry) => {
      router.push(`/history-entry/${encodeURIComponent(entry.id)}` as Href);
    },
    [router],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: HistoryListSection }) => (
      <HistoryDayDivider label={section.title} />
    ),
    [],
  );

  const renderItem: SectionListRenderItem<HistoryEntry, HistoryListSection> = useCallback(
    ({ item }) => <HistoryEntryCard entry={item} onOpen={openEntry} />,
    [openEntry],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        initialNumToRender={HISTORY_LIST_WINDOW.initialNumToRender}
        maxToRenderPerBatch={HISTORY_LIST_WINDOW.maxToRenderPerBatch}
        windowSize={HISTORY_LIST_WINDOW.windowSize}
        removeClippedSubviews={Platform.OS === 'android'}
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
          showExpand ? (
            <HistoryExpandRow remaining={hiddenCount} onPress={expand} />
          ) : null
        }
        ListEmptyComponent={
          listEmpty ? (
            <EmptyState
              title={t('history.emptyTitle')}
              text={t('history.emptyText')}
              actionLabel={t('history.emptyAction')}
              onAction={() => router.push('/session' as Href)}
              icon={HISTORY_ICON}
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
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        SectionSeparatorComponent={SectionSeparator}
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
