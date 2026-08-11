import type { Constraints, ContextHint } from '@/data/plans';
import * as httpDuo from '@/lib/api/duo';
import type { DuoPublicSnapshot, DuoRole } from '@/lib/api/types';

/**
 * Port client duo (DIP).
 * Implémentation HTTP par défaut ; injectable (mock, WebSocket plus tard).
 */
export type DuoSessionClient = {
  createRoom: (
    constraints: Constraints,
    opts?: {
      type?: 'DUO' | 'GROUPE';
      partySize?: number;
      context?: ContextHint | null;
    },
  ) => Promise<{ role: 'host'; room: DuoPublicSnapshot; deviceKey?: string }>;
  getRoom: (code: string, role: DuoRole) => Promise<DuoPublicSnapshot>;
  joinRoom: (
    code: string,
  ) => Promise<{ role: 'guest'; room: DuoPublicSnapshot; deviceKey?: string }>;
  setReady: (code: string, role: DuoRole) => Promise<DuoPublicSnapshot>;
  submitVotes: (
    code: string,
    role: DuoRole,
    likedIds: string[],
  ) => Promise<DuoPublicSnapshot>;
  closeRoom: (code: string) => Promise<void>;
};

export const httpDuoSessionClient: DuoSessionClient = {
  createRoom: httpDuo.createRoom,
  getRoom: httpDuo.getRoom,
  joinRoom: httpDuo.joinRoom,
  setReady: httpDuo.setReady,
  submitVotes: httpDuo.submitVotes,
  closeRoom: httpDuo.closeRoom,
};

let client: DuoSessionClient = httpDuoSessionClient;

export function setDuoSessionClient(next: DuoSessionClient) {
  client = next;
}

export function getDuoSessionClient() {
  return client;
}
