import { useSyncExternalStore } from 'react';

import { getHistory, getHistoryEntry, subscribeHistory } from '@/lib/history/store';
import type { HistoryEntry } from '@/lib/history/types';

/** Liste complète — une seule source en RAM via le store module. */
export function useHistory(): HistoryEntry[] {
  return useSyncExternalStore(subscribeHistory, getHistory, getHistoryServerSnapshot);
}

/** Entrée unique — réagit aux suppressions / sync sans état local dupliqué. */
export function useHistoryEntry(id: string | undefined): HistoryEntry | null {
  return useSyncExternalStore(
    subscribeHistory,
    () => (id ? getHistoryEntry(id) : null),
    () => null,
  );
}

function getHistoryServerSnapshot(): HistoryEntry[] {
  return [];
}
