// Google Maps API configuration
export function getGoogleMapsApiKey(): string {
  if (typeof import.meta.env !== 'undefined') {
    return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
           import.meta.env.VITE_GOOGLE_API_KEY ||
           '';
  }
  return '';
}

export function isGooglePlacesAvailable(): boolean {
  return Boolean(getGoogleMapsApiKey());
}


