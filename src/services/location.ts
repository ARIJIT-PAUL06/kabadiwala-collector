// Serves: R08, R15
import * as Location from 'expo-location';
import { GeoPoint } from '../domain/types';
import { repo } from '../data/repo';

export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function getCurrentGeoPoint(localityId = 'itwari'): Promise<{
  point: GeoPoint;
  approximate: boolean;
}> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      // Round to 4 decimal places (~11 meters) to protect privacy (R15)
      return {
        point: {
          lat: Number(loc.coords.latitude.toFixed(4)),
          lng: Number(loc.coords.longitude.toFixed(4)),
          accuracyM: loc.coords.accuracy ? Math.round(loc.coords.accuracy) : undefined,
        },
        approximate: false,
      };
    }
  } catch {
    // fall through to centroid fallback
  }

  // Fallback to locality centroid
  const districts = repo.getDistricts();
  let lat = 21.155;
  let lng = 79.112;

  for (const d of districts) {
    const match = d.localities.find((l) => l.id === localityId);
    if (match) {
      lat = match.lat;
      lng = match.lng;
      break;
    }
  }

  return {
    point: { lat, lng },
    approximate: true,
  };
}
