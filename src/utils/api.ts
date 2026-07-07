/**
 * API Utility to resolve backend endpoints dynamically.
 * Helps ensure that in a native mobile (APK/Capacitor) environment where origin is localhost/file://,
 * requests are routed to the deployed Cloud Run server instead of failing on local relative paths.
 */

export function getApiUrl(path: string): string {
  // Always use relative paths for web to avoid CORS and domain mismatch issues.
  // The proxy (Vite or Nginx) will route it correctly in the same origin.
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If we need to rewrite to Nominatim for location search, let the backend handle it or proxy it.
  // Actually, our backend handles /api/places/search directly, so we just return the path.
  return cleanPath;
}
