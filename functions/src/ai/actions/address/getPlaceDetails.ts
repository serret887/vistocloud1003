/**
 * Get place details from place ID
 */

import type { AddressData } from './types';

export async function getPlaceDetails(placeId: string, apiKey: string): Promise<AddressData | null> {
  const placeResp = await fetch(`https://places.googleapis.com/v1/${placeId}?languageCode=en`, {
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
}


