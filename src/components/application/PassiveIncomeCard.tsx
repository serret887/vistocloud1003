// PassiveIncomeCard component
// Displays and manages passive income records (always shown)
'use client'

import { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoneyInput } from '@/components/ui/fields/MoneyInput';
import { useApplicationStore } from '@/stores/applicationStore';
import type { PassiveIncomeRecord, PassiveIncomeType } from '@/types/income';
import { PASSIVE_INCOME_TYPE_LABELS } from '@/types/income';

interface PassiveIncomeCardProps {
  clientId: string;
}

export function PassiveIncomeCard({ clientId }: PassiveIncomeCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sourceType: '' as PassiveIncomeType,
    monthlyAmount: 0
  });

  const {
    getPassiveIncomeRecords,
    addPassiveIncome,
    updatePassiveIncome,
    removePassiveIncome
  } = useApplicationStore();

  const passiveIncomeRecords = getPassiveIncomeRecords(clientId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAdd = () => {
    if (!formData.sourceType || !formData.monthlyAmount) return;

    const id = addPassiveIncome(clientId);
    // Update the newly created record with the form data
    updatePassiveIncome(clientId, id, {
      sourceType: formData.sourceType,
      sourceName: PASSIVE_INCOME_TYPE_LABELS[formData.sourceType],
      monthlyAmount: formData.monthlyAmount
    });
    setFormData({ sourceType: '' as PassiveIncomeType, monthlyAmount: 0 });
    setIsAdding(false);
  };

  const handleEdit = (record: PassiveIncomeRecord) => {
    setEditingId(record.id);
    setFormData({
      sourceType: record.sourceType,
      monthlyAmount: record.monthlyAmount
    });
  };

  const handleUpdate = () => {
    if (!editingId || !formData.sourceType || !formData.monthlyAmount) return;

    updatePassiveIncome(clientId, editingId, {
      sourceType: formData.sourceType,
      sourceName: PASSIVE_INCOME_TYPE_LABELS[formData.sourceType],
      monthlyAmount: formData.monthlyAmount
    });

    setEditingId(null);
    setFormData({ sourceType: '' as PassiveIncomeType, monthlyAmount: 0 });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ sourceType: '' as PassiveIncomeType, monthlyAmount: 0 });
  };

  const handleDelete = (recordId: string) => {
    removePassiveIncome(clientId, recordId);
  };

  const totalMonthlyIncome = passiveIncomeRecords.reduce((sum, record) => sum + record.monthlyAmount, 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Passive Income</span>
          </CardTitle>
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            disabled={isAdding || editingId !== null}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Income
          </Button>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-600">
            {passiveIncomeRecords.length} income source{passiveIncomeRecords.length !== 1 ? 's' : ''}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalMonthlyIncome)}
            </div>
            <div className="text-sm text-gray-600">per month</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add form */}
        {isAdding && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Add Passive Income</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sourceType">Income Type</Label>
                <Select value={formData.sourceType} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, sourceType: value as PassiveIncomeType }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PASSIVE_INCOME_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="monthlyAmount">Monthly Amount</Label>
                <MoneyInput
                  id="monthlyAmount"
                  value={formData.monthlyAmount}
                  onChange={(value) => setFormData(prev => ({ ...prev, monthlyAmount: value }))}
                  placeholder="Enter monthly amount"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button onClick={handleAdd} size="sm" className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Income Records Table */}
        {passiveIncomeRecords.length > 0 && (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-2 gap-4 pb-2 border-b border-gray-200">
              <div className="font-medium text-gray-900">Income Type</div>
              <div className="font-medium text-gray-900 text-right">Monthly Amount</div>
            </div>

            {/* Table Rows */}
            {passiveIncomeRecords.map((record) => (
              <div key={record.id}>
                {editingId === record.id ? (
                  // Edit mode
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Edit Passive Income</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editSourceType">Income Type</Label>
                        <Select value={formData.sourceType} onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, sourceType: value as PassiveIncomeType }))
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Select income type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PASSIVE_INCOME_TYPE_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="editMonthlyAmount">Monthly Amount</Label>
                        <MoneyInput
                          id="editMonthlyAmount"
                          value={formData.monthlyAmount}
                          onChange={(value) => setFormData(prev => ({ ...prev, monthlyAmount: value }))}
                          placeholder="Enter monthly amount"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleUpdate} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100 hover:bg-gray-50 rounded">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-gray-900">{PASSIVE_INCOME_TYPE_LABELS[record.sourceType]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 ml-auto">
                        {formatCurrency(record.monthlyAmount)}
                      </span>
                      <div className="flex items-center space-x-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No income state */}
        {passiveIncomeRecords.length === 0 && !isAdding && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Passive Income Added
            </h3>
            <p className="text-gray-600 mb-4">
              Add income from investments, rentals, or other non-employment sources.
            </p>
            <Button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Passive Income
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PassiveIncomeCard;