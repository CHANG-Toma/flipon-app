import { getRuntimeLocale, tr } from '@/lib/i18n';
import type { HistoryEntry } from '@/lib/history/types';

function dateLocale() {
  return getRuntimeLocale() === 'en' ? 'en-US' : 'fr-FR';
}

function formatRelativeDay(ts: number) {
  const date = new Date(ts);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startThat = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startToday - startThat) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return tr('history.today');
  if (diffDays === 1) return tr('history.yesterday');
  return date.toLocaleDateString(dateLocale(), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** Titre affiché (sentinel « Sans match » → i18n). */
export function displayHistoryTitle(title: string) {
  if (title === 'Sans match' || title === 'No match') return tr('status.noMatch');
  return title;
}

export function formatHistoryMeta(entry: HistoryEntry) {
  const when = formatRelativeDay(entry.createdAt);
  const typeLabel = entry.type === 'Groupe' ? tr('type.group') : tr('type.duo');
  const duration =
    entry.durationMin >= 60
      ? `${Math.round(entry.durationMin / 60)}h${entry.durationMin % 60 ? entry.durationMin % 60 : ''}`
      : `${entry.durationMin} min`;
  return `${typeLabel} · ${when} · ${duration}`;
}

/** Libellé de section pour grouper la liste (Aujourd'hui / Hier / date). */
export function formatHistoryDayLabel(ts: number) {
  return formatRelativeDay(ts);
}

export function groupHistoryByDay(items: HistoryEntry[]) {
  const groups: { label: string; items: HistoryEntry[] }[] = [];
  const indexByLabel = new Map<string, number>();

  for (const entry of items) {
    const label = formatHistoryDayLabel(entry.createdAt);
    const existing = indexByLabel.get(label);
    if (existing === undefined) {
      indexByLabel.set(label, groups.length);
      groups.push({ label, items: [entry] });
    } else {
      groups[existing].items.push(entry);
    }
  }

  return groups;
}
