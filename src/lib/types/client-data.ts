export type ClientData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    ssn: string;
    dob: string;
    citizenship: string;
    maritalStatus: string;
    hasMilitaryService: boolean;
    militaryNote: string | null;
    generalNotes?: string; // General notes about the client for processor reference
  };