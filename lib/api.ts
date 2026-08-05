import type { Constraints, Plan } from '@/data/plans';
import { getDeviceKey } from '@/lib/device';

export class NetworkError extends Error {
  constructor(message = 'Connexion impossible. Réessaie dans un instant.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type DuoRole = 'host' | 'guest';

export type DuoPublicSnapshot = {
  id: string;
  constraints: Constraints;
  deck: Plan[];
  guestJoined: boolean;
  hostReady: boolean;
  guestReady: boolean;
  bothReady: boolean;
  youVoted: boolean;
  partnerVoted: boolean;
  bothVoted: boolean;
  match: Plan | null;
};

export type HistoryApiItem = {
  id: string;
  title: string;
  type: 'Duo' | 'Groupe';
  durationMin: number;
  status: 'Validée' | 'Sans match' | 'Expirée';
  createdAt: number;
  planId?: string;
};

const API_BASE =
  (typeof process !== 'undefined' &&
    (process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_WEB_URL)?.replace(/\/$/, '')) ||
  'https://flipon.vercel.app';

let authTokenGetter: (() => Promise<string | null>) | null = null;

/** Enregistré depuis le layout Clerk pour envoyer le JWT. */
export function setAuthTokenGetter(getter: (() => Promise<string | null>) | null) {
  authTokenGetter = getter;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE.startsWith('https://') && !API_BASE.startsWith('http://localhost')) {
    throw new NetworkError('URL API non sécurisée.');
  }

  const deviceKey = await getDeviceKey();
  const token = authTokenGetter ? await authTokenGetter() : null;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-flipon-device-key': deviceKey,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new NetworkError();
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof (body as { error: unknown }).error === 'string'
        ? (body as { error: string }).error
        : res.status === 404
          ? 'Code invalide ou session expirée.'
          : 'Impossible de contacter FlipOn.';
    throw new ApiError(message, res.status);
  }

  return body as T;
}

export function getApiBase() {
  return API_BASE;
}

export async function createRoom(
  constraints: Constraints,
  opts?: { type?: 'DUO' | 'GROUPE'; partySize?: number },
) {
  return request<{ role: 'host'; room: DuoPublicSnapshot; deviceKey?: string }>('/api/duo', {
    method: 'POST',
    body: JSON.stringify({
      constraints,
      type: opts?.type,
      partySize: opts?.partySize,
    }),
  });
}

export async function getRoom(code: string, role: DuoRole) {
  const id = encodeURIComponent(code.trim().toUpperCase());
  return request<DuoPublicSnapshot>(`/api/duo/${id}?role=${role}`, { method: 'GET' });
}

export async function joinRoom(code: string) {
  const id = encodeURIComponent(code.trim().toUpperCase());
  return request<{ role: 'guest'; room: DuoPublicSnapshot; deviceKey?: string }>(
    `/api/duo/${id}/join`,
    { method: 'POST' },
  );
}

export async function setReady(code: string, role: DuoRole) {
  const id = encodeURIComponent(code.trim().toUpperCase());
  return request<DuoPublicSnapshot>(`/api/duo/${id}/ready`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export async function submitVotes(code: string, role: DuoRole, likedIds: string[]) {
  const id = encodeURIComponent(code.trim().toUpperCase());
  return request<DuoPublicSnapshot>(`/api/duo/${id}/votes`, {
    method: 'POST',
    body: JSON.stringify({ role, likedIds }),
  });
}

export async function closeRoom(code: string) {
  const id = encodeURIComponent(code.trim().toUpperCase());
  try {
    await request<{ ok?: boolean }>(`/api/duo/${id}/close`, { method: 'POST' });
  } catch {
    /* best-effort */
  }
}

export async function syncMe() {
  return request<{ id: string; clerkId: string; email: string | null; displayName: string | null }>(
    '/api/me',
    { method: 'POST' },
  );
}

export async function fetchRemoteHistory() {
  return request<{ items: HistoryApiItem[] }>('/api/history', { method: 'GET' });
}
