import { fetchRemoteHistory } from '@/lib/api/history';
import type { HistoryEntry } from '@/lib/history/types';
import { getKeyValueStore } from '@/lib/storage';

const STORAGE_KEY = 'flipon:history:v1';

let entries: HistoryEntry[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

async function persist() {
  try {
    await getKeyValueStore().setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
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
  entries = entries.filter((item) => item.id !== id);
  await persist();
  emit();
  return entries;
}

export async function hydrateHistory() {
  if (hydrated) return entries;
  try {
    const raw = await getKeyValueStore().getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HistoryEntry[];
      if (Array.isArray(parsed)) entries = parsed;
    }
  } catch {
    entries = [];
  }
  hydrated = true;
  emit();
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
  };
  entries = [next, ...entries.filter((item) => item.id !== next.id)].slice(0, 50);
  await persist();
  emit();
  return next;
}

/** Fusionne l’historique cloud (auth) avec le local ; le cloud gagne en cas de conflit d’id. */
export async function mergeRemoteHistory(remote: HistoryEntry[]) {
  await hydrateHistory();
  const byId = new Map<string, HistoryEntry>();
  for (const item of entries) byId.set(item.id, item);
  for (const item of remote) byId.set(item.id, item);
  entries = Array.from(byId.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 50);
  await persist();
  emit();
  return entries;
}

export async function pullCloudHistory() {
  try {
    const { items } = await fetchRemoteHistory();
    return mergeRemoteHistory(items);
  } catch {
    return getHistory();
  }
}

export async function clearHistory() {
  entries = [];
  await persist();
  emit();
}
