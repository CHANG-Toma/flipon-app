/**
 * Historique FlipOn — barrel public.
 * Domaine : `lib/history/*` · Hooks React : `hooks/use-history.ts`, `hooks/use-history-list.ts`.
 */
export type { HistoryEntry } from '@/lib/history/types';
export {
  HISTORY_CLOUD_PULL_MIN_INTERVAL_MS,
  HISTORY_ICON,
  HISTORY_LIST_INITIAL_VISIBLE,
  HISTORY_LIST_WINDOW,
  HISTORY_MAX_ENTRIES,
} from '@/lib/history/constants';
export {
  buildHistorySections,
  historyHiddenCount,
  sliceVisibleHistoryEntries,
  type HistoryListSection,
} from '@/lib/history/list-model';
export {
  addHistoryEntry,
  clearHistory,
  getHistory,
  getHistoryEntry,
  getLatestHistory,
  hydrateHistory,
  mergeRemoteHistory,
  pullCloudHistory,
  removeHistoryEntry,
  setHistoryScope,
  subscribeHistory,
} from '@/lib/history/store';
export {
  formatHistoryDayLabel,
  formatHistoryMeta,
  groupHistoryByDay,
} from '@/lib/history/format';
