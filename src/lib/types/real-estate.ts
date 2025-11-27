// Real Estate Owned types
// Based on data model from specs/011-we-are-going/data-model.md

import type { AddressType } from "$lib/types/address"

export interface RealEstateOwned {
  id: string
  clientId: string
  address: AddressType
  propertyType: '2-4 Unit' | 'Co-op' | 'Commercial Non-Residential' | 'Condominium' | 'Farm' | 'Home and Business Combined' | 'Land' | 'Manufactured or Mobile Home' | 'Mixed Use Residential' | 'Multi-family' | 'Single Family'
  propertyStatus: 'Pending Sale' | 'Retained' | 'Sold'
  occupancyType: 'Investment Property' | 'Primary Residence' | 'Secondary Residence'
  monthlyTaxes: number
  monthlyInsurance: number
  currentResidence: boolean
  propertyValue: number
  createdAt?: string
  updatedAt?: string
}

export interface ClientRealEstateData {
  clientId: string
  records: RealEstateOwned[]
  totalValue?: number
  hasCurrentResidence?: boolean
  isComplete?: boolean
}

export interface RealEstateFormData {
  address: AddressType
  propertyType: string
  propertyStatus: string
  occupancyType: string
  monthlyTaxes: number
  monthlyInsurance: number
  currentResidence: boolean
  propertyValue: number
}

// Real estate service interface for local data management
export interface RealEstateService {
  getRealEstateRecords(clientId: string): Promise<RealEstateOwned[]>
  saveRealEstateRecord(clientId: string, record: RealEstateOwned): Promise<RealEstateOwned>
  updateRealEstateRecord(clientId: string, recordId: string, updates: Partial<RealEstateOwned>): Promise<RealEstateOwned>
  deleteRealEstateRecord(clientId: string, recordId: string): Promise<void>
  getClientRealEstateData(clientId: string): Promise<ClientRealEstateData>
}

// Real estate store actions interface
export interface RealEstateStoreActions {
  addRealEstateRecord: (clientId: string, record: RealEstateOwned) => void
  updateRealEstateRecord: (clientId: string, recordId: string, updates: Partial<RealEstateOwned>) => void
  removeRealEstateRecord: (clientId: string, recordId: string) => void
  getRealEstateRecords: (clientId: string) => RealEstateOwned[]
  getClientRealEstateData: (clientId: string) => ClientRealEstateData
  clearRealEstateData: (clientId: string) => void
}

// Real estate store state interface
export interface RealEstateStoreState {
  realEstateData: { [clientId: string]: ClientRealEstateData }
  actions: RealEstateStoreActions
}

// Property type labels
export const PROPERTY_TYPE_LABELS: Record<RealEstateOwned['propertyType'], string> = {
  '2-4 Unit': '2-4 Unit',
  'Co-op': 'Co-op',
  'Commercial Non-Residential': 'Commercial Non-Residential',
  'Condominium': 'Condominium',
  'Farm': 'Farm',
  'Home and Business Combined': 'Home and Business Combined',
  'Land': 'Land',
  'Manufactured or Mobile Home': 'Manufactured or Mobile Home',
  'Mixed Use Residential': 'Mixed Use Residential',
  'Multi-family': 'Multi-family',
  'Single Family': 'Single Family'
}

// Property status labels
export const PROPERTY_STATUS_LABELS: Record<RealEstateOwned['propertyStatus'], string> = {
  'Pending Sale': 'Pending Sale',
  'Retained': 'Retained',
  'Sold': 'Sold'
}

// Occupancy type labels
export const OCCUPANCY_TYPE_LABELS: Record<RealEstateOwned['occupancyType'], string> = {
  'Investment Property': 'Investment Property',
  'Primary Residence': 'Primary Residence',
  'Secondary Residence': 'Secondary Residence'
}
