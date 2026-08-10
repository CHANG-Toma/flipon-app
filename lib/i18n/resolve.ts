import type { AppLocale, LanguagePreference } from '@/lib/i18n/types';
import { detectDeviceLocale } from '@/lib/i18n/detect';

export function resolveLocale(preference: LanguagePreference): AppLocale {
  if (preference === 'system') return detectDeviceLocale();
  return preference;
}
