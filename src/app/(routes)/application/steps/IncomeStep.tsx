// Income Step component
// Displays income cards based on client employment status

import { useApplicationStore } from '@/stores/applicationStore';
import ClientTabs from './ClientTabs';
import ActiveIncomeCard from '@/components/application/ActiveIncomeCard';
import PassiveIncomeCard from '@/components/application/PassiveIncomeCard';
import IncomeTotalsCard from '@/components/application/IncomeTotalsCard';

export default function IncomeStep() {
  const { activeClientId, getEmploymentRecords } = useApplicationStore();
  
  // Get employment records for the current client - only current employments
  const allEmploymentRecords = getEmploymentRecords(activeClientId);
  const employmentRecords = allEmploymentRecords.filter(emp => emp.currentlyEmployed);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Client Tabs */}
      <ClientTabs />

      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Income Information</h1>
        <p className="text-lg text-gray-600">
          Provide your monthly income from all sources to continue with your mortgage application.
        </p>
      </div>

      {/* Income Cards Grid */}
      <div className="grid gap-6">
        {/* Active Income Cards - One card per employment record */}
        {employmentRecords.map((employment) => (
          <div key={employment.id}>
            <ActiveIncomeCard 
              clientId={activeClientId} 
              employmentRecord={employment}
            />
          </div>
        ))}

        {/* Passive Income Card - Always shown */}
        <div>
          <PassiveIncomeCard clientId={activeClientId} />
        </div>

        {/* Income Totals Card - Always shown */}
        <div>
          <IncomeTotalsCard clientId={activeClientId} />
        </div>
      </div>

      {/* Information Notice */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Income Documentation Requirements</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You will need to provide documentation for all income sources</li>
          <li>• Employment income typically requires pay stubs and tax returns</li>
          <li>• Passive income may require bank statements, 1099s, or other documentation</li>
        </ul>
      </div>
    </div>
  );
}