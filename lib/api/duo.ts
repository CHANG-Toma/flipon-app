import type { Constraints, ContextHint } from '@/data/plans';
import { request } from '@/lib/http';
import type { DuoPublicSnapshot, DuoRole } from '@/lib/api/types';

// Permet de créer une session de duo
export async function createRoom(
  constraints: Constraints,
  opts?: {
    type?: 'DUO' | 'GROUPE';
    partySize?: number;
    /** Ville + météo + moment — jamais de GPS */
    context?: ContextHint | null;
  },
) {
  return request<{ role: 'host'; room: DuoPublicSnapshot; deviceKey?: string }>('/api/duo', {
    method: 'POST',
    body: JSON.stringify({
      constraints,
      context: opts?.context ?? undefined,
      type: opts?.type,
      partySize: opts?.partySize,
    }),
  });
}

// Permet de récupérer la session de duo en fonction du code et du rôle
export async function getRoom(code: string, role: DuoRole) {
  const id = encodeURIComponent(code.trim().toUpperCase());
  return request<DuoPublicSnapshot>(`/api/duo/${id}?role=${role}`, { method: 'GET' });
}

// Permet de rejoindre une session de duo en tant que guest
export async function joinRoom(code: string) {
  const id = encodeURIComponent(code.trim().toUpperCase());
  return request<{ role: 'guest'; room: DuoPublicSnapshot; deviceKey?: string }>(
    `/api/duo/${id}/join`,
    { method: 'POST' },
  );
}

// Permet de marquer un participant comme prêt
export async function setReady(code: string, role: DuoRole) {
  const id = encodeURIComponent(code.trim().toUpperCase());
  return request<DuoPublicSnapshot>(`/api/duo/${id}/ready`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

// Permet de soumettre les votes d'un participant
export async function submitVotes(code: string, role: DuoRole, likedIds: string[]) {
  const id = encodeURIComponent(code.trim().toUpperCase());
  return request<DuoPublicSnapshot>(`/api/duo/${id}/votes`, {
    method: 'POST',
    body: JSON.stringify({ role, likedIds }),
  });
}

// Permet de fermer une session de duo en cas de désaccord
export async function closeRoom(code: string) {
  const id = encodeURIComponent(code.trim().toUpperCase());
  try {
    await request<{ ok?: boolean }>(`/api/duo/${id}/close`, { method: 'POST' });
  } catch {
    /* best-effort */
  }
}
