const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function straightLineDistanceKm(
  pickupLat: number,
  pickupLng: number,
  destinationLat: number,
  destinationLng: number,
) {
  const latDelta = toRadians(destinationLat - pickupLat);
  const lngDelta = toRadians(destinationLng - pickupLng);
  const pickupLatRad = toRadians(pickupLat);
  const destinationLatRad = toRadians(destinationLat);

  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(pickupLatRad) *
      Math.cos(destinationLatRad) *
      Math.sin(lngDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function formatDistanceKm(distanceKm: number) {
  return `${distanceKm.toFixed(1)} km`;
}
