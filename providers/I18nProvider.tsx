import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { detectDeviceLocale } from '@/lib/i18n/detect';
import { resolveLocale } from '@/lib/i18n/resolve';
import { setRuntimeLocale } from '@/lib/i18n/runtime';
import { loadLanguagePreference, saveLanguagePreference } from '@/lib/i18n/storage';
import { translate, type TranslationKey } from '@/lib/i18n/translate';
import type { AppLocale, LanguagePreference, TranslationParams } from '@/lib/i18n/types';

type I18nContextValue = {
  ready: boolean;
  locale: AppLocale;
  preference: LanguagePreference;
  deviceLocale: AppLocale;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  setPreference: (pref: LanguagePreference) => Promise<void>;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [preference, setPreferenceState] = useState<LanguagePreference>('system');
  const deviceLocale = useMemo(() => detectDeviceLocale(), []);

  useEffect(() => {
    let cancelled = false;
    void loadLanguagePreference().then((pref) => {
      if (cancelled) return;
      setPreferenceState(pref);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const locale = resolveLocale(preference);

  useEffect(() => {
    setRuntimeLocale(locale);
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(locale, key, params),
    [locale],
  );

  const setPreference = useCallback(async (pref: LanguagePreference) => {
    setPreferenceState(pref);
    await saveLanguagePreference(pref);
  }, []);

  const value = useMemo(
    () => ({ ready, locale, preference, deviceLocale, t, setPreference }),
    [ready, locale, preference, deviceLocale, t, setPreference],
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
