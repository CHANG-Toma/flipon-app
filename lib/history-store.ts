import AsyncStorage from '@react-native-async-storage/async-storage';

export type HistoryEntry = {
  id: string;
  title: string;
  type: 'Duo' | 'Groupe';
  durationMin: number;
  status: 'Validée' | 'Sans match' | 'Expirée';
  createdAt: number;
  planId?: string;
};

const STORAGE_KEY = 'flipon:history:v1';

let entries: HistoryEntry[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

async function persist() {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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

export async function hydrateHistory() {
  if (hydrated) return entries;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
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

export async function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) {
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
    const { fetchRemoteHistory } = await import('@/lib/api');
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

export function formatHistoryMeta(entry: HistoryEntry) {
  const when = formatRelativeDay(entry.createdAt);
  const duration =
    entry.durationMin >= 60
      ? `${Math.round(entry.durationMin / 60)}h${entry.durationMin % 60 ? entry.durationMin % 60 : ''}`
      : `${entry.durationMin} min`;
  return `${entry.type} · ${when} · ${duration}`;
}

function formatRelativeDay(ts: number) {
  const date = new Date(ts);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startThat = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startToday - startThat) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}
