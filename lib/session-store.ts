import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ApiError,
  NetworkError,
  closeRoom,
  createRoom,
  getRoom,
  joinRoom,
  setReady,
  submitVotes,
  type DuoPublicSnapshot,
  type DuoRole,
} from '@/lib/api';
import { isValidSessionCode, normalizeSessionCode } from '@/lib/session-code';
import { addHistoryEntry } from '@/lib/history-store';
import {
  normalizeConstraints,
  type Constraints,
  type Plan,
} from '@/data/plans';

export type SessionType = 'Duo' | 'Groupe';
export type SessionRole = DuoRole;
export type SessionStatus =
  | 'idle'
  | 'lobby'
  | 'voting'
  | 'waiting_partner'
  | 'done';

type SessionState = {
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

const DEFAULT_CONSTRAINTS: Constraints = normalizeConstraints({
  duration: '120',
  budget: '20',
  energy: 'basse',
  place: 'peu-importe',
  vibe: 'potes',
});

const PERSIST_KEY = 'flipon:active-session:v1';

export function defaultPartySize(type: SessionType) {
  return type === 'Duo' ? 2 : 4;
}

export function clampPartySize(type: SessionType, size: number) {
  if (type === 'Duo') return 2;
  return Math.min(8, Math.max(3, Math.round(size)));
}

export { NetworkError, ApiError };

let state: SessionState = emptyState();
let hydrated = false;
let historyRecordedForCode: string | null = null;
const listeners = new Set<() => void>();

function emptyState(partial?: Partial<SessionState>): SessionState {
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

function emit() {
  listeners.forEach((listener) => listener());
}

async function persistActive() {
  try {
    if (!state.code || state.status === 'idle') {
      await AsyncStorage.removeItem(PERSIST_KEY);
      return;
    }
    await AsyncStorage.setItem(
      PERSIST_KEY,
      JSON.stringify({
        code: state.code,
        role: state.role,
        type: state.type,
        partySize: state.partySize,
        status: state.status,
        index: state.index,
        myLikes: state.myLikes,
        result: state.result,
        constraints: state.constraints,
        deck: state.deck,
      }),
    );
  } catch {
    /* ignore */
  }
}

function applySnapshot(snapshot: DuoPublicSnapshot, role: SessionRole) {
  const partySize = state.partySize || 2;
  const joinedCount = snapshot.guestJoined ? 2 : 1;

  let status: SessionStatus = state.status;
  if (snapshot.bothVoted) {
    status = 'done';
  } else if (state.status === 'voting' || state.status === 'waiting_partner') {
    status = snapshot.youVoted && !snapshot.bothVoted ? 'waiting_partner' : 'voting';
  } else {
    status = 'lobby';
  }

  state = {
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

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSession() {
  return state;
}

export function isActiveSession(session: SessionState = state) {
  return (
    Boolean(session.code) &&
    (session.status === 'lobby' ||
      session.status === 'voting' ||
      session.status === 'waiting_partner' ||
      session.status === 'done')
  );
}

export function isLobbyReady(session: SessionState = state) {
  return session.joinedCount >= 2 || session.joinedCount >= session.partySize;
}

export function getHomeCta(session: SessionState = state) {
  if (!isActiveSession(session)) {
    return {
      title: 'Aucune session',
      cta: 'Nouvelle session',
      target: '/session' as const,
      detail: '',
    };
  }

  if (session.status === 'lobby') {
    return {
      title: 'Lobby · invitation',
      cta: 'Retour au lobby',
      target: '/session' as const,
      detail: 'Votes privés · En attente des participants',
    };
  }

  if (session.status === 'waiting_partner') {
    return {
      title: 'En attente du partenaire',
      cta: 'Voir le statut',
      target: '/vote' as const,
      detail: 'Tes votes sont envoyés · match en cours',
    };
  }

  if (session.status === 'done') {
    return {
      title: session.result ? 'Résultat prêt' : 'Pas de match',
      cta: 'Voir le résultat',
      target: '/result' as const,
      detail: session.result ? 'Idée retenue · session terminée' : 'Aucun Oui en commun',
    };
  }

  return {
    title: 'Vote en cours',
    cta: 'Reprendre le vote',
    target: '/vote' as const,
    detail: 'Votes privés · Session active',
  };
}

export async function hydrateSession() {
  if (hydrated) return state;
  hydrated = true;

  try {
    const raw = await AsyncStorage.getItem(PERSIST_KEY);
    if (!raw) return state;
    const saved = JSON.parse(raw) as Partial<SessionState> & { code?: string; role?: SessionRole };
    if (!saved.code || !saved.role) return state;

    state = emptyState({
      code: saved.code,
      role: saved.role,
      type: saved.type === 'Groupe' ? 'Groupe' : 'Duo',
      partySize: saved.partySize ?? 2,
      status: saved.status ?? 'lobby',
      index: saved.index ?? 0,
      myLikes: saved.myLikes ?? [],
      result: saved.result ?? null,
      constraints: saved.constraints ?? DEFAULT_CONSTRAINTS,
      deck: saved.deck ?? [],
      joinedCount: 1,
    });

    try {
      const snapshot = await getRoom(saved.code, saved.role);
      applySnapshot(snapshot, saved.role);
      if (snapshot.bothVoted) {
        state = { ...state, status: 'done', result: snapshot.match };
        await maybeRecordHistory();
      } else if (saved.status === 'voting' || saved.status === 'waiting_partner') {
        state = {
          ...state,
          status: snapshot.youVoted ? 'waiting_partner' : 'voting',
        };
      } else {
        state = { ...state, status: 'lobby' };
      }
    } catch {
      // Keep persisted local snapshot if API unreachable
    }
  } catch {
    /* ignore */
  }

  emit();
  return state;
}

export async function createSessionOnServer(
  type: SessionType,
  constraints: Partial<Constraints>,
  partySize?: number,
) {
  const normalized = normalizeConstraints({ ...DEFAULT_CONSTRAINTS, ...constraints });
  const size = clampPartySize(type, partySize ?? defaultPartySize(type));
  const { room } = await createRoom(normalized, {
    type: type === 'Groupe' ? 'GROUPE' : 'DUO',
    partySize: size,
  });

  historyRecordedForCode = null;
  state = emptyState({
    code: room.id,
    type,
    role: 'host',
    status: 'lobby',
    partySize: size,
    joinedCount: room.guestJoined ? 2 : 1,
    constraints: room.constraints,
    deck: room.deck,
    bothReady: room.bothReady,
  });
  await persistActive();
  emit();
  return state;
}

/** Draft-only local update before server create (étape cadre). */
export function prepareLocalDraft(type: SessionType, constraints: Partial<Constraints>, partySize?: number) {
  const normalized = normalizeConstraints({ ...DEFAULT_CONSTRAINTS, ...constraints });
  const size = clampPartySize(type, partySize ?? defaultPartySize(type));
  state = emptyState({
    type,
    constraints: normalized,
    partySize: size,
    status: 'idle',
  });
  emit();
  return state;
}

export function updateConstraints(constraints: Partial<Constraints>) {
  const normalized = normalizeConstraints({ ...state.constraints, ...constraints });
  state = {
    ...state,
    constraints: normalized,
  };
  emit();
  return state;
}

export function canStartVoting() {
  return state.joinedCount >= 2;
}

export async function refreshSession() {
  if (!state.code) return state;
  const snapshot = await getRoom(state.code, state.role);
  const prevStatus = state.status;
  applySnapshot(snapshot, state.role);

  if (snapshot.bothVoted) {
    state = { ...state, status: 'done', result: snapshot.match, index: state.deck.length };
    await maybeRecordHistory();
  } else if (prevStatus === 'voting' || prevStatus === 'waiting_partner') {
    state = {
      ...state,
      status: snapshot.youVoted ? 'waiting_partner' : prevStatus === 'waiting_partner' ? 'waiting_partner' : 'voting',
    };
  } else {
    state = { ...state, status: 'lobby' };
  }

  await persistActive();
  emit();
  return state;
}

export async function startVoting() {
  if (!state.code) {
    throw new Error('Crée d’abord une session.');
  }
  if (!canStartVoting()) {
    throw new Error(
      state.type === 'Groupe'
        ? `Attends que quelqu’un rejoigne (${state.joinedCount}/${state.partySize}).`
        : 'Attends que quelqu’un rejoigne la session.',
    );
  }

  const snapshot = await setReady(state.code, state.role);
  applySnapshot(snapshot, state.role);
  state = {
    ...state,
    status: 'voting',
    index: 0,
    myLikes: [],
    result: null,
  };
  await persistActive();
  emit();
  return state;
}

export async function joinByCode(code: string) {
  const normalized = normalizeSessionCode(code);
  if (!isValidSessionCode(normalized)) {
    throw new ApiError('Code invalide ou expiré.', 400);
  }

  // Même appareil : l’hôte marque un invité en re-joignant son code (preview).
  if (state.role === 'host' && state.code === normalized && state.status === 'lobby') {
    const snapshot = await joinRoom(normalized);
    applySnapshot(snapshot.room, 'host');
    state = { ...state, role: 'host', status: 'lobby' };
    await persistActive();
    emit();
    return state;
  }

  const { room } = await joinRoom(normalized);
  historyRecordedForCode = null;
  state = emptyState({
    code: room.id,
    type: 'Duo',
    role: 'guest',
    status: 'lobby',
    partySize: 2,
    joinedCount: room.guestJoined ? 2 : 1,
    constraints: room.constraints,
    deck: room.deck,
    bothReady: room.bothReady,
  });
  await persistActive();
  emit();
  return state;
}

async function maybeRecordHistory() {
  if (!state.code || state.status !== 'done') return;
  if (historyRecordedForCode === state.code) return;
  historyRecordedForCode = state.code;
  await addHistoryEntry({
    id: state.code,
    title: state.result?.title ?? 'Sans match',
    type: state.type,
    durationMin: state.result?.durationMin ?? 0,
    status: state.result ? 'Validée' : 'Sans match',
    planId: state.result?.id,
  });
}

/** Oui / Passer : likes locaux, envoi API à la fin du deck. */
export async function voteCurrent(accepted: boolean) {
  const current = state.deck[state.index];
  if (!current) return state;

  const myLikes = accepted ? [...state.myLikes, current.id] : state.myLikes;
  const nextIndex = state.index + 1;
  const done = nextIndex >= state.deck.length;

  state = { ...state, myLikes, index: nextIndex };
  await persistActive();
  emit();

  if (!done) return state;

  // Ensure ready before submit (guest may open vote after host started).
  try {
    if (!state.bothReady) {
      const readySnap = await setReady(state.code, state.role);
      applySnapshot(readySnap, state.role);
    }
  } catch {
    /* continue to submit */
  }

  const snapshot = await submitVotes(state.code, state.role, myLikes);
  applySnapshot(snapshot, state.role);

  if (snapshot.bothVoted) {
    state = {
      ...state,
      status: 'done',
      result: snapshot.match,
      youVoted: true,
      partnerVoted: true,
    };
    await maybeRecordHistory();
  } else {
    state = {
      ...state,
      status: 'waiting_partner',
      youVoted: true,
      partnerVoted: snapshot.partnerVoted,
    };
  }

  await persistActive();
  emit();
  return state;
}

export async function clearActiveSession() {
  const code = state.code;
  if (code) await closeRoom(code);
  state = emptyState({ type: state.type, constraints: state.constraints });
  historyRecordedForCode = null;
  await persistActive();
  emit();
  return state;
}

const WEB_BASE =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_WEB_URL?.replace(/\/$/, '')) ||
  'https://flipon.vercel.app';

export function getInviteLink(code: string) {
  const normalized = code.trim().toUpperCase().replace(/^FLIP-/, '');
  return `${WEB_BASE}/join/${normalized}`;
}

export function getAppInviteLink(code: string) {
  const normalized = code.trim().toUpperCase().replace(/^FLIP-/, '');
  return `fliponapp://join/${normalized}`;
}

/** @deprecated use createSessionOnServer */
export function createSession(
  type: SessionType,
  constraints?: Partial<Constraints>,
  partySize?: number,
) {
  return prepareLocalDraft(type, constraints ?? {}, partySize);
}
