import { Capacitor, CapacitorHttp } from '@capacitor/core';

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
  const baseUrl = (import.meta as any).env.VITE_LOCATION_API_URL;
  if (baseUrl) {
    const trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${trimmedBase}${cleanPath}`;
  }
  
  return cleanPath;
}

export interface GeocodingParams {
  query: string;
  limit?: number;
  lat?: string | number;
  lon?: string | number;
}

export async function requestGeocoding(params: GeocodingParams): Promise<any[]> {
  const { query, limit = 5, lat, lon } = params;
  
  const baseUrl = (import.meta as any).env.VITE_LOCATION_API_URL || '';
  
  // Decide whether the base URL points directly to OSM Nominatim or is a backend proxy
  let finalUrl = '';
  const isDirectNominatim = baseUrl.includes('nominatim.openstreetmap.org');
  
  if (isDirectNominatim) {
    // Direct Nominatim search
    finalUrl = `${baseUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1&accept-language=en`;
    if (lat && lon) {
      finalUrl += `&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&bounded=0`;
    }
  } else if (baseUrl) {
    // Backend proxy via absolute VITE_LOCATION_API_URL (used in native build/APK pointing to Cloud Run)
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    finalUrl = `${cleanBase}/api/places/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    if (lat && lon) {
      finalUrl += `&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;
    }
  } else {
    // Fallback relative path for Web client proxy
    finalUrl = `/api/places/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    if (lat && lon) {
      finalUrl += `&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;
    }
  }

  const isNative = Capacitor.isNativePlatform();
  console.log(`[GeocodingRequest] query="${query}", limit=${limit}, lat=${lat}, lon=${lon}`);
  console.log(`[GeocodingRequest] Native platform: ${isNative}`);
  console.log(`[GeocodingRequest] Selected URL: ${finalUrl}`);

  if (isNative) {
    try {
      console.log(`[GeocodingRequest] Initiating native CapacitorHttp GET request...`);
      const response = await CapacitorHttp.get({
        url: finalUrl,
        headers: {
          'User-Agent': 'NomoTravelCurator/1.0 (altariqhd@gmail.com; context-capacitor-http)'
        }
      });
      
      console.log(`[GeocodingRequest] Native CapacitorHttp status received: ${response.status}`);
      if (response.status < 200 || response.status >= 300) {
        console.log(`[GeocodingRequest] Native CapacitorHttp error body:`, response.data);
        throw new Error(`HTTP error! status: ${response.status}. details: ${JSON.stringify(response.data)}`);
      }
      
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      throw new Error(`Invalid response format: expected array, received: ${typeof data}`);
    } catch (err: any) {
      console.error(`[GeocodingRequest] Native CapacitorHttp failed:`, err);
      throw err;
    }
  } else {
    // Web browser fallback
    try {
      console.log(`[GeocodingRequest] Initiating browser fetch GET request...`);
      const response = await fetch(finalUrl, {
        headers: {
          'User-Agent': 'NomoTravelCurator/1.0 (altariqhd@gmail.com; context-browser-fetch)'
        }
      });
      
      console.log(`[GeocodingRequest] Browser fetch status received: ${response.status}`);
      if (!response.ok) {
        const errText = await response.text().catch(() => 'No response body');
        console.log(`[GeocodingRequest] Browser fetch error body:`, errText);
        throw new Error(`HTTP error! status: ${response.status}. details: ${errText}`);
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      throw new Error(`Invalid response format: expected array, received: ${typeof data}`);
    } catch (err: any) {
      console.error(`[GeocodingRequest] Browser fetch failed:`, err);
      throw err;
    }
  }
}

export async function requestReverseGeocoding(lat: number, lon: number): Promise<any> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
  const isNative = Capacitor.isNativePlatform();
  console.log(`[ReverseGeocode] lat=${lat}, lon=${lon}, Native platform: ${isNative}`);
  console.log(`[ReverseGeocode] Selected URL: ${url}`);

  if (isNative) {
    try {
      console.log(`[ReverseGeocode] Initiating native CapacitorHttp GET request...`);
      const response = await CapacitorHttp.get({
        url,
        headers: {
          'User-Agent': 'NomoTravelCurator/1.0 (altariqhd@gmail.com; context-capacitor-http)'
        }
      });
      
      console.log(`[ReverseGeocode] Native CapacitorHttp status received: ${response.status}`);
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`HTTP error! status: ${response.status}. details: ${JSON.stringify(response.data)}`);
      }
      
      const data = response.data;
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      return data;
    } catch (err: any) {
      console.error(`[ReverseGeocode] Native CapacitorHttp failed:`, err);
      throw err;
    }
  } else {
    try {
      console.log(`[ReverseGeocode] Initiating browser fetch GET request...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'NomoTravelCurator/1.0 (altariqhd@gmail.com; context-browser-fetch)'
        }
      });
      
      console.log(`[ReverseGeocode] Browser fetch status received: ${response.status}`);
      if (!response.ok) {
        const errText = await response.text().catch(() => 'No response body');
        throw new Error(`HTTP error! status: ${response.status}. details: ${errText}`);
      }
      
      return await response.json();
    } catch (err: any) {
      console.error(`[ReverseGeocode] Browser fetch failed:`, err);
      throw err;
    }
  }
}
