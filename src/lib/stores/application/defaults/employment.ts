// Default employment data factories
import type { ClientEmploymentData, EmploymentRecord } from '$lib/types/employment';
import { generateId } from '$lib/idGenerator';
import { createEmptyAddress } from './address';

export const createDefaultEmploymentData = (clientId: string): ClientEmploymentData => ({
  clientId,
  records: [],
  totalCoverageMonths: 0,
  hasGaps: false,
  isComplete: false,
  employmentNote: null
});

export const createDefaultEmploymentRecord = (): EmploymentRecord => ({
  id: generateId('emp'),
  employerName: '',
  phoneNumber: '',
  employerAddress: createEmptyAddress(),
  jobTitle: '',
  incomeType: '',
  selfEmployed: false,
  ownershipPercentage: false,
  relatedParty: false,
  currentlyEmployed: false,
  startDate: '',
  endDate: null,
  hasOfferLetter: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});


