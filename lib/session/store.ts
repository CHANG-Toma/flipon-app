import { normalizeConstraints, type Constraints } from '@/data/plans';
import { ApiError } from '@/lib/http';
import { tr } from '@/lib/i18n';
import { getDuoSessionClient } from '@/lib/session/duo-client';
import { DEFAULT_CONSTRAINTS, emptyState } from '@/lib/session/empty-state';
import { recordSessionHistory } from '@/lib/session/history-port';
import { clampPartySize, defaultPartySize } from '@/lib/session/party';
import { loadPersistedSession, persistSession, setSessionPersistScope } from '@/lib/session/persist';
import { applySnapshot } from '@/lib/session/snapshot';
import { isValidSessionCode, normalizeSessionCode } from '@/lib/session-code';
import type { SessionState, SessionType } from '@/lib/session/types';

let state: SessionState = emptyState();
let hydrated = false;
let historyRecordedForCode: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

async function persistActive() {
  await persistSession(state);
}

async function maybeRecordHistory() {
  if (!state.code || state.status !== 'done') return;
  if (historyRecordedForCode === state.code) return;
  historyRecordedForCode = state.code;
  await recordSessionHistory({
    id: state.code,
    title: state.result?.title ?? 'Sans match',
    type: state.type,
    durationMin: state.result?.durationMin ?? 0,
    status: state.result ? 'Validée' : 'Sans match',
    planId: state.result?.id,
  });
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

export function canStartVoting() {
  // Snapshot API actuel : guestJoined (1 ou 2). On ne bloque pas les groupes sur partySize tant que le serveur ne remonte pas le compte réel.
  return state.joinedCount >= 2;
}

export async function hydrateSession() {
  if (hydrated) return state;
  hydrated = true;

  try {
    const saved = await loadPersistedSession();
    if (!saved?.code || !saved.role) return state;

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
      const duo = getDuoSessionClient();
      const snapshot = await duo.getRoom(saved.code, saved.role);
      state = applySnapshot(state, snapshot, saved.role);
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
  const { room } = await getDuoSessionClient().createRoom(normalized, {
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
export function prepareLocalDraft(
  type: SessionType,
  constraints: Partial<Constraints>,
  partySize?: number,
) {
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

export async function refreshSession() {
  if (!state.code) return state;
  const duo = getDuoSessionClient();
  const snapshot = await duo.getRoom(state.code, state.role);
  const prevStatus = state.status;
  state = applySnapshot(state, snapshot, state.role);

  if (snapshot.bothVoted) {
    state = { ...state, status: 'done', result: snapshot.match, index: state.deck.length };
    await maybeRecordHistory();
  } else if (prevStatus === 'voting' || prevStatus === 'waiting_partner') {
    state = {
      ...state,
      status: snapshot.youVoted
        ? 'waiting_partner'
        : prevStatus === 'waiting_partner'
          ? 'waiting_partner'
          : 'voting',
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
    throw new Error(tr('errors.createFirst'));
  }
  if (!canStartVoting()) {
    throw new Error(
      state.type === 'Groupe'
        ? tr('errors.waitToJoinCount', { joined: state.joinedCount, size: state.partySize })
        : tr('errors.waitToJoin'),
    );
  }

  const snapshot = await getDuoSessionClient().setReady(state.code, state.role);
  state = applySnapshot(state, snapshot, state.role);
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
    throw new ApiError(tr('errors.invalidOrExpiredCode'), 400);
  }

  const duo = getDuoSessionClient();

  // Même appareil : l’hôte marque un invité en re-joignant son code (preview).
  if (state.role === 'host' && state.code === normalized && state.status === 'lobby') {
    const snapshot = await duo.joinRoom(normalized);
    state = applySnapshot(state, snapshot.room, 'host');
    state = { ...state, role: 'host', status: 'lobby' };
    await persistActive();
    emit();
    return state;
  }

  const { room } = await duo.joinRoom(normalized);
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

  const duo = getDuoSessionClient();

  try {
    if (!state.bothReady) {
      const readySnap = await duo.setReady(state.code, state.role);
      state = applySnapshot(state, readySnap, state.role);
    }
  } catch {
    /* continue to submit */
  }

  const snapshot = await duo.submitVotes(state.code, state.role, myLikes);
  state = applySnapshot(state, snapshot, state.role);

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
  try {
    if (code) await getDuoSessionClient().closeRoom(code);
  } catch {
    /* Purge locale même si la room est déjà fermée / offline. */
  }
  state = emptyState({ type: state.type, constraints: state.constraints });
  historyRecordedForCode = null;
  await persistActive();
  emit();
  return state;
}

/** Aligne la persistance session locale sur le compte courant. */
export function setSessionScope(scope: string | null | undefined) {
  setSessionPersistScope(scope);
  hydrated = false;
  state = emptyState();
  historyRecordedForCode = null;
  emit();
}

/** @deprecated use createSessionOnServer */
export function createSession(
  type: SessionType,
  constraints?: Partial<Constraints>,
  partySize?: number,
) {
  return prepareLocalDraft(type, constraints ?? {}, partySize);
}
