// Manual address parsing (fallback when API unavailable)
import type { AddressType } from './types';

export function parseAddressManually(addressString: string): AddressType {
  const parts = addressString.split(',').map(p => p.trim());
  const address1 = parts[0] || '';
  const city = parts[1] || '';
  
  let region = '';
  let postalCode = '';
  
  if (parts.length >= 3) {
    const lastPart = parts[parts.length - 1];
    const stateZipMatch = lastPart.match(/([A-Z]{2})\s*(\d{5}(-\d{4})?)?/);
    if (stateZipMatch) {
      region = stateZipMatch[1] || '';
      postalCode = stateZipMatch[2] || '';
    } else {
      region = lastPart;
    }
  } else if (parts.length === 2) {
    const cityStateMatch = city.match(/^(.+?),?\s*([A-Z]{2})\s*(\d{5}(-\d{4})?)?$/);
    if (cityStateMatch) {
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
        country: 'US',
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
    country: 'US',
    lat: 0,
    lng: 0,
  };
}

