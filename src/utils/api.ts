/**
 * API Utility to resolve backend endpoints dynamically.
 * Helps ensure that in a native mobile (APK/Capacitor) environment where origin is localhost/file://,
 * requests are routed to the deployed Cloud Run server instead of failing on local relative paths.
 */

export function getApiUrl(path: string): string {
  // Remove leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  let baseUrl = '';

  // 1. Try using the VITE_LOCATION_API_URL environment variable (essential for native builds)
  try {
    // @ts-ignore
    if (import.meta.env && import.meta.env.VITE_LOCATION_API_URL) {
      // @ts-ignore
      baseUrl = import.meta.env.VITE_LOCATION_API_URL;
    }
  } catch (e) {
    // ignore
  }

  // 2. Check if Vite build-time injected __APP_URL__ is available
  if (!baseUrl) {
    try {
      // @ts-ignore
      if (typeof __APP_URL__ !== 'undefined' && __APP_URL__) {
        // @ts-ignore
        baseUrl = __APP_URL__;
      }
    } catch (e) {
      // ignore
    }
  }

  // 3. Resolve dynamically based on window environment
  if (!baseUrl && typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    const isLocal = origin.includes('localhost') || 
                    origin.includes('127.0.0.1') || 
                    origin.startsWith('file:') || 
                    origin.startsWith('capacitor:');
    
    if (!isLocal && origin) {
      baseUrl = origin;
      try {
        localStorage.setItem('NOMO_LAST_KNOWN_SERVER', origin);
      } catch (e) {}
    } else {
      // Try using last known working server from local storage
      try {
        const stored = localStorage.getItem('NOMO_LAST_KNOWN_SERVER');
        if (stored) {
          baseUrl = stored;
        }
      } catch (e) {}
    }
  }

  // 4. Robust fallback to the current live deployment URL if no other URL is resolved
  if (!baseUrl) {
    baseUrl = 'https://ais-dev-nqvdt5rgnymewrfslvf7mt-841275972869.asia-east1.run.app';
  }

  // Normalize slash
  const originUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // If VITE_LOCATION_API_URL is pointing directly to Nominatim, rewrite the query on the fly to fit OpenStreetMap's search endpoint directly
  if (cleanPath.startsWith('api/places/search') && originUrl.includes('nominatim.openstreetmap.org')) {
    try {
      const queryString = cleanPath.split('?')[1] || '';
      const params = new URLSearchParams(queryString);
      const q = params.get('q') || '';
      const limit = params.get('limit') || '5';
      const lat = params.get('lat') || '';
      const lon = params.get('lon') || '';

      let directUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=${limit}&addressdetails=1&accept-language=en`;
      if (lat && lon) {
        directUrl += `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&bounded=0`;
      }
      console.log(`[getApiUrl] Rewrote location proxy path directly to Nominatim URL: ${directUrl}`);
      return directUrl;
    } catch (e) {
      console.error('[getApiUrl] Error parsing search query for direct Nominatim rewriting, falling back to original path:', e);
    }
  }

  return `${originUrl}/${cleanPath}`;
}
