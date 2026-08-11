/**
 * Hook contexte Premium — lieu + météo (cache mémoire TTL).
 */
import { useCallback, useEffect, useState } from 'react';

import {
  fetchCurrentWeather,
  getCachedPremiumContext,
  setCachedPremiumContext,
  type PremiumContextSnapshot,
} from '@/lib/premium/context';
import {
  getForegroundPermissionState,
  openAppSettings,
  requestForegroundLocationPermission,
  resolveCurrentPlace,
  type LocationPermissionState,
} from '@/lib/premium/location';
import { useI18n } from '@/lib/i18n';

export type PremiumContextStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'denied'
  | 'error';

export type UsePremiumContextResult = {
  status: PremiumContextStatus;
  permission: LocationPermissionState;
  snapshot: PremiumContextSnapshot | null;
  errorMessage: string | null;
  /** Demande permission (si besoin) puis charge lieu + météo */
  activate: () => Promise<void>;
  refresh: () => Promise<void>;
  openSettings: () => Promise<void>;
};

export function usePremiumContext(enabled: boolean): UsePremiumContextResult {
  const { t } = useI18n();
  const [status, setStatus] = useState<PremiumContextStatus>('idle');
  const [permission, setPermission] = useState<LocationPermissionState>('undetermined');
  const [snapshot, setSnapshot] = useState<PremiumContextSnapshot | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      setSnapshot(null);
      return;
    }
    const cached = getCachedPremiumContext();
    if (cached) {
      setSnapshot(cached);
      setStatus('ready');
    }
    void (async () => {
      const perm = await getForegroundPermissionState();
      setPermission(perm);
      if (perm === 'granted' && !cached) {
        // Déjà autorisé : charger sans re-demander (pas de prompt système).
        setStatus('loading');
        try {
          const place = await resolveCurrentPlace(t('premiumContext.approxPlace'));
          const weather = await fetchCurrentWeather(place.latitude, place.longitude);
          const next = {
            place: { label: place.label },
            weather,
            fetchedAt: Date.now(),
          };
          setCachedPremiumContext(next);
          setSnapshot(next);
          setStatus('ready');
        } catch {
          setStatus('idle');
        }
      }
    })();
  }, [enabled, t]);

  const load = useCallback(async () => {
    if (!enabled) return;
    setStatus('loading');
    setErrorMessage(null);
    try {
      const place = await resolveCurrentPlace(t('premiumContext.approxPlace'));
      const weather = await fetchCurrentWeather(place.latitude, place.longitude);
      const next: PremiumContextSnapshot = {
        place: { label: place.label },
        weather,
        fetchedAt: Date.now(),
      };
      setCachedPremiumContext(next);
      setSnapshot(next);
      setStatus('ready');
      setPermission('granted');
    } catch (e) {
      const code = e instanceof Error ? e.message : 'unknown';
      if (code === 'location_services_disabled') {
        setErrorMessage(t('premiumContext.errorServicesOff'));
      } else if (code.startsWith('weather')) {
        setErrorMessage(t('premiumContext.errorWeather'));
      } else {
        setErrorMessage(t('premiumContext.errorGeneric'));
      }
      setStatus('error');
    }
  }, [enabled, t]);

  const activate = useCallback(async () => {
    if (!enabled) return;
    setStatus('loading');
    setErrorMessage(null);
    const nextPerm = await requestForegroundLocationPermission();
    setPermission(nextPerm);
    if (nextPerm !== 'granted') {
      setStatus('denied');
      setErrorMessage(t('premiumContext.deniedText'));
      return;
    }
    await load();
  }, [enabled, load, t]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const perm = await getForegroundPermissionState();
    setPermission(perm);
    if (perm !== 'granted') {
      setStatus('denied');
      setErrorMessage(t('premiumContext.deniedText'));
      return;
    }
    await load();
  }, [enabled, load, t]);

  return {
    status,
    permission,
    snapshot,
    errorMessage,
    activate,
    refresh,
    openSettings: openAppSettings,
  };
}
