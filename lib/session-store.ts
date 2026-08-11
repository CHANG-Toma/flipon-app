/**
 * Session FlipOn — barrel public (compat `@/lib/session-store`).
 *
 * Modules :
 * - store : mutations / hydrate / vote
 * - selectors / home-cta : lecture UI
 * - invite / party / persist / snapshot
 * - history-port : DIP vers l’historique
 */
export { ApiError, NetworkError } from '@/lib/http';
export type { SessionRole, SessionState, SessionStatus, SessionType } from '@/lib/session/types';
export { defaultPartySize, clampPartySize } from '@/lib/session/party';
export { getInviteLink, getAppInviteLink } from '@/lib/session/invite';
export { isActiveSession, isLobbyReady } from '@/lib/session/selectors';
export { getHomeCta } from '@/lib/session/home-cta';
export { setSessionHistoryWriter } from '@/lib/session/history-port';
export type { SessionHistoryRecord, SessionHistoryWriter } from '@/lib/session/history-port';
export { setDuoSessionClient, httpDuoSessionClient } from '@/lib/session/duo-client';
export type { DuoSessionClient } from '@/lib/session/duo-client';
export {
  canStartVoting,
  clearActiveSession,
  createSession,
  createSessionOnServer,
  getSession,
  hydrateSession,
  joinByCode,
  prepareLocalDraft,
  refreshSession,
  setSessionScope,
  startVoting,
  subscribeSession,
  updateConstraints,
  voteCurrent,
} from '@/lib/session/store';
