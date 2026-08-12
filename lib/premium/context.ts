/**
 * Contexte Premium — types + météo Open-Meteo (pas de clé API).
 * GPS jamais persisté ici : uniquement ville / météo en cache mémoire.
 */
import type { ContextHint } from '@/data/plans';

export type WeatherSnapshot = {
  temperatureC: number;
  weatherCode: number;
  windKmh: number;
};

export type PlaceSnapshot = {
  /** Ville ou quartier — jamais lat/lng stockés durablement */
  label: string;
  /** true si le libellé est un fallback i18n (re-traduire à l'affichage) */
  isApproximate?: boolean;
};

export type PremiumContextSnapshot = {
  place: PlaceSnapshot;
  weather: WeatherSnapshot;
  /** Instantané local au moment du fetch */
  fetchedAt: number;
  /** Locale au moment du fetch — invalide le cache si changement */
  locale: string;
};

const CACHE_TTL_MS = 12 * 60 * 1000;

let memoryCache: PremiumContextSnapshot | null = null;

export function getCachedPremiumContext(locale?: string): PremiumContextSnapshot | null {
  if (!memoryCache) return null;
  if (Date.now() - memoryCache.fetchedAt > CACHE_TTL_MS) {
    memoryCache = null;
    return null;
  }
  if (locale && memoryCache.locale !== locale) {
    return null;
  }
  return memoryCache;
}

export function setCachedPremiumContext(snapshot: PremiumContextSnapshot) {
  memoryCache = snapshot;
}

/** Codes WMO Open-Meteo → clé i18n `premiumContext.weather.*` */
export type WeatherLabelKey =
  | 'clear'
  | 'mainlyClear'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'showers'
  | 'thunderstorm'
  | 'unknown';

export function weatherCodeToLabelKey(code: number): WeatherLabelKey {
  if (code === 0) return 'clear';
  if (code === 1 || code === 2 || code === 3) return 'mainlyClear';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code >= 61 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'showers';
  if (code >= 85 && code <= 86) return 'snow';
  if (code >= 95 && code <= 99) return 'thunderstorm';
  return 'unknown';
}

export function momentOfDayKey(date = new Date()): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 22) return 'evening';
  return 'night';
}

export function formatLocalTime(date = new Date(), locale: string): string {
  return date.toLocaleTimeString(locale.startsWith('fr') ? 'fr-FR' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Snapshot mémoire → hint API (sans GPS). */
export function snapshotToContextHint(
  snapshot: PremiumContextSnapshot,
): ContextHint {
  return {
    cityLabel: snapshot.place.isApproximate ? undefined : snapshot.place.label,
    weather: weatherCodeToLabelKey(snapshot.weather.weatherCode),
    moment: momentOfDayKey(new Date()),
    temperatureC: snapshot.weather.temperatureC,
  };
}

type OpenMeteoCurrentResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
};

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherSnapshot> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error('weather_fetch_failed');
  }
  const data = (await res.json()) as OpenMeteoCurrentResponse;
  const current = data.current;
  if (
    typeof current?.temperature_2m !== 'number' ||
    typeof current?.weather_code !== 'number'
  ) {
    throw new Error('weather_invalid');
  }
  return {
    temperatureC: Math.round(current.temperature_2m),
    weatherCode: current.weather_code,
    windKmh: Math.round(current.wind_speed_10m ?? 0),
  };
}
