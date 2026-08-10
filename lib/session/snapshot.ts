import type { DuoPublicSnapshot } from '@/lib/api/types';
import type { SessionRole, SessionState, SessionStatus } from '@/lib/session/types';

/** Applique un snapshot serveur sur l’état local (sans emit/persist). */
export function applySnapshot(
  state: SessionState,
  snapshot: DuoPublicSnapshot,
  role: SessionRole,
): SessionState {
  const partySize = state.partySize || 2;
  const joinedCount = snapshot.guestJoined ? Math.min(2, partySize) : 1;

  let status: SessionStatus = state.status;
  if (snapshot.bothVoted) {
    status = 'done';
  } else if (state.status === 'voting' || state.status === 'waiting_partner') {
    status = snapshot.youVoted && !snapshot.bothVoted ? 'waiting_partner' : 'voting';
  } else {
    status = 'lobby';
  }

  return {
    ...state,
    code: snapshot.id,
    role,
    constraints: snapshot.constraints,
    deck: snapshot.deck.length ? snapshot.deck : state.deck,
    joinedCount,
    partySize,
    bothReady: snapshot.bothReady,
    hostReady: snapshot.hostReady,
    guestReady: snapshot.guestReady,
    youVoted: snapshot.youVoted,
    partnerVoted: snapshot.partnerVoted,
    result: snapshot.bothVoted ? snapshot.match : state.result,
    status,
    hostLikes: role === 'host' ? state.myLikes : state.hostLikes,
    guestLikes: role === 'guest' ? state.myLikes : state.guestLikes,
  };
}
