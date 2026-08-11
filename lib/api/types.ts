import type { Constraints, Plan } from '@/data/plans';

export type DuoRole = 'host' | 'guest';

export type DeckSource = 'ai' | 'pois' | 'catalogue';

export type DuoPublicSnapshot = {
  id: string;
  constraints: Constraints;
  deck: Plan[];
  deckSource?: DeckSource;
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

export type MeSnapshot = {
  id: string;
  clerkId: string;
  email: string | null;
  displayName: string | null;
};
