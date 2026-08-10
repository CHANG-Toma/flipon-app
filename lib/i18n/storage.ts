import { getKeyValueStore } from '@/lib/storage';
import type { LanguagePreference } from '@/lib/i18n/types';

const KEY = 'flipon:language-preference:v1';

function isPreference(value: string): value is LanguagePreference {
  return value === 'system' || value === 'fr' || value === 'en';
}

export async function loadLanguagePreference(): Promise<LanguagePreference> {
  try {
    const raw = await getKeyValueStore().getItem(KEY);
    if (raw && isPreference(raw)) return raw;
  } catch {
    /* ignore */
  }
  return 'system';
}

export async function saveLanguagePreference(pref: LanguagePreference): Promise<void> {
  await getKeyValueStore().setItem(KEY, pref);
}
