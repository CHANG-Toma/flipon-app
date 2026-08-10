import { getKeyValueStore } from '@/lib/storage';

const DEVICE_KEY = 'flipon:device-key:v1';

function makeDeviceKey() {
  const rand = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `dev-${rand}`.slice(0, 48);
}

/** Clé appareil pour lier host/guest (header x-flipon-device-key). */
export async function getDeviceKey() {
  const storage = getKeyValueStore();
  try {
    const existing = await storage.getItem(DEVICE_KEY);
    if (existing) return existing;
    const next = makeDeviceKey();
    await storage.setItem(DEVICE_KEY, next);
    return next;
  } catch {
    return makeDeviceKey();
  }
}
