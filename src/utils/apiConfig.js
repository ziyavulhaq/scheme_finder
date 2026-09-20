// Centralized API configuration for FINORA
// Local dev uses Vite dev proxy (/api -> http://localhost:5000)
// Production Vercel build uses VITE_API_BASE_URL if configured, or falls back to relative /api
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, "");

export function apiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) {
    return cleanEndpoint;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
}
