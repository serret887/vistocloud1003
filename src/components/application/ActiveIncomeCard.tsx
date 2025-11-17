// ActiveIncomeCard component
// Displays income form for a specific employment record

import { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MoneyInput } from '@/components/ui/fields/MoneyInput';
import { useApplicationStore } from '@/stores/applicationStore';
import type { EmploymentRecord } from '@/types/employment';

interface ActiveIncomeCardProps {
  clientId: string;
  employmentRecord: EmploymentRecord;
}

export function ActiveIncomeCard({ clientId, employmentRecord }: ActiveIncomeCardProps) {
  const [formData, setFormData] = useState({
    monthlyAmount: 0,
    bonus: 0,
    commissions: 0,
    overtime: 0
  });

  const {
    getActiveIncomeRecords,
    addActiveIncome,
    updateActiveIncome,
    getNextIncomeId
  } = useApplicationStore();

  // Get existing income record for this employment
  const allActiveIncomeRecords = getActiveIncomeRecords(clientId);
  const existingRecord = allActiveIncomeRecords.find(
    record => record.employmentRecordId === employmentRecord.id
  );

  // Generate and store the ID only once for new records
  const [newRecordId, setNewRecordId] = useState<string | null>(null);
  
  // Generate ID after mount, not during render
  useEffect(() => {
    if (!existingRecord && !newRecordId) {
      setNewRecordId(getNextIncomeId(clientId));
    }
  }, [existingRecord, newRecordId, clientId, getNextIncomeId]);

  // Load existing data when component mounts or record changes
  useEffect(() => {
    if (existingRecord) {
      setFormData({
        monthlyAmount: existingRecord.monthlyAmount || 0,
        bonus: (existingRecord as any).bonus || 0,
        commissions: (existingRecord as any).commissions || 0,
        overtime: (existingRecord as any).overtime || 0
      });
    }
  }, [existingRecord]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleFieldChange = (field: string, value: number) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    saveData(updatedData);
  };

  const saveData = (data: typeof formData) => {
    const incomeData: any = {
      id: existingRecord?.id || newRecordId,
      clientId,
      employmentRecordId: employmentRecord.id,
      companyName: employmentRecord.employerName,
      position: employmentRecord.jobTitle,
      monthlyAmount: typeof data.monthlyAmount === 'number' ? data.monthlyAmount : 0,
      updatedAt: new Date().toISOString()
    };


    // Only add bonus, commissions, and overtime for non-self-employed
    if (!employmentRecord.selfEmployed) {
      if (typeof data.bonus === 'number' && data.bonus > 0) {
        incomeData.bonus = data.bonus;
      }
      if (typeof data.commissions === 'number' && data.commissions > 0) {
        incomeData.commissions = data.commissions;
      }
      if (typeof data.overtime === 'number' && data.overtime > 0) {
        incomeData.overtime = data.overtime;
      }
    }

    if (existingRecord) {
      updateActiveIncome(clientId, existingRecord.id, incomeData);
    } else {
      const id = addActiveIncome(clientId);
      updateActiveIncome(clientId, id, incomeData);
    }
  };

  // Calculate total monthly income - conditional based on employment type
  const monthlyBase = typeof formData.monthlyAmount === 'number' ? formData.monthlyAmount : 0;
  
  // Only include additional income types for non-self-employed
  const monthlyBonus = !employmentRecord.selfEmployed && typeof formData.bonus === 'number' ? formData.bonus : 0;
  const monthlyCommissions = !employmentRecord.selfEmployed && typeof formData.commissions === 'number' ? formData.commissions : 0;
  const monthlyOvertime = !employmentRecord.selfEmployed && typeof formData.overtime === 'number' ? formData.overtime : 0;
  
  const totalMonthly = monthlyBase + monthlyBonus + monthlyCommissions + monthlyOvertime;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          <div>
            <span className="text-lg font-semibold">{employmentRecord.employerName}</span>
            <div className="text-sm text-gray-600 font-normal">{employmentRecord.jobTitle}</div>
          </div>
        </CardTitle>

        {/* Total Display */}
        {totalMonthly > 0 && (
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-600">Total Monthly Income</div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalMonthly)}
              </div>
              <div className="text-sm text-gray-600">per month</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Income Fields - Conditional Layout Based on Employment Type */}
        {employmentRecord.selfEmployed ? (
          // Self-employed: Only show monthly income (single column)
          <div className="max-w-md">
            <div>
              <Label htmlFor={`monthlyAmount-${employmentRecord.id}`}>
                Monthly Income <span className="text-red-500">*</span>
              </Label>
              <MoneyInput
                id={`monthlyAmount-${employmentRecord.id}`}
                value={formData.monthlyAmount}
                onChange={(value: number) => handleFieldChange('monthlyAmount', value)}
                placeholder="Enter monthly self-employment income"
              />
            </div>
            <div className="mt-3 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Self-Employment Income:</strong> Only monthly income is required for self-employed individuals.
              </p>
            </div>
          </div>
        ) : (
          // Regular employment: Show all income types (2 column layout)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Income */}
            <div>
              <Label htmlFor={`monthlyAmount-${employmentRecord.id}`}>
                Monthly Income <span className="text-red-500">*</span>
              </Label>
              <MoneyInput
                id={`monthlyAmount-${employmentRecord.id}`}
                value={formData.monthlyAmount}
                onChange={(value: number) => handleFieldChange('monthlyAmount', value)}
                placeholder="Enter monthly base income"
              />
            </div>

            {/* Bonus (Optional) */}
            <div>
              <Label htmlFor={`bonus-${employmentRecord.id}`}>
                Bonus (Optional)
              </Label>
              <MoneyInput
                id={`bonus-${employmentRecord.id}`}
                value={formData.bonus}
                onChange={(value: number) => handleFieldChange('bonus', value)}
                placeholder="Monthly bonus amount"
              />
            </div>

            {/* Commissions (Optional) */}
            <div>
              <Label htmlFor={`commissions-${employmentRecord.id}`}>
                Commissions (Optional)
              </Label>
              <MoneyInput
                id={`commissions-${employmentRecord.id}`}
                value={formData.commissions}
                onChange={(value: number) => handleFieldChange('commissions', value)}
                placeholder="Monthly commission income"
              />
            </div>

            {/* Overtime (Optional) */}
            <div>
              <Label htmlFor={`overtime-${employmentRecord.id}`}>
                Overtime (Optional)
              </Label>
              <MoneyInput
                id={`overtime-${employmentRecord.id}`}
                value={formData.overtime}
                onChange={(value: number) => handleFieldChange('overtime', value)}
                placeholder="Monthly overtime income"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ActiveIncomeCard;