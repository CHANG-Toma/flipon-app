/**
 * Client API FlipOn — barrel public.
 * Transport : `lib/http.ts` · Endpoints : `lib/api/*`.
 */
export { ApiError, NetworkError, getApiBase, request, setAuthTokenGetter } from '@/lib/http';
export type { DuoPublicSnapshot, DuoRole, HistoryApiItem, MeSnapshot } from '@/lib/api/types';
export {
  closeRoom,
  createRoom,
  getRoom,
  joinRoom,
  setReady,
  submitVotes,
} from '@/lib/api/duo';
export { syncMe } from '@/lib/api/me';
export { fetchRemoteHistory } from '@/lib/api/history';
