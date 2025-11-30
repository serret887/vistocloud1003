/**
 * Address Resolution Utility
 * Main entry point - imports from submodules
 */
import { getGoogleMapsApiKey, isGooglePlacesAvailable } from './addressResolver/config';
import { parseAddressManually } from './addressResolver/parsing';
import { getPlaceSuggestions, getPlaceDetails } from './addressResolver/api';
import type { AddressType, PlaceSuggestion } from './addressResolver/types';

export type { AddressType, PlaceSuggestion };
export { isGooglePlacesAvailable, getPlaceSuggestions, getPlaceDetails };

export async function resolveAddress(addressString: string): Promise<AddressType | null> {
  const apiKey = getGoogleMapsApiKey();
  let didLogAutocomplete = false;
  
  const input = addressString.trim();
  if (!input) {
    return null;
  }
  
  if (!apiKey) {
    console.warn('NEXT_GOOGLE_MAPS_API_KEY not set; using basic address parsing');
    return parseAddressManually(input);
  }
  
  try {
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
    
    const selectedPlaceId = suggestions[0].placeResource;
    
    if (!selectedPlaceId) {
      console.warn('No place resource found in first result');
      return null;
    }
    
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
    
    const get = (type: string) => comps.find((c: any) => (c.types || []).includes(type))?.longText || "";
    
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

export async function resolveAddresses(
  addressStrings: string[]
): Promise<(AddressType | null)[]> {
  return Promise.all(addressStrings.map((addr) => resolveAddress(addr)));
}

