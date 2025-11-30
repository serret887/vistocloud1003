// Address types and interfaces
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

export interface PlaceSuggestion {
  text: string;
  placeResource: string;
}

