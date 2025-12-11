// Loan-related store actions
import type { Writable } from 'svelte/store';
import type { ApplicationState } from '../types';
import type { LoanInformation, LoanPurposeType, MortgageType } from '$lib/types/loan';
import type { AddressType } from '$lib/types/address';
import { createDefaultLoanData } from '../defaults/loan';

export function createLoanActions(
  update: Writable<ApplicationState>['update']
) {
  return {
    setLoanPurposeType: (clientId: string, purposeType: LoanPurposeType) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        // If changing away from refinance types, clear refinance property
        const isRefinanceType = purposeType === 'Refinance' || purposeType === 'CashOutRefinance';
        const wasRefinanceType = currentLoanInfo.loanPurposeType === 'Refinance' || currentLoanInfo.loanPurposeType === 'CashOutRefinance';
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                loanPurposeType: purposeType,
                refinancePropertyId: isRefinanceType ? currentLoanInfo.refinancePropertyId : (wasRefinanceType ? null : currentLoanInfo.refinancePropertyId),
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    setMortgageType: (clientId: string, mortgageType: MortgageType) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                mortgageType,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    setRefinancePropertyId: (clientId: string, propertyId: string | null) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                refinancePropertyId: propertyId,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    setLoanAmount: (clientId: string, amount: number | null) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                loanAmount: amount,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    setAmountOwed: (clientId: string, amount: number | null) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                amountOwed: amount,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    setDownPayment: (clientId: string, amount: number | null) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                downPayment: amount,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    setDownPaymentSource: (clientId: string, source: string | null) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                downPaymentSource: source,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    setPurchasePropertyAddress: (clientId: string, address: AddressType | null) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                purchasePropertyAddress: address,
                purchasePropertyAddressTBD: address === null ? currentLoanInfo.purchasePropertyAddressTBD : false,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    setPurchasePropertyAddressTBD: (clientId: string, tbd: boolean) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                purchasePropertyAddressTBD: tbd,
                purchasePropertyAddress: tbd ? null : currentLoanInfo.purchasePropertyAddress,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    setInterestRate: (clientId: string, rate: number | null) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                interestRate: rate,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    setEstimatedTaxes: (clientId: string, taxes: number | null) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                estimatedTaxes: taxes,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    setEstimatedInsurance: (clientId: string, insurance: number | null) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                estimatedInsurance: insurance,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    setPropertyUseType: (clientId: string, useType: 'PrimaryResidence' | 'SecondaryResidence' | 'Investment' | null) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                propertyUseType: useType,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    updateLoanInfo: (clientId: string, updates: Partial<LoanInformation>) => {
      update(state => {
        const currentLoanData = state.loanData[clientId] || createDefaultLoanData(clientId);
        const currentLoanInfo = currentLoanData.loanInfo || {};
        
        return {
          ...state,
          loanData: {
            ...state.loanData,
            [clientId]: {
              ...currentLoanData,
              loanInfo: {
                ...currentLoanInfo,
                ...updates,
                updatedAt: new Date().toISOString()
              }
            }
          }
        };
      });
    },
    
    clearLoanData: (clientId: string) => {
      update(state => ({
        ...state,
        loanData: {
          ...state.loanData,
          [clientId]: createDefaultLoanData(clientId)
        }
      }));
    },
    
    getLoanData: (clientId: string) => {
      // This is a getter function, but we need to access state
      // In practice, this will be used via derived stores
      return null as LoanInformation | null;
    },
    
    getClientLoanData: (clientId: string) => {
      // This is a getter function, but we need to access state
      // In practice, this will be used via derived stores
      return null as any;
    }
  };
}

