import { getLocales } from 'expo-localization';

import type { AppLocale } from '@/lib/i18n/types';

/** Langue téléphone : français si languageCode = fr, sinon anglais. */
export function detectDeviceLocale(): AppLocale {
  const code = getLocales()[0]?.languageCode?.toLowerCase() ?? 'en';
  return code === 'fr' ? 'fr' : 'en';
}
