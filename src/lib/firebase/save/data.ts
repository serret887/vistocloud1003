// Data-specific save operations (address, employment, income, assets, real estate, loan)
import { db } from '$lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { debug } from '$lib/debug';
import { sanitizeForFirebase } from './utils';

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

export async function saveLoanDataToFirebase(
  applicationId: string,
  clientId: string,
  loanData: any
): Promise<void> {
  try {
    debug.firebase.save(`applications/${applicationId}/loans`, clientId, loanData);
    
    const loanRef = doc(db, 'applications', applicationId, 'loans', clientId);
    await setDoc(loanRef, sanitizeForFirebase({
      ...loanData,
      updatedAt: new Date().toISOString()
    }), { merge: true });
    
    debug.log(`✅ Loan data for ${clientId} saved to Firebase`);
  } catch (error) {
    debug.firebase.error('saveLoanData', error);
    throw error;
  }
}


