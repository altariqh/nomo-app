/**
 * API Utility to resolve backend endpoints dynamically.
 * Helps ensure that in a native mobile (APK/Capacitor) environment where origin is localhost/file://,
 * requests are routed to the deployed Cloud Run server instead of failing on local relative paths.
 */

export function getApiUrl(path: string): string {
  // Remove leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  let baseUrl = '';

  // 1. Check if Vite build-time injected __APP_URL__ is available
  try {
    // @ts-ignore
    if (typeof __APP_URL__ !== 'undefined' && __APP_URL__) {
      // @ts-ignore
      baseUrl = __APP_URL__;
    }
  } catch (e) {
    // ignore
  }

  // 2. Resolve dynamically based on window environment
  if (typeof window !== 'undefined' && window.location) {
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

  // 3. Robust fallback to the current live deployment URL if no other URL is resolved
  if (!baseUrl) {
    baseUrl = 'https://ais-dev-nqvdt5rgnymewrfslvf7mt-841275972869.asia-east1.run.app';
  }

  // Normalize slash
  const originUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${originUrl}/${cleanPath}`;
}
