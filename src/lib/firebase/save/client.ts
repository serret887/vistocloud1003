// Client-specific save operations
import { db } from '$lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { debug } from '$lib/debug';
import { sanitizeForFirebase } from './utils';

export async function saveClientDataToFirebase(
  applicationId: string,
  clientId: string,
  clientData: any
): Promise<void> {
  try {
    debug.firebase.save(`applications/${applicationId}/clients`, clientId, clientData);
    console.log(`💾 [FIREBASE] Saving client data for ${clientId}:`, {
      citizenship: clientData?.citizenship,
      maritalStatus: clientData?.maritalStatus,
      firstName: clientData?.firstName,
      lastName: clientData?.lastName,
      email: clientData?.email,
      phone: clientData?.phone,
      ssn: clientData?.ssn,
      dob: clientData?.dob,
      hasMilitaryService: clientData?.hasMilitaryService
    });
    
    const dataToSave = {
      firstName: clientData?.firstName || '',
      lastName: clientData?.lastName || '',
      email: clientData?.email || '',
      phone: clientData?.phone || '',
      ssn: clientData?.ssn || '',
      dob: clientData?.dob || '',
      citizenship: clientData?.citizenship || '',
      maritalStatus: clientData?.maritalStatus || '',
      hasMilitaryService: clientData?.hasMilitaryService || false,
      militaryNote: clientData?.militaryNote || null,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`💾 [FIREBASE] Full client data to save:`, JSON.stringify(dataToSave, null, 2));
    console.log(`💾 [FIREBASE] Citizenship in dataToSave:`, dataToSave.citizenship);
    console.log(`💾 [FIREBASE] MaritalStatus in dataToSave:`, dataToSave.maritalStatus);
    
    const clientRef = doc(db, 'applications', applicationId, 'clients', clientId);
    await setDoc(clientRef, dataToSave, { merge: true });
    
    const verifyRef = doc(db, 'applications', applicationId, 'clients', clientId);
    const verifySnap = await getDoc(verifyRef);
    if (verifySnap.exists()) {
      const savedData = verifySnap.data();
      console.log(`✅ [FIREBASE] Verified saved data:`, {
        citizenship: savedData?.citizenship,
        maritalStatus: savedData?.maritalStatus,
        firstName: savedData?.firstName,
        lastName: savedData?.lastName
      });
    }
    
    debug.log(`✅ Client ${clientId} saved to Firebase`);
    console.log(`✅ [FIREBASE] Client ${clientId} saved successfully`);
  } catch (error) {
    debug.firebase.error('saveClientData', error);
    console.error(`❌ [FIREBASE] Failed to save client ${clientId}:`, error);
    throw error;
  }
}


