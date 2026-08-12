import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useHistory } from '@/hooks/use-history';
import {
  filterHistoryEntries,
  type HistoryFilterId,
  visibleHistoryFilters,
} from '@/lib/history/filters';
import {
  buildHistorySections,
  historyHiddenCount,
  sliceVisibleHistoryEntries,
  type HistoryListSection,
} from '@/lib/history/list-model';
import { hydrateHistory, pullCloudHistory } from '@/lib/history/store';

export type UseHistoryListResult = {
  filter: HistoryFilterId;
  setFilter: (id: HistoryFilterId) => void;
  filters: ReturnType<typeof visibleHistoryFilters>;
  sections: HistoryListSection[];
  hiddenCount: number;
  showExpand: boolean;
  listEmpty: boolean;
  filterEmpty: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  expand: () => void;
};

export function useHistoryList(): UseHistoryListResult {
  const sessions = useHistory();
  const [filter, setFilter] = useState<HistoryFilterId>('all');
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void hydrateHistory();
    }, []),
  );

  const filters = useMemo(() => visibleHistoryFilters(sessions), [sessions]);

  const filtered = useMemo(
    () => filterHistoryEntries(sessions, filter),
    [sessions, filter],
  );

  const visibleEntries = useMemo(
    () => sliceVisibleHistoryEntries(filtered, { expanded }),
    [filtered, expanded],
  );

  const sections = useMemo(() => buildHistorySections(visibleEntries), [visibleEntries]);

  const hiddenCount = historyHiddenCount(filtered.length, visibleEntries.length);
  const listEmpty = sessions.length === 0;
  const filterEmpty = !listEmpty && filtered.length === 0;
  const showExpand = !expanded && hiddenCount > 0;

  useEffect(() => {
    if (!filters.some((item) => item.id === filter)) {
      setFilter('all');
    }
  }, [filters, filter]);

  useEffect(() => {
    setExpanded(false);
  }, [filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await hydrateHistory();
      await pullCloudHistory({ force: true });
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const expand = useCallback(() => {
    setExpanded(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return {
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
  };
}
