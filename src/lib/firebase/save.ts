/**
 * Firebase save operations for application data
 */

import { db } from '$lib/firebase';
import { collection, doc, setDoc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import type { ApplicationState } from '$lib/stores/application';
import { debug } from '$lib/debug';

/**
 * Create a new application in Firestore and return the auto-generated ID
 */
export async function createApplicationInFirebase(
  state: ApplicationState
): Promise<string> {
  try {
    debug.firebase.save('applications', 'NEW', state);
    
    // Prepare data for Firestore (remove functions, convert to plain object)
    const firestoreData = {
      activeClientId: state.activeClientId,
      clientIds: state.clientIds,
      currentStepId: state.currentStepId,
      clientData: state.clientData,
      addressData: state.addressData,
      employmentData: state.employmentData,
      incomeData: state.incomeData,
      assetsData: state.assetsData,
      realEstateData: state.realEstateData,
      isLoading: state.isLoading,
      isSaving: state.isSaving,
      lastSaved: state.lastSaved,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
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
    
    // Prepare data for Firestore (remove functions, convert to plain object)
    const firestoreData = {
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
      isLoading: state.isLoading,
      isSaving: state.isSaving,
      lastSaved: state.lastSaved,
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(appRef, firestoreData, { merge: true });
    
    debug.log('✅ Application saved to Firebase:', applicationId);
    console.log('✅ Application saved to Firestore emulator:', applicationId);
  } catch (error) {
    debug.firebase.error('saveApplication', error);
    console.error('❌ Failed to save application to Firestore:', error);
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
    
    const clientRef = doc(db, 'applications', applicationId, 'clients', clientId);
    await setDoc(clientRef, {
      ...clientData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    debug.log(`✅ Client ${clientId} saved to Firebase`);
  } catch (error) {
    debug.firebase.error('saveClientData', error);
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
    await setDoc(addressRef, {
      ...addressData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
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
    await setDoc(employmentRef, {
      ...employmentData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
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
    await setDoc(incomeRef, {
      ...incomeData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
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
    await setDoc(assetsRef, {
      ...assetsData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
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
    await setDoc(realEstateRef, {
      ...realEstateData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
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

