import { normalizeConstraints, type Constraints } from '@/data/plans';
import type { SessionState } from '@/lib/session/types';

export const DEFAULT_CONSTRAINTS: Constraints = normalizeConstraints({
  duration: '120',
  budget: '20',
  energy: 'basse',
  place: 'peu-importe',
  vibe: 'potes',
});

export function emptyState(partial?: Partial<SessionState>): SessionState {
  return {
    code: '',
    type: 'Duo',
    role: 'host',
    status: 'idle',
    partySize: 2,
    joinedCount: 0,
    constraints: DEFAULT_CONSTRAINTS,
    deck: [],
    index: 0,
    myLikes: [],
    hostLikes: null,
    guestLikes: null,
    result: null,
    bothReady: false,
    hostReady: false,
    guestReady: false,
    youVoted: false,
    partnerVoted: false,
    ...partial,
  };
}
