import type { ApplicationState } from '$lib/stores/application';
import { escapeXml, calculateMonths, calculateMonthsBetween } from '../../utils';

export function generateResidences(state: ApplicationState, clientId: string): string {
  const addressData = state.addressData[clientId];
  if (!addressData) return '';

  const entries: string[] = [];

  if (addressData.present) {
    entries.push(residenceTemplate({
      address: addressData.present.addr,
      type: 'Current',
      months: calculateMonths(addressData.present.fromDate)
    }));
  }

  (addressData.former || []).forEach(former => {
    entries.push(residenceTemplate({
      address: former.addr,
      type: 'Prior',
      months: calculateMonthsBetween(former.fromDate, former.toDate)
    }));
  });

  return entries.join('\n');
}

function residenceTemplate(params: { address: any; type: string; months: number }): string {
  const addr = params.address || {};
  return `                      <RESIDENCE>
                        <ADDRESS>
                          <AddressLineText>${escapeXml(addr.address1 || '')}</AddressLineText>
                          <AddressUnitIdentifier>${escapeXml(addr.address2 || '')}</AddressUnitIdentifier>
                          <CityName>${escapeXml(addr.city || '')}</CityName>
                          <StateCode>${escapeXml(addr.region || '')}</StateCode>
                          <PostalCode>${escapeXml(addr.postalCode || '')}</PostalCode>
                          <CountryCode>${addr.country || 'US'}</CountryCode>
                        </ADDRESS>
                        <RESIDENCE_DETAIL>
                          <BorrowerResidencyType>${params.type}</BorrowerResidencyType>
                          <BorrowerResidencyDurationMonthsCount>${params.months}</BorrowerResidencyDurationMonthsCount>
                        </RESIDENCE_DETAIL>
                      </RESIDENCE>`;
}

