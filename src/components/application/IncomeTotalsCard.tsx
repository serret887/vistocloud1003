// IncomeTotalsCard component
// Displays simplified income totals (always shown)

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApplicationStore } from '@/stores/applicationStore';

interface IncomeTotalsCardProps {
  clientId: string;
}

export function IncomeTotalsCard({ clientId }: IncomeTotalsCardProps) {
  const {
    getActiveIncomeRecords,
    getPassiveIncomeRecords,
    clients
  } = useApplicationStore();

  const activeIncomeRecords = getActiveIncomeRecords(clientId);
  const passiveIncomeRecords = getPassiveIncomeRecords(clientId);

  // Get client name for the header
  const client = clients[clientId];
  const clientName = client ? `${client.firstName} ${client.lastName}` : 'Client';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate active income total (including bonus, commissions, overtime)
  const activeTotal = activeIncomeRecords.reduce((sum, record) => {
    const monthlyBase = Number(record.monthlyAmount) || 0;
    const monthlyBonus = Number((record as any).bonus) || 0;
    const monthlyCommissions = Number((record as any).commissions) || 0;
    const monthlyOvertime = Number((record as any).overtime) || 0;
    const recordTotal = monthlyBase + monthlyBonus + monthlyCommissions + monthlyOvertime;
    
    return sum + recordTotal;
  }, 0);
  
  // Calculate passive income total
  const passiveTotal = passiveIncomeRecords.reduce((sum, record) => sum + record.monthlyAmount, 0);
  
  // Calculate total monthly income
  const totalMonthly = activeTotal + passiveTotal;


  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Income for {clientName}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Income Rows */}
        <div className="space-y-3">
          {/* Employment Income */}
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">Employment</span>
            <span className="font-medium text-gray-900">{formatCurrency(activeTotal)}</span>
          </div>

          {/* Passive Income Items */}
          {passiveIncomeRecords.map((record) => (
            <div key={record.id} className="flex justify-between items-center py-2">
              <span className="text-gray-700">{record.sourceName}</span>
              <span className="font-medium text-gray-900">{formatCurrency(record.monthlyAmount)}</span>
            </div>
          ))}

          {/* Show placeholder for passive income if none exists */}
          {passiveIncomeRecords.length === 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400 italic">No passive income added</span>
              <span className="font-medium text-gray-400">$0.00</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* Total */}
        <div className="flex justify-between items-center py-2">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(totalMonthly)}</span>
        </div>

        {/* Total Income Summary */}
        <hr className="border-gray-300 border-2" />
        <div className="flex justify-between items-center py-3">
          <span className="text-xl font-bold text-gray-900">Total Income</span>
          <span className="text-xl font-bold text-gray-900">{formatCurrency(totalMonthly)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default IncomeTotalsCard;