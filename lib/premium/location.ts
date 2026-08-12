/**
 * Localisation Premium — When In Use uniquement (règles stores).
 * Lat/lng restent en mémoire locale de l’appel ; pas d’AsyncStorage.
 */
import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

export type LocationPermissionState = 'granted' | 'denied' | 'undetermined';

export type ResolvedPlace = {
  latitude: number;
  longitude: number;
  label: string;
  isApproximate: boolean;
};

type OpenMeteoReverseResponse = {
  results?: Array<{
    name?: string;
    admin1?: string;
  }>;
};

export async function getForegroundPermissionState(): Promise<LocationPermissionState> {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status === Location.PermissionStatus.GRANTED) return 'granted';
  if (status === Location.PermissionStatus.DENIED) return 'denied';
  return 'undetermined';
}

/**
 * Demande la permission après action utilisateur.
 * Ne pas appeler au mount aveuglément (guidelines App Store / Play).
 */
export async function requestForegroundLocationPermission(): Promise<LocationPermissionState> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.status === Location.PermissionStatus.GRANTED) return 'granted';

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === Location.PermissionStatus.GRANTED) return 'granted';
  return 'denied';
}

export async function openAppSettings() {
  try {
    await Linking.openSettings();
  } catch {
    /* ignore */
  }
}

function buildPlaceLabel(
  places: Location.LocationGeocodedAddress[],
  fallback: string,
): string {
  const first = places[0];
  if (!first) return fallback;
  const city =
    first.city ||
    first.subregion ||
    first.district ||
    first.name ||
    first.region;
  const district = first.district && first.district !== city ? first.district : null;
  if (city && district) return `${district}, ${city}`;
  if (city) return city;
  if (first.region) return first.region;
  return fallback;
}

/** Web — Open-Meteo (expo-location reverse geocode Google deprecated on SDK 49+). */
async function reverseGeocodeWeb(
  latitude: number,
  longitude: number,
  language: string,
  fallback: string,
): Promise<{ label: string; isApproximate: boolean }> {
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/reverse');
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set('language', language.startsWith('fr') ? 'fr' : 'en');
    url.searchParams.set('count', '1');

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return { label: fallback, isApproximate: true };

    const data = (await res.json()) as OpenMeteoReverseResponse;
    const first = data.results?.[0];
    if (!first?.name) return { label: fallback, isApproximate: true };

    const parts = [first.name, first.admin1].filter(Boolean);
    return { label: parts.join(', '), isApproximate: false };
  } catch {
    return { label: fallback, isApproximate: true };
  }
}

async function reverseGeocodeNative(
  latitude: number,
  longitude: number,
  fallback: string,
): Promise<{ label: string; isApproximate: boolean }> {
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    const resolved = buildPlaceLabel(places, fallback);
    if (resolved === fallback) {
      return { label: fallback, isApproximate: true };
    }
    return { label: resolved, isApproximate: false };
  } catch {
    return { label: fallback, isApproximate: true };
  }
}

export async function resolveCurrentPlace(
  fallbackLabel: string,
  language = 'en',
): Promise<ResolvedPlace> {
  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) {
    throw new Error('location_services_disabled');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = position.coords;
  const geocoded =
    Platform.OS === 'web'
      ? await reverseGeocodeWeb(latitude, longitude, language, fallbackLabel)
      : await reverseGeocodeNative(latitude, longitude, fallbackLabel);

  return { latitude, longitude, ...geocoded };
}
