import { request } from '@/lib/http';
import type { MeSnapshot } from '@/lib/api/types';

export async function syncMe() {
  return request<MeSnapshot>('/api/me', { method: 'POST' });
}
