/**
 * Address Resolution Utility
 * Uses the same Google Places API as AddressAutoComplete component
 */

export interface AddressType {
  address1: string;
  address2: string;
  formattedAddress: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
}

/**
 * Resolves an address string to complete address data using Google Places API
 * Uses the exact same API calls as the AddressAutoComplete component
 * @param addressString - The address string from voice input (e.g., "4027 Pierce Street, Hollywood")
 * @returns Complete address data with all fields populated
 */
const getGoogleMapsApiKey = () =>
  process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY

export async function resolveAddress(addressString: string): Promise<AddressType | null> {
  const apiKey = getGoogleMapsApiKey();
  // Lazy import avoided: keep bundle size minimal and tree-shakeable
  // Small helper to log usage without blocking UX
  let didLogAutocomplete = false;
  
  const input = addressString.trim();
  if (!input) {
    return null;
  }
  
  // Fallback: If no API key, parse the address string manually
  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY not set; using basic address parsing');
    return parseAddressManually(input);
  }
  
  try {
    // Step 1: Get autocomplete suggestions (same as AddressAutoComplete component)
    const sessionToken = Math.random().toString(36).slice(2);
    
    const resp = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "suggestions.placePrediction.text,suggestions.placePrediction.place",
      },
      body: JSON.stringify({
        input,
        languageCode: "en",
        sessionToken,
      }),
    });
    
    if (!resp.ok) {
      console.error('Address autocomplete failed:', await resp.text());
      return null;
    }
    
    const json = await resp.json();
    const suggestions = (json?.suggestions || []).map((s: any) => ({
      text: s?.placePrediction?.text?.text ?? "",
      placeResource: s?.placePrediction?.place ?? "",
    })).filter((p: any) => p.text && p.placeResource);
    
    if (suggestions.length === 0) {
      console.warn('No address suggestions found for:', input);
      return null;
    }
    // Log usage best-effort
    try {
      const { logUsage } = await import('./usage');
      await logUsage({
        clientId: 'unknown',
        service: 'google_places',
        operation: 'autocomplete',
        units: 1,
        metadata: { inputLength: input.length }
      });
      didLogAutocomplete = true;
    } catch {}
    
    // Get the first result
    const selectedPlaceId = suggestions[0].placeResource;
    
    if (!selectedPlaceId) {
      console.warn('No place resource found in first result');
      return null;
    }
    
    // Step 2: Fetch full place details (same as AddressAutoComplete component)
    const placeResp = await fetch(`https://places.googleapis.com/v1/${selectedPlaceId}?languageCode=en`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "id",
          "formattedAddress",
          "adrFormatAddress",
          "addressComponents",
          "location",
        ].join(","),
      },
    });
    
    if (!placeResp.ok) {
      console.error("Failed to fetch place details", await placeResp.text());
      return null;
    }
    // Log usage for details (avoid double logging on error)
    try {
      const { logUsage } = await import('./usage');
      await logUsage({
        clientId: 'unknown',
        service: 'google_places',
        operation: 'details',
        units: 1,
        metadata: { loggedAutocomplete: didLogAutocomplete }
      });
    } catch {}
    
    const placeJson = await placeResp.json();
    const comps = placeJson?.addressComponents || [];
    
    // Extract address components (same logic as AddressAutoComplete component)
    const get = (type: string) => comps.find((c: any) => (c.types || []).includes(type))?.longText || "";
    
    //TODO: there is no point on getting all this information from the Google Places API, we should simplify this and just get the formattedAddress
    const streetNumber = get("street_number");
    const route = get("route");
    const address1 = [streetNumber, route].filter(Boolean).join(" ");
    const address2 = get("subpremise");
    const city = get("locality") || get("postal_town") || get("sublocality");
    const region = get("administrative_area_level_1");
    const postalCode = get("postal_code");
    const country = get("country");
    const formattedAddress = placeJson?.formattedAddress || "";
    const lat = placeJson?.location?.latitude ?? 0;
    const lng = placeJson?.location?.longitude ?? 0;
    return {
      address1,
      address2,
      formattedAddress,
      city,
      region,
      postalCode,
      country,
      lat,
      lng,
    };
  } catch (error) {
    console.error('Error resolving address:', error);
    return null;
  }
}

/**
 * Resolves multiple addresses in parallel
 * @param addressStrings - Array of address strings
 * @returns Array of resolved addresses (nulls for failures)
 */
export async function resolveAddresses(
  addressStrings: string[]
): Promise<(AddressType | null)[]> {
  return Promise.all(addressStrings.map((addr) => resolveAddress(addr)));
}

/**
 * Google Places API autocomplete suggestions
 */
export interface PlaceSuggestion {
  text: string;
  placeResource: string;
}

/**
 * Get autocomplete suggestions from Google Places API
 * @param input - The search input string
 * @param sessionToken - Session token for billing
 * @returns Array of place suggestions
 */
