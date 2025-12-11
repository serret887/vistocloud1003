import type { ApplicationState } from '$lib/stores/application/index';

export function generateLoans(state: ApplicationState): string {
  // Get loan information from the active client
  const activeClientId = state.activeClientId;
  const loanData = state.loanData[activeClientId];
  const loanInfo = loanData?.loanInfo;
  
  // Use stored values or defaults
  const loanPurposeType = loanInfo?.loanPurposeType || 'Purchase';
  const mortgageType = loanInfo?.mortgageType || 'Conventional';
  const loanAmount = loanInfo?.loanAmount || null;
  
  // Build loan amount XML if available
  const loanAmountXml = loanAmount ? `\n                <LoanAmount>${loanAmount}</LoanAmount>` : '';
  
  return `          <LOANS>
            <LOAN>
              <LOAN_IDENTIFIERS>
                <LOAN_IDENTIFIER>
                  <LoanIdentifier>${state.currentApplicationId || 'PENDING'}</LoanIdentifier>
                  <LoanIdentifierType>LenderLoan</LoanIdentifierType>
                </LOAN_IDENTIFIER>
              </LOAN_IDENTIFIERS>
              <TERMS_OF_LOAN>
                <LoanPurposeType>${loanPurposeType}</LoanPurposeType>
                <MortgageType>${mortgageType}</MortgageType>${loanAmountXml}
              </TERMS_OF_LOAN>
            </LOAN>
          </LOANS>`;
}


