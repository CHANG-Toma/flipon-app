import type { Constraints } from '@/data/plans';
import type { HistoryEntry } from '@/lib/history/types';

export type HistoryFilterId =
  | 'all'
  | 'duo'
  | 'groupe'
  | 'validated'
  | 'noMatch'
  | 'duration30'
  | 'duration60'
  | 'duration120'
  | 'durationEvening'
  | 'vibePotes'
  | 'vibeDate'
  | 'vibeGroupe';

export type HistoryFilterDef = {
  id: HistoryFilterId;
  labelKey:
    | 'history.filterAll'
    | 'history.filterDuo'
    | 'history.filterGroupe'
    | 'history.filterValidated'
    | 'history.filterNoMatch'
    | 'history.filterDuration30'
    | 'history.filterDuration60'
    | 'history.filterDuration120'
    | 'history.filterDurationEvening'
    | 'history.filterVibePotes'
    | 'history.filterVibeDate'
    | 'history.filterVibeGroupe';
  icon?: 'people' | 'groups' | 'check-circle' | 'highlight-off' | 'schedule';
};

export const HISTORY_FILTERS: HistoryFilterDef[] = [
  { id: 'all', labelKey: 'history.filterAll', icon: 'schedule' },
  { id: 'duo', labelKey: 'history.filterDuo', icon: 'people' },
  { id: 'groupe', labelKey: 'history.filterGroupe', icon: 'groups' },
  { id: 'validated', labelKey: 'history.filterValidated', icon: 'check-circle' },
  { id: 'noMatch', labelKey: 'history.filterNoMatch', icon: 'highlight-off' },
  { id: 'duration30', labelKey: 'history.filterDuration30' },
  { id: 'duration60', labelKey: 'history.filterDuration60' },
  { id: 'duration120', labelKey: 'history.filterDuration120' },
  { id: 'durationEvening', labelKey: 'history.filterDurationEvening' },
  { id: 'vibePotes', labelKey: 'history.filterVibePotes' },
  { id: 'vibeDate', labelKey: 'history.filterVibeDate' },
  { id: 'vibeGroupe', labelKey: 'history.filterVibeGroupe' },
];

function matchesDuration(entry: HistoryEntry, duration: Constraints['duration']) {
  if (entry.constraints?.duration) {
    return entry.constraints.duration === duration;
  }
  const min = entry.durationMin;
  if (duration === '30') return min > 0 && min <= 45;
  if (duration === '60') return min > 45 && min <= 90;
  if (duration === '120') return min > 90 && min <= 150;
  if (duration === 'soirée') return min > 150;
  return false;
}

/** Filtre 100 % local — aucune requête réseau. */
export function filterHistoryEntries(
  entries: HistoryEntry[],
  filterId: HistoryFilterId,
): HistoryEntry[] {
  switch (filterId) {
    case 'all':
      return entries;
    case 'duo':
      return entries.filter((e) => e.type === 'Duo');
    case 'groupe':
      return entries.filter((e) => e.type === 'Groupe');
    case 'validated':
      return entries.filter((e) => e.status === 'Validée');
    case 'noMatch':
      return entries.filter((e) => e.status === 'Sans match');
    case 'duration30':
      return entries.filter((e) => matchesDuration(e, '30'));
    case 'duration60':
      return entries.filter((e) => matchesDuration(e, '60'));
    case 'duration120':
      return entries.filter((e) => matchesDuration(e, '120'));
    case 'durationEvening':
      return entries.filter((e) => matchesDuration(e, 'soirée'));
    case 'vibePotes':
      return entries.filter((e) => e.constraints?.vibe === 'potes');
    case 'vibeDate':
      return entries.filter((e) => e.constraints?.vibe === 'date');
    case 'vibeGroupe':
      return entries.filter((e) => e.constraints?.vibe === 'groupe');
    default:
      return entries;
  }
}

/** Masque les filtres config sans aucune entrée correspondante. */
export function visibleHistoryFilters(
  entries: HistoryEntry[],
  filters: HistoryFilterDef[] = HISTORY_FILTERS,
): HistoryFilterDef[] {
  return filters.filter((filter) => {
    if (filter.id === 'all') return true;
    return filterHistoryEntries(entries, filter.id).length > 0;
  });
}
