import { HISTORY_LIST_INITIAL_VISIBLE } from '@/lib/history/constants';
import { groupHistoryByDay } from '@/lib/history/format';
import type { HistoryEntry } from '@/lib/history/types';

export type HistoryListSection = {
  title: string;
  data: HistoryEntry[];
};

export type HistoryListSliceOptions = {
  expanded: boolean;
  limit?: number;
};

/** Tronque la liste filtrée tant que l'utilisateur n'a pas demandé la suite. */
export function sliceVisibleHistoryEntries(
  entries: HistoryEntry[],
  options: HistoryListSliceOptions,
): HistoryEntry[] {
  const limit = options.limit ?? HISTORY_LIST_INITIAL_VISIBLE;
  if (options.expanded || entries.length <= limit) return entries;
  return entries.slice(0, limit);
}

export function historyHiddenCount(totalCount: number, visibleCount: number): number {
  return Math.max(0, totalCount - visibleCount);
}

export function buildHistorySections(entries: HistoryEntry[]): HistoryListSection[] {
  return groupHistoryByDay(entries).map((group) => ({
    title: group.label,
    data: group.items,
  }));
}
