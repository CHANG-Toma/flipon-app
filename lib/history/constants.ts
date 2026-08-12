/** Icône Material — historique (tab bar + états vides). */
export const HISTORY_ICON = 'history' as const;

/** Nombre max d'entrées persistées localement (RAM + disque). */
export const HISTORY_MAX_ENTRIES = 50;

/** Entrées visibles avant expansion manuelle dans l'onglet Historique. */
export const HISTORY_LIST_INITIAL_VISIBLE = 5;

/** Intervalle minimum entre deux sync cloud (pull-to-refresh). */
export const HISTORY_CLOUD_PULL_MIN_INTERVAL_MS = 60_000;

/** Réglages SectionList — alignés sur HISTORY_LIST_INITIAL_VISIBLE. */
export const HISTORY_LIST_WINDOW = {
  initialNumToRender: HISTORY_LIST_INITIAL_VISIBLE + 1,
  maxToRenderPerBatch: 8,
  windowSize: 5,
} as const;
