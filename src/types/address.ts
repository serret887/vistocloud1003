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

export interface AddressRecord {
  id: string;
  fromDate: string; // ISO date string (YYYY-MM-DD)
  toDate: string;   // ISO date string (YYYY-MM-DD) or empty for present address
  addr: AddressType;
  isPresent: boolean; // true for current address, false for former addresses
}

export interface ClientAddressData {
  present: AddressRecord;
  former: AddressRecord[];
}

export interface AddressValidationResult {
  isValid: boolean;
  totalMonths: number;
  requiredMonths: number;
  missingMonths: number;
  errors: string[];
}
