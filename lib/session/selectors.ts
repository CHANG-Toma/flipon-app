import type { SessionState } from '@/lib/session/types';

export function isActiveSession(session: SessionState) {
  return (
    Boolean(session.code) &&
    (session.status === 'lobby' ||
      session.status === 'voting' ||
      session.status === 'waiting_partner' ||
      session.status === 'done')
  );
}

export function isLobbyReady(session: SessionState) {
  if (session.joinedCount < 2) return false;
  if (session.type !== 'Groupe') return Boolean(session.guestReady);
  return true;
}
