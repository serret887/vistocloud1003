/**
 * MISMO (Mortgage Industry Standards Maintenance Organization) XML Generator
 * Generates MISMO 3.4 compliant XML for mortgage loan applications
 */

import type { ApplicationState } from '$lib/stores/application';
import { get } from 'svelte/store';
import { applicationStore } from '$lib/stores/application';

/**
 * MISMO 3.4 namespace URIs
 */
const MISMO_NAMESPACE = 'http://www.mismo.org/residential/2009/schemas';
const ULAD_NAMESPACE = 'http://www.datamodelextension.org/Schema/ULAD';

/**
 * Generate MISMO 3.4 XML from application state
 */
export function generateMISMO(state?: ApplicationState): string {
  const appState = state || get(applicationStore);
  const today = new Date().toISOString().split('T')[0];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<MESSAGE xmlns="${MISMO_NAMESPACE}" xmlns:ulad="${ULAD_NAMESPACE}">
  <ABOUT_VERSIONS>
    <ABOUT_VERSION>
      <DataVersionIdentifier>MISMO 3.4</DataVersionIdentifier>
      <DataVersionName>MISMO Reference Model</DataVersionName>
    </ABOUT_VERSION>
  </ABOUT_VERSIONS>
  <DEAL_SETS>
    <DEAL_SET>
      <DEALS>
        <DEAL>
          <ABOUT_VERSIONS>
            <ABOUT_VERSION>
              <CreatedDatetime>${new Date().toISOString()}</CreatedDatetime>
            </ABOUT_VERSION>
          </ABOUT_VERSIONS>
${generateLoans(appState)}
${generateParties(appState)}
${generateCollaterals(appState)}
${generateDocumentSets()}
        </DEAL>
      </DEALS>
    </DEAL_SET>
  </DEAL_SETS>
</MESSAGE>`;

  return xml;
}

/**
 * Generate LOANS section
 */
function generateLoans(state: ApplicationState): string {
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

/**
 * Generate PARTIES section (borrowers)
 */
function generateParties(state: ApplicationState): string {
  const parties = state.clientIds.map((clientId, index) => {
    const client = state.clientData[clientId];
    const address = state.addressData[clientId]?.present?.addr;
    const employment = state.employmentData[clientId]?.records || [];
    const income = state.incomeData[clientId];
    
    return `            <PARTY>
              <INDIVIDUAL>
                <NAME>
                  <FirstName>${escapeXml(client?.firstName || '')}</FirstName>
                  <LastName>${escapeXml(client?.lastName || '')}</LastName>
                  <FullName>${escapeXml((client?.firstName || '') + ' ' + (client?.lastName || ''))}</FullName>
                </NAME>
                <CONTACT_POINTS>
                  <CONTACT_POINT>
                    <CONTACT_POINT_EMAIL>
                      <ContactPointEmailValue>${escapeXml(client?.email || '')}</ContactPointEmailValue>
                    </CONTACT_POINT_EMAIL>
                  </CONTACT_POINT>
                  <CONTACT_POINT>
                    <CONTACT_POINT_TELEPHONE>
                      <ContactPointTelephoneValue>${escapeXml(client?.phone || '')}</ContactPointTelephoneValue>
                    </CONTACT_POINT_TELEPHONE>
                  </CONTACT_POINT>
                </CONTACT_POINTS>
              </INDIVIDUAL>
              <ROLES>
                <ROLE>
                  <ROLE_DETAIL>
                    <PartyRoleType>${index === 0 ? 'Borrower' : 'CoBorrower'}</PartyRoleType>
                  </ROLE_DETAIL>
                  <BORROWER>
                    <BORROWER_DETAIL>
                      <BorrowerBirthDate>${escapeXml(client?.dob || '')}</BorrowerBirthDate>
                      <MaritalStatusType>${mapMaritalStatus(client?.maritalStatus)}</MaritalStatusType>
                    </BORROWER_DETAIL>
                    <GOVERNMENT_MONITORING>
                      <GOVERNMENT_MONITORING_DETAIL>
                        <CitizenshipResidencyType>${mapCitizenship(client?.citizenship)}</CitizenshipResidencyType>
                      </GOVERNMENT_MONITORING_DETAIL>
                    </GOVERNMENT_MONITORING>
                    <RESIDENCES>
${generateResidences(state, clientId)}
                    </RESIDENCES>
                    <EMPLOYERS>
${generateEmployers(employment)}
                    </EMPLOYERS>
                    <CURRENT_INCOME>
${generateIncome(income)}
                    </CURRENT_INCOME>
                  </BORROWER>
                </ROLE>
              </ROLES>
              <TAXPAYER_IDENTIFIERS>
                <TAXPAYER_IDENTIFIER>
                  <TaxpayerIdentifierType>SocialSecurityNumber</TaxpayerIdentifierType>
                  <TaxpayerIdentifierValue>${escapeXml(client?.ssn || '')}</TaxpayerIdentifierValue>
                </TAXPAYER_IDENTIFIER>
              </TAXPAYER_IDENTIFIERS>
            </PARTY>`;
  });

  return `          <PARTIES>
${parties.join('\n')}
          </PARTIES>`;
}

/**
 * Generate RESIDENCES section for a borrower
 */
function generateResidences(state: ApplicationState, clientId: string): string {
  const addressData = state.addressData[clientId];
  const residences: string[] = [];
  
  // Present address
  if (addressData?.present) {
    const addr = addressData.present.addr;
    residences.push(`                      <RESIDENCE>
                        <ADDRESS>
                          <AddressLineText>${escapeXml(addr?.address1 || '')}</AddressLineText>
                          <AddressUnitDesignatorType>${addr?.address2 ? 'Apartment' : ''}</AddressUnitDesignatorType>
                          <AddressUnitIdentifier>${escapeXml(addr?.address2 || '')}</AddressUnitIdentifier>
                          <CityName>${escapeXml(addr?.city || '')}</CityName>
                          <StateCode>${escapeXml(addr?.region || '')}</StateCode>
                          <PostalCode>${escapeXml(addr?.postalCode || '')}</PostalCode>
                          <CountryCode>${addr?.country || 'US'}</CountryCode>
                        </ADDRESS>
                        <RESIDENCE_DETAIL>
                          <BorrowerResidencyType>Current</BorrowerResidencyType>
                          <BorrowerResidencyDurationMonthsCount>${calculateMonths(addressData.present.fromDate)}</BorrowerResidencyDurationMonthsCount>
                        </RESIDENCE_DETAIL>
                      </RESIDENCE>`);
  }
  
  // Former addresses
  if (addressData?.former) {
    addressData.former.forEach(former => {
      const addr = former.addr;
      residences.push(`                      <RESIDENCE>
                        <ADDRESS>
                          <AddressLineText>${escapeXml(addr?.address1 || '')}</AddressLineText>
                          <CityName>${escapeXml(addr?.city || '')}</CityName>
                          <StateCode>${escapeXml(addr?.region || '')}</StateCode>
                          <PostalCode>${escapeXml(addr?.postalCode || '')}</PostalCode>
                          <CountryCode>${addr?.country || 'US'}</CountryCode>
                        </ADDRESS>
                        <RESIDENCE_DETAIL>
                          <BorrowerResidencyType>Prior</BorrowerResidencyType>
                          <BorrowerResidencyDurationMonthsCount>${calculateMonthsBetween(former.fromDate, former.toDate)}</BorrowerResidencyDurationMonthsCount>
                        </RESIDENCE_DETAIL>
                      </RESIDENCE>`);
    });
  }
  
  return residences.join('\n');
}

/**
 * Generate EMPLOYERS section
 */
function generateEmployers(records: any[]): string {
  if (!records || records.length === 0) {
    return '';
  }
  
  return records.map(record => `                      <EMPLOYER>
                        <EMPLOYER_DETAIL>
                          <EmployerName>${escapeXml(record.employerName || '')}</EmployerName>
                          <EmploymentPositionDescription>${escapeXml(record.jobTitle || '')}</EmploymentPositionDescription>
                          <EmploymentStartDate>${escapeXml(record.startDate || '')}</EmploymentStartDate>
                          <EmploymentEndDate>${record.currentlyEmployed ? '' : escapeXml(record.endDate || '')}</EmploymentEndDate>
                          <EmploymentStatusType>${record.currentlyEmployed ? 'Current' : 'Previous'}</EmploymentStatusType>
                          <SelfEmployedIndicator>${record.selfEmployed ? 'true' : 'false'}</SelfEmployedIndicator>
                          <EmploymentMonthlyIncomeAmount>${record.grossMonthlyIncome || 0}</EmploymentMonthlyIncomeAmount>
                        </EMPLOYER_DETAIL>
                        <ADDRESS>
                          <AddressLineText>${escapeXml(record.employerAddress?.address1 || '')}</AddressLineText>
                          <CityName>${escapeXml(record.employerAddress?.city || '')}</CityName>
                          <StateCode>${escapeXml(record.employerAddress?.region || '')}</StateCode>
                          <PostalCode>${escapeXml(record.employerAddress?.postalCode || '')}</PostalCode>
                        </ADDRESS>
                        <CONTACT_POINTS>
                          <CONTACT_POINT>
                            <CONTACT_POINT_TELEPHONE>
                              <ContactPointTelephoneValue>${escapeXml(record.phoneNumber || '')}</ContactPointTelephoneValue>
                            </CONTACT_POINT_TELEPHONE>
                          </CONTACT_POINT>
                        </CONTACT_POINTS>
                      </EMPLOYER>`).join('\n');
}

/**
 * Generate CURRENT_INCOME section
 */
function generateIncome(income: any): string {
  if (!income) {
    return '';
  }
  
  const items: string[] = [];
  
  // Active income
  if (income.activeIncomeRecords) {
    income.activeIncomeRecords.forEach((record: any) => {
      items.push(`                      <CURRENT_INCOME_ITEM>
                        <CURRENT_INCOME_ITEM_DETAIL>
                          <CurrentIncomeMonthlyTotalAmount>${record.monthlyAmount || 0}</CurrentIncomeMonthlyTotalAmount>
                          <IncomeType>Base</IncomeType>
                          <EmploymentIncomeIndicator>true</EmploymentIncomeIndicator>
                        </CURRENT_INCOME_ITEM_DETAIL>
                      </CURRENT_INCOME_ITEM>`);
      
      // Bonus
      if (record.bonus && record.bonus > 0) {
        items.push(`                      <CURRENT_INCOME_ITEM>
                        <CURRENT_INCOME_ITEM_DETAIL>
                          <CurrentIncomeMonthlyTotalAmount>${record.bonus}</CurrentIncomeMonthlyTotalAmount>
                          <IncomeType>Bonus</IncomeType>
                          <EmploymentIncomeIndicator>true</EmploymentIncomeIndicator>
                        </CURRENT_INCOME_ITEM_DETAIL>
                      </CURRENT_INCOME_ITEM>`);
      }
      
      // Overtime
      if (record.overtime && record.overtime > 0) {
        items.push(`                      <CURRENT_INCOME_ITEM>
                        <CURRENT_INCOME_ITEM_DETAIL>
                          <CurrentIncomeMonthlyTotalAmount>${record.overtime}</CurrentIncomeMonthlyTotalAmount>
                          <IncomeType>Overtime</IncomeType>
                          <EmploymentIncomeIndicator>true</EmploymentIncomeIndicator>
                        </CURRENT_INCOME_ITEM_DETAIL>
                      </CURRENT_INCOME_ITEM>`);
      }
      
      // Commissions
      if (record.commissions && record.commissions > 0) {
        items.push(`                      <CURRENT_INCOME_ITEM>
                        <CURRENT_INCOME_ITEM_DETAIL>
                          <CurrentIncomeMonthlyTotalAmount>${record.commissions}</CurrentIncomeMonthlyTotalAmount>
                          <IncomeType>Commissions</IncomeType>
                          <EmploymentIncomeIndicator>true</EmploymentIncomeIndicator>
                        </CURRENT_INCOME_ITEM_DETAIL>
                      </CURRENT_INCOME_ITEM>`);
      }
    });
  }
  
  // Passive income
  if (income.passiveIncomeRecords) {
    income.passiveIncomeRecords.forEach((record: any) => {
      items.push(`                      <CURRENT_INCOME_ITEM>
                        <CURRENT_INCOME_ITEM_DETAIL>
                          <CurrentIncomeMonthlyTotalAmount>${record.monthlyAmount || 0}</CurrentIncomeMonthlyTotalAmount>
                          <IncomeType>${mapPassiveIncomeType(record.sourceType)}</IncomeType>
                          <EmploymentIncomeIndicator>false</EmploymentIncomeIndicator>
                        </CURRENT_INCOME_ITEM_DETAIL>
                      </CURRENT_INCOME_ITEM>`);
    });
  }
  
  return items.join('\n');
}

/**
 * Generate COLLATERALS section (real estate owned)
 */
function generateCollaterals(state: ApplicationState): string {
  const properties: string[] = [];
  
  state.clientIds.forEach(clientId => {
    const realEstate = state.realEstateData[clientId]?.records || [];
    realEstate.forEach((property: any) => {
      properties.push(`              <COLLATERAL>
                <PROPERTY>
                  <ADDRESS>
                    <AddressLineText>${escapeXml(property.address?.address1 || '')}</AddressLineText>
                    <CityName>${escapeXml(property.address?.city || '')}</CityName>
                    <StateCode>${escapeXml(property.address?.region || '')}</StateCode>
                    <PostalCode>${escapeXml(property.address?.postalCode || '')}</PostalCode>
                    <CountryCode>US</CountryCode>
                  </ADDRESS>
                  <PROPERTY_DETAIL>
                    <PropertyCurrentUsageType>${mapOccupancyType(property.occupancyType)}</PropertyCurrentUsageType>
                    <PropertyEstimatedValueAmount>${property.propertyValue || 0}</PropertyEstimatedValueAmount>
                  </PROPERTY_DETAIL>
                  <PROPERTY_VALUATIONS>
                    <PROPERTY_VALUATION>
                      <PropertyValuationAmount>${property.propertyValue || 0}</PropertyValuationAmount>
                      <PropertyValuationMethodType>Other</PropertyValuationMethodType>
                    </PROPERTY_VALUATION>
                  </PROPERTY_VALUATIONS>
                </PROPERTY>
              </COLLATERAL>`);
    });
  });
  
  if (properties.length === 0) {
    return '          <COLLATERALS/>';
  }
  
  return `          <COLLATERALS>
${properties.join('\n')}
          </COLLATERALS>`;
}

/**
 * Generate DOCUMENT_SETS section
 */
function generateDocumentSets(): string {
  return `          <DOCUMENT_SETS>
            <DOCUMENT_SET>
              <DOCUMENTS>
                <DOCUMENT>
                  <DOCUMENT_DETAIL>
                    <DocumentName>Uniform Residential Loan Application</DocumentName>
                    <DocumentType>UniformResidentialLoanApplication</DocumentType>
                  </DOCUMENT_DETAIL>
                </DOCUMENT>
              </DOCUMENTS>
            </DOCUMENT_SET>
          </DOCUMENT_SETS>`;
}

/**
 * Generate assets section (for MISMO)
 */
export function generateAssets(state: ApplicationState): string {
  const assets: string[] = [];
  
  state.clientIds.forEach(clientId => {
    const clientAssets = state.assetsData[clientId]?.records || [];
    clientAssets.forEach((asset: any) => {
      assets.push(`          <ASSET>
            <ASSET_DETAIL>
              <AssetAccountIdentifier>${escapeXml(asset.accountNumber || '')}</AssetAccountIdentifier>
              <AssetCashOrMarketValueAmount>${asset.amount || 0}</AssetCashOrMarketValueAmount>
              <AssetType>${mapAssetType(asset.category, asset.type)}</AssetType>
            </ASSET_DETAIL>
            <ASSET_HOLDER>
              <NAME>
                <FullName>${escapeXml(asset.institutionName || '')}</FullName>
              </NAME>
            </ASSET_HOLDER>
          </ASSET>`);
    });
  });
  
  return assets.join('\n');
}

// Helper functions

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function mapMaritalStatus(status: string | undefined): string {
  switch (status?.toLowerCase()) {
    case 'married': return 'Married';
    case 'unmarried': return 'Unmarried';
    case 'separated': return 'Separated';
    default: return 'Unknown';
  }
}

function mapCitizenship(citizenship: string | undefined): string {
  switch (citizenship) {
    case 'US Citizen': return 'USCitizen';
    case 'Permanent Resident Alien': return 'PermanentResidentAlien';
    case 'Non-Permanent Resident Alien': return 'NonPermanentResidentAlien';
    default: return 'Unknown';
  }
}

function mapPassiveIncomeType(type: string | undefined): string {
  switch (type) {
    case 'rental': return 'RentalIncome';
    case 'dividends': return 'DividendsAndInterest';
    case 'social-security': return 'SocialSecurity';
    case 'pension': return 'Pension';
    case 'alimony': return 'Alimony';
    case 'child-support': return 'ChildSupport';
    default: return 'Other';
  }
}

function mapOccupancyType(type: string | undefined): string {
  switch (type?.toLowerCase()) {
    case 'primary': return 'PrimaryResidence';
    case 'secondary': return 'SecondHome';
    case 'investment': return 'Investment';
    default: return 'PrimaryResidence';
  }
}

function mapAssetType(category: string | undefined, type: string | undefined): string {
  switch (category) {
    case 'checking':
    case 'savings':
      return 'CheckingAccount';
    case 'money-market':
      return 'MoneyMarket';
    case 'cd':
      return 'CertificateOfDeposit';
    case 'stocks':
    case 'bonds':
    case 'mutual-funds':
      return 'Stock';
    case 'retirement':
      return 'RetirementFund';
    case 'trust':
      return 'TrustAccount';
    default:
      return 'Other';
  }
}

function calculateMonths(fromDate: string | undefined): number {
  if (!fromDate) return 0;
  const start = new Date(fromDate);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(0, months);
}

function calculateMonthsBetween(fromDate: string | undefined, toDate: string | undefined): number {
  if (!fromDate || !toDate) return 0;
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, months);
}

/**
 * Download MISMO XML as a file
 */
export function downloadMISMO(state?: ApplicationState, filename?: string): void {
  const xml = generateMISMO(state);
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `mismo-application-${new Date().toISOString().split('T')[0]}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validate MISMO XML structure
 */
export function validateMISMO(state: ApplicationState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for required borrower information
  state.clientIds.forEach((clientId, index) => {
    const client = state.clientData[clientId];
    const role = index === 0 ? 'Primary Borrower' : `Co-Borrower ${index}`;
    
    if (!client?.firstName) errors.push(`${role}: First name is required`);
    if (!client?.lastName) errors.push(`${role}: Last name is required`);
    if (!client?.ssn) errors.push(`${role}: SSN is required`);
    if (!client?.dob) errors.push(`${role}: Date of birth is required`);
    
    // Check address
    const address = state.addressData[clientId]?.present?.addr;
    if (!address?.address1) errors.push(`${role}: Current address is required`);
    if (!address?.city) errors.push(`${role}: City is required`);
    if (!address?.region) errors.push(`${role}: State is required`);
    if (!address?.postalCode) errors.push(`${role}: ZIP code is required`);
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}


