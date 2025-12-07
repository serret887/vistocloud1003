// Default real estate data factories
import type { ClientRealEstateData, RealEstateOwned } from '$lib/types/real-estate';
import { generateId } from '$lib/idGenerator';
import { createEmptyAddress } from './address';

export const createDefaultRealEstateData = (clientId: string): ClientRealEstateData => ({
  clientId,
  records: [],
  totalValue: 0,
  hasCurrentResidence: false,
  isComplete: false
});

export const createDefaultRealEstateRecord = (clientId: string): RealEstateOwned => ({
  id: generateId('reo'),
  clientId,
  address: createEmptyAddress(),
  propertyType: 'Single Family',
  propertyStatus: 'Retained',
  occupancyType: 'Primary Residence',
  monthlyTaxes: 0,
  monthlyInsurance: 0,
  currentResidence: false,
  propertyValue: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});



