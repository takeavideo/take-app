import * as Location from 'expo-location';

import { Coordinates } from '@/types/supabase';

export async function requestCurrentLocation(): Promise<Coordinates> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (permission.status !== Location.PermissionStatus.GRANTED) {
    throw new Error('Permita acesso à localização para usar este recurso do TAKE.');
  }

  const current = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: current.coords.latitude,
    longitude: current.coords.longitude,
  };
}

export async function reverseGeocodeApproximateLocation({ latitude, longitude }: Coordinates) {
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });

    return {
      city: place?.city ?? place?.subregion ?? null,
      neighborhood: place?.district ?? place?.name ?? null,
    };
  } catch {
    return {
      city: null,
      neighborhood: null,
    };
  }
}
