import type { ApplicationState } from '$lib/stores/application';
import { escapeXml, mapOccupancyType } from '../utils';

export function generateCollaterals(state: ApplicationState): string {
  const blocks: string[] = [];

  state.clientIds.forEach(clientId => {
    (state.realEstateData[clientId]?.records || []).forEach(property => {
      blocks.push(`          <COLLATERAL>
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
            </PROPERTY>
          </COLLATERAL>`);
    });
  });

  if (!blocks.length) return '          <COLLATERALS/>';

  return `          <COLLATERALS>
${blocks.join('\n')}
          </COLLATERALS>`;
}


