export type AppLocale = 'fr' | 'en';

/** Préférence utilisateur : suivre le téléphone, ou forcer une langue. */
export type LanguagePreference = 'system' | AppLocale;

export type TranslationParams = Record<string, string | number>;
