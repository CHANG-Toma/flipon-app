import { getDeviceKey } from '@/lib/device';
import { tr } from '@/lib/i18n';

/**
 * Transport HTTP FlipOn (app → API Next.js)
 * ----------------------------------------
 * Base URL : EXPO_PUBLIC_API_URL || EXPO_PUBLIC_WEB_URL.
 * Auth : Bearer via `setAuthTokenGetter` (AuthBridge).
 * Device : header x-flipon-device-key.
 */
export class NetworkError extends Error {
  constructor(message?: string) {
    super(message ?? tr('errors.network'));
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

const API_BASE =
  (typeof process !== 'undefined' &&
    (process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_WEB_URL)?.replace(/\/$/, '')) ||
  'https://flipon.vercel.app';

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

/**
 * Allowlist d’URL API.
 * Prod : HTTPS only.
 * Dev : localhost / 10.0.2.2 (AVD) / LAN privée pour Expo Go.
 */
function isAllowedApiBase(url: string) {
  if (url.startsWith('https://')) return true;
  if (!isDev) return false;
  return (
    url.startsWith('http://localhost') ||
    url.startsWith('http://127.0.0.1') ||
    url.startsWith('http://10.0.2.2') ||
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(url) ||
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(url)
  );
}

let authTokenGetter: (() => Promise<string | null>) | null = null;

/** Enregistré depuis AuthBridge (Clerk getToken). */
export function setAuthTokenGetter(getter: (() => Promise<string | null>) | null) {
  authTokenGetter = getter;
}

export function getApiBase() {
  return API_BASE;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isAllowedApiBase(API_BASE)) {
    throw new NetworkError(tr('errors.apiInsecure'));
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
          ? tr('errors.codeOrSessionExpired')
          : tr('errors.apiUnreachable');
    throw new ApiError(message, res.status);
  }

  return body as T;
}
