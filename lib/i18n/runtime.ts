import { detectDeviceLocale } from '@/lib/i18n/detect';
import { translate, type TranslationKey } from '@/lib/i18n/translate';
import type { AppLocale, TranslationParams } from '@/lib/i18n/types';

/** Locale courante pour le code hors React (store, validation, HTTP). */
let runtimeLocale: AppLocale = detectDeviceLocale();

export function setRuntimeLocale(locale: AppLocale) {
  runtimeLocale = locale;
}

export function getRuntimeLocale() {
  return runtimeLocale;
}

export function tr(key: TranslationKey, params?: TranslationParams): string {
  return translate(runtimeLocale, key, params);
}
