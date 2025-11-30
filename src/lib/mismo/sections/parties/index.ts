import type { ApplicationState } from '$lib/stores/application';
import { escapeXml, mapMaritalStatus, mapCitizenship } from '../../utils';
import { generateResidences } from './residences';
import { generateEmployers } from './employers';
import { generateIncome } from './income';

export function generateParties(state: ApplicationState): string {
  const parties = state.clientIds.map((clientId, index) => {
    const client = state.clientData[clientId];
    const role = index === 0 ? 'Borrower' : 'CoBorrower';

    return `            <PARTY>
              <INDIVIDUAL>
                <NAME>
                  <FirstName>${escapeXml(client?.firstName || '')}</FirstName>
                  <LastName>${escapeXml(client?.lastName || '')}</LastName>
                  <FullName>${escapeXml(`${client?.firstName || ''} ${client?.lastName || ''}`.trim())}</FullName>
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
                    <PartyRoleType>${role}</PartyRoleType>
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
${generateEmployers(state.employmentData[clientId]?.records || [])}
                    </EMPLOYERS>
                    <CURRENT_INCOME>
${generateIncome(state.incomeData[clientId])}
                    </CURRENT_INCOME>
                  </BORROWER>
                </ROLE>
              </ROLES>
            </PARTY>`;
  }).join('\n');

  return `          <PARTIES>
${parties}
          </PARTIES>`;
}

