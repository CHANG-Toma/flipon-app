import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_KEY = 'flipon:device-key:v1';

function makeDeviceKey() {
  const rand = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `dev-${rand}`.slice(0, 48);
}

export async function getDeviceKey() {
  try {
    const existing = await AsyncStorage.getItem(DEVICE_KEY);
    if (existing) return existing;
    const next = makeDeviceKey();
    await AsyncStorage.setItem(DEVICE_KEY, next);
    return next;
  } catch {
    return makeDeviceKey();
  }
}
