import en from '@/lib/i18n/locales/en';
import fr, { type MessageTree } from '@/lib/i18n/locales/fr';
import type { AppLocale, TranslationParams } from '@/lib/i18n/types';

const catalogs: Record<AppLocale, MessageTree> = { fr, en };

type Leaves<T, P extends string = ''> = T extends string
  ? P
  : {
      [K in keyof T & string]: Leaves<T[K], P extends '' ? K : `${P}.${K}`>;
    }[keyof T & string];

export type TranslationKey = Leaves<MessageTree>;

function lookup(tree: MessageTree, key: string): string | undefined {
  const parts = key.split('.');
  let cur: unknown = tree;
  for (const part of parts) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{{${name}}}`,
  );
}

export function translate(
  locale: AppLocale,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  const primary = lookup(catalogs[locale], key);
  const fallback = locale === 'fr' ? undefined : lookup(catalogs.fr, key);
  return interpolate(primary ?? fallback ?? key, params);
}
