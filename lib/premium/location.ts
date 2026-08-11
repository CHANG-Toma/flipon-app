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

export async function resolveCurrentPlace(fallbackLabel: string): Promise<ResolvedPlace> {
  const enabled = await Location.hasServicesEnabledAsync();
  if (!enabled) {
    throw new Error('location_services_disabled');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy:
      Platform.OS === 'android'
        ? Location.Accuracy.Balanced
        : Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = position.coords;
  let label = fallbackLabel;
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    label = buildPlaceLabel(places, fallbackLabel);
  } catch {
    /* garde le fallback */
  }

  return { latitude, longitude, label };
}
