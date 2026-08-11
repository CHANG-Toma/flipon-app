/**
 * Historique FlipOn — barrel public.
 * Domaine : `lib/history/store.ts` · Présentation : `lib/history/format.ts`.
 */
export type { HistoryEntry } from '@/lib/history/types';
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
