import { escapeXml } from '../../utils';

export function generateEmployers(records: any[]): string {
  if (!records?.length) return '';

  return records.map(record => {
    const status = record.currentlyEmployed ? 'Current' : 'Previous';
    const endDate = record.currentlyEmployed ? '' : escapeXml(record.endDate || '');
    return `                      <EMPLOYER>
                        <EMPLOYER_DETAIL>
                          <EmployerName>${escapeXml(record.employerName || '')}</EmployerName>
                          <EmploymentPositionDescription>${escapeXml(record.jobTitle || '')}</EmploymentPositionDescription>
                          <EmploymentStartDate>${escapeXml(record.startDate || '')}</EmploymentStartDate>
                          <EmploymentEndDate>${endDate}</EmploymentEndDate>
                          <EmploymentStatusType>${status}</EmploymentStatusType>
                          <SelfEmployedIndicator>${record.selfEmployed ? 'true' : 'false'}</SelfEmployedIndicator>
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
                      </EMPLOYER>`;
  }).join('\n');
}

