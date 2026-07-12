const CITY_COORDINATES: Array<{ match: string; lat: number; lng: number }> = [
  { match: "mumbai", lat: 19.076, lng: 72.8777 },
  { match: "delhi", lat: 28.6139, lng: 77.209 },
  { match: "bengaluru", lat: 12.9716, lng: 77.5946 },
  { match: "bangalore", lat: 12.9716, lng: 77.5946 },
  { match: "chennai", lat: 13.0827, lng: 80.2707 },
  { match: "hyderabad", lat: 17.385, lng: 78.4867 },
  { match: "pune", lat: 18.5204, lng: 73.8567 },
  { match: "kolkata", lat: 22.5726, lng: 88.3639 },
  { match: "ahmedabad", lat: 23.0225, lng: 72.5714 },
  { match: "jaipur", lat: 26.9124, lng: 75.7873 },
  { match: "lucknow", lat: 26.8467, lng: 80.9462 },
  { match: "nagpur", lat: 21.1458, lng: 79.0882 },
  { match: "indore", lat: 22.7196, lng: 75.8577 },
  { match: "surat", lat: 21.1702, lng: 72.8311 },
];

export function lookupCoordinates(label: string) {
  const normalized = label.toLowerCase();
  const hit = CITY_COORDINATES.find((city) => normalized.includes(city.match));
  if (hit) {
    return { lat: hit.lat, lng: hit.lng };
  }

  return { lat: 20.5937, lng: 78.9629 };
}

export function interpolateRoute(
  source: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  progress: number
) {
  const clamped = Math.max(0, Math.min(1, progress));
  return {
    lat: source.lat + (destination.lat - source.lat) * clamped,
    lng: source.lng + (destination.lng - source.lng) * clamped,
  };
}
