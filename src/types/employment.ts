// Employment information collection types
// Based on data model from specs/009-we-are-going/data-model.md

import type { AddressType } from "@/components/ui/address-autocomplete"

export interface EmploymentRecord {
  id: string
  employerName: string
  phoneNumber: string
  employerAddress: AddressType
  jobTitle: string
  incomeType: string
  selfEmployed: boolean
  ownershipPercentage: boolean
  relatedParty: boolean
  currentlyEmployed: boolean
  // Timeline
  startDate: string
  endDate: string | null
  // Future offer letter for this employer
  hasOfferLetter: boolean
  createdAt?: string
  updatedAt?: string

}

export interface ClientEmploymentData {
  clientId: string
  records: EmploymentRecord[]
  totalCoverageMonths?: number
  hasGaps?: boolean
  isComplete?: boolean
  employmentNote?: string | null // Note for cases with less than 2 years of employment
}

export interface EmploymentFormData {
  employerName: string
  phoneNumber: string
  employerAddress: AddressType
  jobTitle: string
  incomeType: string
  selfEmployed: boolean
  ownershipPercentage: boolean
  relatedParty: boolean
  currentlyEmployed: boolean
  // Timeline
  startDate: string
  endDate: string | null
  // Future offer letter for this employer
  hasOfferLetter: boolean
}

// Employment service interface for local data management
export interface EmploymentService {
  getEmploymentRecords(clientId: string): Promise<EmploymentRecord[]>
  saveEmploymentRecord(clientId: string, record: EmploymentRecord): Promise<EmploymentRecord>
  updateEmploymentRecord(clientId: string, recordId: string, updates: Partial<EmploymentRecord>): Promise<EmploymentRecord>
  deleteEmploymentRecord(clientId: string, recordId: string): Promise<void>
  getClientEmploymentData(clientId: string): Promise<ClientEmploymentData>
}

// Employment store actions interface
export interface EmploymentStoreActions {
  addEmploymentRecord: (clientId: string, record: EmploymentRecord) => void
  updateEmploymentRecord: (clientId: string, recordId: string, updates: Partial<EmploymentRecord>) => void
  removeEmploymentRecord: (clientId: string, recordId: string) => void
  getEmploymentRecords: (clientId: string) => EmploymentRecord[]
  getClientEmploymentData: (clientId: string) => ClientEmploymentData
  clearEmploymentData: (clientId: string) => void
}

// Employment store state interface
export interface EmploymentStoreState {
  employmentData: { [clientId: string]: ClientEmploymentData }
  actions: EmploymentStoreActions
}
