/**
 * Firebase save operations for application data
 */

import { db } from '$lib/firebase';
import { collection, doc, setDoc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import type { ApplicationState } from '$lib/stores/application';
import { debug } from '$lib/debug';

/**
 * Recursively removes undefined values from an object (Firebase doesn't accept undefined)
 * Converts undefined to null for Firebase compatibility
 */
function sanitizeForFirebase<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirebase(item)) as T;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) {
        sanitized[key] = null; // Convert undefined to null
      } else {
        sanitized[key] = sanitizeForFirebase(value);
      }
    }
    return sanitized as T;
  }
  
  return obj;
}

/**
 * Create a new application in Firestore and return the auto-generated ID
 */
export async function createApplicationInFirebase(
  state: ApplicationState
): Promise<string> {
  try {
    debug.firebase.save('applications', 'NEW', state);
    
    // Prepare data for Firestore (remove functions, convert to plain object, sanitize undefined)
    const firestoreData = sanitizeForFirebase({
      activeClientId: state.activeClientId,
      clientIds: state.clientIds,
      currentStepId: state.currentStepId,
      clientData: state.clientData,
      addressData: state.addressData,
      employmentData: state.employmentData,
      incomeData: state.incomeData,
      assetsData: state.assetsData,
      realEstateData: state.realEstateData,
      documentsData: state.documentsData,
      isLoading: state.isLoading,
      isSaving: state.isSaving,
      lastSaved: state.lastSaved,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const appsRef = collection(db, 'applications');
    const docRef = await addDoc(appsRef, firestoreData);
    
    debug.log('✅ Application created in Firestore with ID:', docRef.id);
    console.log('✅ Application created in Firestore emulator with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    debug.firebase.error('createApplication', error);
    console.error('❌ Failed to create application in Firestore:', error);
    throw error;
  }
}

/**
 * Save entire application state to Firestore (update existing)
 */
export async function saveApplicationToFirebase(
  applicationId: string,
  state: ApplicationState
): Promise<void> {
  try {
    debug.firebase.save('applications', applicationId, state);
    
    const appRef = doc(db, 'applications', applicationId);
    
    // Prepare data for Firestore (remove functions, convert to plain object, sanitize undefined)
    const firestoreData = sanitizeForFirebase({
      currentApplicationId: state.currentApplicationId,
      activeClientId: state.activeClientId,
      clientIds: state.clientIds,
      currentStepId: state.currentStepId,
      clientData: state.clientData,
      addressData: state.addressData,
      employmentData: state.employmentData,
      incomeData: state.incomeData,
      assetsData: state.assetsData,
      realEstateData: state.realEstateData,
      documentsData: state.documentsData,
      isLoading: state.isLoading,
      isSaving: state.isSaving,
      lastSaved: state.lastSaved,
      updatedAt: new Date().toISOString()
    });
    
    console.log('💾 [FIREBASE] Attempting to save application:', applicationId);
    console.log('💾 [FIREBASE] Data to save:', JSON.stringify(firestoreData, null, 2).slice(0, 500) + '...');
    
    await setDoc(appRef, firestoreData, { merge: true });
    
    debug.log('✅ Application saved to Firebase:', applicationId);
    console.log('✅ [FIREBASE] Application saved successfully to Firestore:', applicationId);
  } catch (error) {
    debug.firebase.error('saveApplication', error);
    console.error('❌ [FIREBASE] Failed to save application to Firestore:', error);
    console.error('❌ [FIREBASE] Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      applicationId,
      db: db ? 'connected' : 'not connected'
    });
    throw error;
  }
}

/**
 * Save client data to Firestore
 */
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
    
    // Ensure all required fields are present (even if empty strings)
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
    
    // Verify the save by reading it back
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

/**
 * Save address data to Firestore
 */
export async function saveAddressDataToFirebase(
  applicationId: string,
  clientId: string,
  addressData: any
): Promise<void> {
  try {
    debug.firebase.save(`applications/${applicationId}/addresses`, clientId, addressData);
    
    const addressRef = doc(db, 'applications', applicationId, 'addresses', clientId);
    await setDoc(addressRef, sanitizeForFirebase({
      ...addressData,
      updatedAt: new Date().toISOString()
    }), { merge: true });
    
    debug.log(`✅ Address data for ${clientId} saved to Firebase`);
  } catch (error) {
    debug.firebase.error('saveAddressData', error);
    throw error;
  }
}

/**
 * Save employment data to Firestore
 */
export async function saveEmploymentDataToFirebase(
  applicationId: string,
  clientId: string,
  employmentData: any
): Promise<void> {
  try {
    debug.firebase.save(`applications/${applicationId}/employment`, clientId, employmentData);
    
    const employmentRef = doc(db, 'applications', applicationId, 'employment', clientId);
    await setDoc(employmentRef, sanitizeForFirebase({
      ...employmentData,
      updatedAt: new Date().toISOString()
    }), { merge: true });
    
    debug.log(`✅ Employment data for ${clientId} saved to Firebase`);
  } catch (error) {
    debug.firebase.error('saveEmploymentData', error);
    throw error;
  }
}

/**
 * Save income data to Firestore
 */
export async function saveIncomeDataToFirebase(
  applicationId: string,
  clientId: string,
  incomeData: any
): Promise<void> {
  try {
    debug.firebase.save(`applications/${applicationId}/income`, clientId, incomeData);
    
    const incomeRef = doc(db, 'applications', applicationId, 'income', clientId);
    await setDoc(incomeRef, sanitizeForFirebase({
      ...incomeData,
      updatedAt: new Date().toISOString()
    }), { merge: true });
    
    debug.log(`✅ Income data for ${clientId} saved to Firebase`);
  } catch (error) {
    debug.firebase.error('saveIncomeData', error);
    throw error;
  }
}

/**
 * Save assets data to Firestore
 */
export async function saveAssetsDataToFirebase(
  applicationId: string,
  clientId: string,
  assetsData: any
): Promise<void> {
  try {
    debug.firebase.save(`applications/${applicationId}/assets`, clientId, assetsData);
    
    const assetsRef = doc(db, 'applications', applicationId, 'assets', clientId);
    await setDoc(assetsRef, sanitizeForFirebase({
      ...assetsData,
      updatedAt: new Date().toISOString()
    }), { merge: true });
    
    debug.log(`✅ Assets data for ${clientId} saved to Firebase`);
  } catch (error) {
    debug.firebase.error('saveAssetsData', error);
    throw error;
  }
}

/**
 * Save real estate data to Firestore
 */
export async function saveRealEstateDataToFirebase(
  applicationId: string,
  clientId: string,
  realEstateData: any
): Promise<void> {
  try {
    debug.firebase.save(`applications/${applicationId}/realEstate`, clientId, realEstateData);
    
    const realEstateRef = doc(db, 'applications', applicationId, 'realEstate', clientId);
    await setDoc(realEstateRef, sanitizeForFirebase({
      ...realEstateData,
      updatedAt: new Date().toISOString()
    }), { merge: true });
    
    debug.log(`✅ Real estate data for ${clientId} saved to Firebase`);
  } catch (error) {
    debug.firebase.error('saveRealEstateData', error);
    throw error;
  }
}

/**
 * Save all client data to Firestore (batch operation)
 */
export async function saveAllClientDataToFirebase(
  applicationId: string,
  clientId: string,
  data: {
    clientData?: any;
    addressData?: any;
    employmentData?: any;
    incomeData?: any;
    assetsData?: any;
    realEstateData?: any;
  }
): Promise<void> {
  debug.group(`Saving all data for client ${clientId}`);
  
  const promises: Promise<void>[] = [];
  
  if (data.clientData) {
    promises.push(saveClientDataToFirebase(applicationId, clientId, data.clientData));
  }
  if (data.addressData) {
    promises.push(saveAddressDataToFirebase(applicationId, clientId, data.addressData));
  }
  if (data.employmentData) {
    promises.push(saveEmploymentDataToFirebase(applicationId, clientId, data.employmentData));
  }
  if (data.incomeData) {
    promises.push(saveIncomeDataToFirebase(applicationId, clientId, data.incomeData));
  }
  if (data.assetsData) {
    promises.push(saveAssetsDataToFirebase(applicationId, clientId, data.assetsData));
  }
  if (data.realEstateData) {
    promises.push(saveRealEstateDataToFirebase(applicationId, clientId, data.realEstateData));
  }
  
  await Promise.all(promises);
  debug.groupEnd();
  debug.log('✅ All client data saved to Firebase');
}

