export type { AppLocale, LanguagePreference, TranslationParams } from '@/lib/i18n/types';
export type { TranslationKey } from '@/lib/i18n/translate';
export { detectDeviceLocale } from '@/lib/i18n/detect';
export { resolveLocale } from '@/lib/i18n/resolve';
export { translate } from '@/lib/i18n/translate';
export { tr, setRuntimeLocale, getRuntimeLocale } from '@/lib/i18n/runtime';
export { I18nProvider, useI18n } from '@/providers/I18nProvider';
