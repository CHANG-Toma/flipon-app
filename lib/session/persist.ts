import type { SessionRole, SessionState } from '@/lib/session/types';
import { getKeyValueStore } from '@/lib/storage';

export const PERSIST_KEY = 'flipon:active-session:v1';

export type PersistedSession = {
  code: string;
  role: SessionRole;
  type: SessionState['type'];
  partySize: number;
  status: SessionState['status'];
  index: number;
  myLikes: string[];
  result: SessionState['result'];
  constraints: SessionState['constraints'];
  deck: SessionState['deck'];
};

export async function clearPersistedSession() {
  try {
    await getKeyValueStore().removeItem(PERSIST_KEY);
  } catch {
    /* ignore */
  }
}

export async function persistSession(state: SessionState) {
  try {
    if (!state.code || state.status === 'idle') {
      await clearPersistedSession();
      return;
    }
    const payload: PersistedSession = {
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
    };
    await getKeyValueStore().setItem(PERSIST_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export async function loadPersistedSession(): Promise<Partial<SessionState> & {
  code?: string;
  role?: SessionRole;
} | null> {
  try {
    const raw = await getKeyValueStore().getItem(PERSIST_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<SessionState> & { code?: string; role?: SessionRole };
  } catch {
    return null;
  }
}
