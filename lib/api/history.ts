import { request } from '@/lib/http';
import type { HistoryApiItem } from '@/lib/api/types';

export async function fetchRemoteHistory() {
  return request<{ items: HistoryApiItem[] }>('/api/history', { method: 'GET' });
}
