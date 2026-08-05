import type { Constraints, Plan } from '@/data/plans';

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

const API_BASE =
  (typeof process !== 'undefined' &&
    (process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_WEB_URL)?.replace(/\/$/, '')) ||
  'https://flipon.vercel.app';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE.startsWith('https://') && !API_BASE.startsWith('http://localhost')) {
    throw new NetworkError('URL API non sécurisée.');
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
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

export async function createRoom(constraints: Constraints) {
  return request<{ role: 'host'; room: DuoPublicSnapshot }>('/api/duo', {
    method: 'POST',
    body: JSON.stringify({ constraints }),
  });
}

export async function getRoom(code: string, role: DuoRole) {
  const id = encodeURIComponent(code.trim().toUpperCase());
  return request<DuoPublicSnapshot>(`/api/duo/${id}?role=${role}`, { method: 'GET' });
}

export async function joinRoom(code: string) {
  const id = encodeURIComponent(code.trim().toUpperCase());
  return request<{ role: 'guest'; room: DuoPublicSnapshot }>(`/api/duo/${id}/join`, {
    method: 'POST',
  });
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
