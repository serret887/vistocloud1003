// Application-level save operations
import { db } from '$lib/firebase';
import { collection, doc, setDoc, addDoc } from 'firebase/firestore';
import type { ApplicationState } from '$lib/stores/application/index';
import { debug } from '$lib/debug';
import { sanitizeForFirebase } from './utils';

export async function createApplicationInFirebase(
  state: ApplicationState
): Promise<string> {
  try {
    debug.firebase.save('applications', 'NEW', state);
    
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
      loanData: state.loanData,
      documentsData: state.documentsData,
      isLoading: state.isLoading,
      isSaving: state.isSaving,
      lastSaved: state.lastSaved,
      validationErrors: state.validationErrors,
      visitedSteps: Object.fromEntries(Object.entries(state.visitedSteps).map(([k, v]) => [k, Array.from(v)])),
      touchedFields: Object.fromEntries(Object.entries(state.touchedFields).map(([k, v]) => [k, Array.from(v)])),
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

export async function saveApplicationToFirebase(
  applicationId: string,
  state: ApplicationState
): Promise<void> {
  try {
    debug.firebase.save('applications', applicationId, state);
    
    const appRef = doc(db, 'applications', applicationId);
    
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
      loanData: state.loanData,
      documentsData: state.documentsData,
      isLoading: state.isLoading,
      isSaving: state.isSaving,
      lastSaved: state.lastSaved,
      validationErrors: state.validationErrors,
      visitedSteps: Object.fromEntries(Object.entries(state.visitedSteps).map(([k, v]) => [k, Array.from(v)])),
      touchedFields: Object.fromEntries(Object.entries(state.touchedFields).map(([k, v]) => [k, Array.from(v)])),
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


