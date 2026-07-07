/**
 * API Utility to resolve backend endpoints dynamically.
 * Helps ensure that in a native mobile (APK/Capacitor) environment where origin is localhost/file://,
 * requests are routed to the deployed Cloud Run server instead of failing on local relative paths.
 */

export function getApiUrl(path: string): string {
  // Always use relative paths for web to avoid CORS and domain mismatch issues.
  // The proxy (Vite or Nginx) will route it correctly in the same origin.
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If VITE_LOCATION_API_URL is set, we use it as the base URL.
  // This prevents relative paths like /api/* (which fail on Android/APK)
  // or localhost from being called.
  const baseUrl = import.meta.env.VITE_LOCATION_API_URL;
  if (baseUrl) {
    const trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${trimmedBase}${cleanPath}`;
  }
  
  return cleanPath;
}
