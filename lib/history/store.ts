import { fetchRemoteHistory } from '@/lib/api/history';
import {
  HISTORY_CLOUD_PULL_MIN_INTERVAL_MS,
  HISTORY_MAX_ENTRIES,
} from '@/lib/history/constants';
import type { HistoryEntry } from '@/lib/history/types';
import { getKeyValueStore } from '@/lib/storage';

const STORAGE_KEY_PREFIX = 'flipon:history:v1';
const GUEST_SCOPE = 'guest';

let storageScope = GUEST_SCOPE;
let lastCloudPullAt = 0;

let entries: HistoryEntry[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function entriesEqual(a: HistoryEntry[], b: HistoryEntry[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const left = a[i];
    const right = b[i];
    if (
      left.id !== right.id ||
      left.title !== right.title ||
      left.status !== right.status ||
      left.createdAt !== right.createdAt ||
      left.type !== right.type ||
      left.durationMin !== right.durationMin ||
      left.planId !== right.planId
    ) {
      return false;
    }
  }
  return true;
}

/** Met à jour le cache mémoire ; émet seulement si les données changent. */
function commitEntries(next: HistoryEntry[], options?: { persist?: boolean }): HistoryEntry[] {
  const capped = next.slice(0, HISTORY_MAX_ENTRIES);
  if (entriesEqual(entries, capped)) return entries;
  entries = capped;
  if (options?.persist !== false) {
    void persist();
  }
  emit();
  return entries;
}

async function commitEntriesAsync(next: HistoryEntry[]): Promise<HistoryEntry[]> {
  const capped = next.slice(0, HISTORY_MAX_ENTRIES);
  if (entriesEqual(entries, capped)) return entries;
  entries = capped;
  await persist();
  emit();
  return entries;
}

async function persist() {
  try {
    await getKeyValueStore().setItem(getStorageKey(), JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

function getStorageKey() {
  return `${STORAGE_KEY_PREFIX}:${storageScope}`;
}

export function subscribeHistory(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getHistory() {
  return entries;
}

export function getLatestHistory() {
  return entries[0] ?? null;
}

export function getHistoryEntry(id: string) {
  return entries.find((item) => item.id === id) ?? null;
}

export async function removeHistoryEntry(id: string) {
  await hydrateHistory();
  return commitEntriesAsync(entries.filter((item) => item.id !== id));
}

export async function hydrateHistory() {
  if (hydrated) return entries;
  try {
    const raw = await getKeyValueStore().getItem(getStorageKey());
    if (raw) {
      const parsed = JSON.parse(raw) as HistoryEntry[];
      if (Array.isArray(parsed)) {
        commitEntries(parsed, { persist: false });
      }
    }
  } catch {
    commitEntries([], { persist: false });
  }
  hydrated = true;
  return entries;
}

export async function addHistoryEntry(
  entry: Omit<HistoryEntry, 'id' | 'createdAt'> & { id?: string; createdAt?: number },
) {
  await hydrateHistory();
  const next: HistoryEntry = {
    id: entry.id ?? `h-${Date.now()}`,
    title: entry.title,
    type: entry.type,
    durationMin: entry.durationMin,
    status: entry.status,
    createdAt: entry.createdAt ?? Date.now(),
    planId: entry.planId,
    constraints: entry.constraints,
  };
  await commitEntriesAsync([next, ...entries.filter((item) => item.id !== next.id)]);
  return next;
}

/** Fusionne l'historique cloud (auth) avec le local ; le cloud gagne en cas de conflit d'id. */
export async function mergeRemoteHistory(remote: HistoryEntry[]) {
  await hydrateHistory();
  const byId = new Map<string, HistoryEntry>();
  for (const item of entries) byId.set(item.id, item);
  for (const item of remote) byId.set(item.id, item);
  return commitEntriesAsync(
    Array.from(byId.values()).sort((a, b) => b.createdAt - a.createdAt),
  );
}

export async function pullCloudHistory(options?: { force?: boolean }) {
  const force = options?.force ?? false;
  const now = Date.now();
  if (!force && now - lastCloudPullAt < HISTORY_CLOUD_PULL_MIN_INTERVAL_MS) {
    return getHistory();
  }
  try {
    lastCloudPullAt = now;
    const { items } = await fetchRemoteHistory();
    return mergeRemoteHistory(items);
  } catch {
    return getHistory();
  }
}

export async function clearHistory() {
  return commitEntriesAsync([]);
}

/**
 * Cloisonne l'historique local par scope (ex: userId Clerk).
 * Appelée depuis AuthBridge quand l'identité change.
 */
export async function setHistoryScope(scope: string | null | undefined) {
  const nextScope = scope?.trim() || GUEST_SCOPE;
  if (nextScope === storageScope) return entries;

  storageScope = nextScope;
  hydrated = false;
  entries = [];
  emit();
  return hydrateHistory();
}
