import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Port stockage clé/valeur (DIP).
 * Implémentation prod = AsyncStorage ; injectable pour tests.
 */
export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

// Permet de récupérer les données stockées dans le stockage asynchrone
export const asyncStorageStore: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

let store: KeyValueStore = asyncStorageStore;

// Permet de définir le stockage asynchrone
export function setKeyValueStore(next: KeyValueStore) {
  store = next;
}

export function getKeyValueStore() {
  return store;
}
