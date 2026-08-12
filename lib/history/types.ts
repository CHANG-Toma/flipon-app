import type { Constraints } from '@/data/plans';

export type HistoryEntry = {
  id: string;
  title: string;
  type: 'Duo' | 'Groupe';
  durationMin: number;
  status: 'Validée' | 'Sans match' | 'Expirée';
  createdAt: number;
  planId?: string;
  /** Cadre choisi à la création — filtre local (optionnel, anciennes entrées). */
  constraints?: Constraints;
};
