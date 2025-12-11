// Google Places API functions
import { getGoogleMapsApiKey } from './config';
import type { AddressType, PlaceSuggestion } from './types';

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

export async function getPlaceDetails(placeId: string): Promise<AddressType | null> {
  const apiKey = getGoogleMapsApiKey();
  
  if (!apiKey || !placeId) {
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



