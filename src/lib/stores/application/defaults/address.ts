// Default address data factories
import type { ClientAddressData, AddressRecord, AddressType } from '$lib/types/address';
import { generateId } from '$lib/idGenerator';

export const createEmptyAddress = (): AddressType => ({
  address1: '',
  address2: '',
  formattedAddress: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
  lat: 0,
  lng: 0
});

export const createDefaultAddressRecord = (isPresent = false): AddressRecord => ({
  id: generateId('addr'),
  fromDate: '',
  toDate: '',
  addr: createEmptyAddress(),
  isPresent
});

export const createDefaultAddressData = (clientId: string): ClientAddressData => ({
  present: createDefaultAddressRecord(true),
  former: [],
  mailing: createDefaultAddressRecord(false)
});


