// Geo-Spatial Distance and Location Utilities

/**
 * Calculate distance between two lat/lng coordinates using Haversine formula
 * @returns {number} distance in kilometers
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Preset regions for instant demo switching
export const REGION_PRESETS = [
  { name: "Chennai (Tamil Nadu)", lat: 13.0827, lng: 80.2707, state: "Tamil Nadu", tag: "TAHDCO Central" },
  { name: "Hyderabad (Telangana)", lat: 17.3850, lng: 78.4867, state: "Telangana", tag: "TSCCDC Zone" },
  { name: "Vijayawada (Andhra Pradesh)", lat: 16.5062, lng: 80.6480, state: "Andhra Pradesh", tag: "APSCCFC Hub" },
  { name: "New Delhi (National Capital)", lat: 28.6139, lng: 77.2090, state: "Delhi", tag: "MoSJE HQ / DSCSTDC" },
  { name: "Lucknow (Uttar Pradesh)", lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh", tag: "UPSCCDC / Baroda UP" },
  { name: "Mumbai (Maharashtra)", lat: 19.0760, lng: 72.8777, state: "Maharashtra", tag: "MPBCDC HQ" }
];
