// Default client data factories
import type { ClientData } from '$lib/types/client-data';

export const createDefaultClientData = (): ClientData => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  ssn: '',
  dob: '',
  citizenship: '',
  maritalStatus: '',
  hasMilitaryService: false,
  militaryNote: null,
  generalNotes: ''
});



