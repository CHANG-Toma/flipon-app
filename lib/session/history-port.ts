/**
 * Port : enregistrement historique en fin de session (DIP).
 * Branché depuis le composition root (`app/_layout`) vers history-store.
 */
import type { Constraints } from '@/data/plans';

export type SessionHistoryRecord = {
  id: string;
  title: string;
  type: 'Duo' | 'Groupe';
  durationMin: number;
  status: 'Validée' | 'Sans match' | 'Expirée';
  planId?: string;
  constraints?: Constraints;
};

export type SessionHistoryWriter = (entry: SessionHistoryRecord) => Promise<void>;

let writer: SessionHistoryWriter | null = null;

export function setSessionHistoryWriter(next: SessionHistoryWriter | null) {
  writer = next;
}

export async function recordSessionHistory(entry: SessionHistoryRecord) {
  if (!writer) return;
  await writer(entry);
}
