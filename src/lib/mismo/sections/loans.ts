import type { ApplicationState } from '$lib/stores/application';

export function generateLoans(state: ApplicationState): string {
  return `          <LOANS>
            <LOAN>
              <LOAN_IDENTIFIERS>
                <LOAN_IDENTIFIER>
                  <LoanIdentifier>${state.currentApplicationId || 'PENDING'}</LoanIdentifier>
                  <LoanIdentifierType>LenderLoan</LoanIdentifierType>
                </LOAN_IDENTIFIER>
              </LOAN_IDENTIFIERS>
              <TERMS_OF_LOAN>
                <LoanPurposeType>Purchase</LoanPurposeType>
                <MortgageType>Conventional</MortgageType>
              </TERMS_OF_LOAN>
            </LOAN>
          </LOANS>`;
}