export async function getPlaceSuggestions(
  input: string, 
  sessionToken: string
): Promise<PlaceSuggestion[]> {
  const apiKey = getGoogleMapsApiKey();
  
  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY not set; autocomplete disabled');
    return [];
  }
  
  const trimmedInput = input.trim();
  if (!trimmedInput) {
    return [];
  }
  
  try {
    const resp = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "suggestions.placePrediction.text,suggestions.placePrediction.place",
      },
      body: JSON.stringify({
        input: trimmedInput,
        languageCode: "en",
        sessionToken,
      }),
    });
    
    if (!resp.ok) {
      console.error('Place autocomplete failed:', await resp.text());
      return [];
    }
    
    const json = await resp.json();
    const suggestions = (json?.suggestions || []).map((s: any) => ({
      text: s?.placePrediction?.text?.text ?? "",
      placeResource: s?.placePrediction?.place ?? "",
    })).filter((p: any) => p.text && p.placeResource);
    
    return suggestions;
  } catch (error) {
    console.error('Error fetching place suggestions:', error);
    return [];
  }
}

/**
 * Get place details from Google Places API using place ID
 * @param placeId - The Google Places place ID
 * @returns Complete address data or null if failed
 */
export async function getPlaceDetails(placeId: string): Promise<AddressType | null> {
  const apiKey = getGoogleMapsApiKey();
  
  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY not set; cannot fetch place details');
    return null;
  }
  
  if (!placeId) {
    return null;
  }
  
  try {
    const resp = await fetch(`https://places.googleapis.com/v1/${placeId}?languageCode=en`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "id",
          "formattedAddress",
          "adrFormatAddress",
          "addressComponents",
          "location",
        ].join(","),
      },
    });
    
    if (!resp.ok) {
      console.error("Failed to fetch place details", await resp.text());
      return null;
    }
    
    const json = await resp.json();
    const comps = json?.addressComponents || [];
    
    // Extract address components (same logic as AddressAutoComplete component)
    const get = (type: string) => comps.find((c: any) => (c.types || []).includes(type))?.longText || "";
    
    const streetNumber = get("street_number");
    const route = get("route");
    const address1 = [streetNumber, route].filter(Boolean).join(" ");
    const address2 = get("subpremise");
    const city = get("locality") || get("postal_town") || get("sublocality");
    const region = get("administrative_area_level_1");
    const postalCode = get("postal_code");
    const country = get("country");
    const formattedAddress = json?.formattedAddress || "";
    const lat = json?.location?.latitude ?? 0;
    const lng = json?.location?.longitude ?? 0;
    
    return {
      address1,
      address2,
      formattedAddress,
      city,
      region,
      postalCode,
      country,
      lat,
      lng,
    };
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

/**
 * Check if Google Places API is available
 * @returns true if API key is set, false otherwise
 */
export function isGooglePlacesAvailable(): boolean {
  return Boolean(getGoogleMapsApiKey());
}

/**
 * Parse address manually without Google Places API
 * Attempts to extract address components from a free-form address string
 * @param addressString - The address string to parse
 * @returns Basic address data with parsed components
 */
function parseAddressManually(addressString: string): AddressType {
  const parts = addressString.split(',').map(p => p.trim());
  
  // Simple heuristic parsing:
  // Format: "123 Street Name, City, State ZIP" or "123 Street Name, City"
  const address1 = parts[0] || '';
  const city = parts[1] || '';
  
  // Try to extract state and postal code from the last part
  let region = '';
  let postalCode = '';
  
  if (parts.length >= 3) {
    const lastPart = parts[parts.length - 1];
    // Look for state abbreviation (2 letters) and ZIP code (5 digits)
    const stateZipMatch = lastPart.match(/([A-Z]{2})\s*(\d{5}(-\d{4})?)?/);
    if (stateZipMatch) {
      region = stateZipMatch[1] || '';
      postalCode = stateZipMatch[2] || '';
    } else {
      // If no match, assume the whole thing is the region
      region = lastPart;
    }
  } else if (parts.length === 2) {
    // Try to extract from the city part if it includes state/zip
    const cityStateMatch = city.match(/^(.+?),?\s*([A-Z]{2})\s*(\d{5}(-\d{4})?)?$/);
    if (cityStateMatch) {
      // City includes state and maybe zip
      const actualCity = cityStateMatch[1];
      region = cityStateMatch[2] || '';
      postalCode = cityStateMatch[3] || '';
      return {
        address1,
        address2: '',
        formattedAddress: addressString,
        city: actualCity,
        region,
        postalCode,
        country: 'US', // Default to US
        lat: 0,
        lng: 0,
      };
    }
  }
  
  return {
    address1,
    address2: '',
    formattedAddress: addressString,
    city,
    region,
    postalCode,
    country: 'US', // Default to US
    lat: 0,
    lng: 0,
  };
}

