import type { Constraints, Plan } from '@/data/plans';
import type { DuoRole } from '@/lib/api/types';

export type SessionType = 'Duo' | 'Groupe';
export type SessionRole = DuoRole;
export type SessionStatus =
  | 'idle'
  | 'lobby'
  | 'voting'
  | 'waiting_partner'
  | 'done';

export type SessionState = {
  code: string;
  type: SessionType;
  role: SessionRole;
  status: SessionStatus;
  partySize: number;
  joinedCount: number;
  constraints: Constraints;
  deck: Plan[];
  index: number;
  myLikes: string[];
  hostLikes: string[] | null;
  guestLikes: string[] | null;
  result: Plan | null;
  bothReady: boolean;
  hostReady: boolean;
  guestReady: boolean;
  youVoted: boolean;
  partnerVoted: boolean;
};
