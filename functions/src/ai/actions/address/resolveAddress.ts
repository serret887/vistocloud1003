/**
 * Core address resolution using Google Places API
 */

import type { AddressData } from './types';
import { getPlaceId } from './getPlaceId';
import { getPlaceDetails } from './getPlaceDetails';

/**
 * Resolve an address using Google Places API
 */
export async function resolveAddress(addressString: string): Promise<AddressData | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY not set; skipping address resolution');
    return null;
  }
  
  const input = addressString.trim();
  if (!input) {
    return null;
  }
  
  try {
    const placeId = await getPlaceId(input, apiKey);
    if (!placeId) {
      return null;
    }
    
    return await getPlaceDetails(placeId, apiKey);
  } catch (error) {
    console.error('Error resolving address:', error);
    return null;
  }
}

