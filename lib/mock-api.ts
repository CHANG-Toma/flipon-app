export { NetworkError, ApiError } from '@/lib/api';

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Petit délai UI (pas un faux backend). */
export async function mockRequest<T>(data: T, options?: { forceError?: boolean; ms?: number }): Promise<T> {
  await delay(options?.ms ?? 200);
  if (options?.forceError) {
    const { NetworkError } = await import('@/lib/api');
    throw new NetworkError();
  }
  return data;
}
