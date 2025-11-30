import type { ApplicationState } from '$lib/stores/application';
import { get } from 'svelte/store';
import { applicationStore } from '$lib/stores/application';
import { generateLoans } from './sections/loans';
import { generateParties } from './sections/parties';
import { generateCollaterals } from './sections/collaterals';
import { generateDocumentSets } from './sections/documents';

const MISMO_NAMESPACE = 'http://www.mismo.org/residential/2009/schemas';
const ULAD_NAMESPACE = 'http://www.datamodelextension.org/Schema/ULAD';

export function generateMISMO(state?: ApplicationState): string {
  const appState = state || get(applicationStore);
  return `<?xml version="1.0" encoding="UTF-8"?>
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
}

export function downloadMISMO(state?: ApplicationState, filename = 'application.xml'): void {
  const xml = generateMISMO(state);
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

