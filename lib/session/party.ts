import type { SessionType } from '@/lib/session/types';

export function defaultPartySize(type: SessionType) {
  return type === 'Duo' ? 2 : 4;
}

export function clampPartySize(type: SessionType, size: number) {
  if (type === 'Duo') return 2;
  return Math.min(8, Math.max(3, Math.round(size)));
}
