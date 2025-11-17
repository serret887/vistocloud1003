'use client'

import { useState, useEffect } from 'react'
import { Wallet, Plus, Trash2, Edit2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoneyInput } from '@/components/ui/fields/MoneyInput'
import { useApplicationStore } from '@/stores/applicationStore'
import type { AssetRecord, AssetCategory } from '@/types/assets'

type Props = { clientId: string }

export default function AssetsCard({ clientId }: Props) {
  const { getAssets, addAsset, updateAsset, removeAsset } = useApplicationStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const assets = getAssets(clientId)

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

  const categoryOptions: { value: AssetCategory; label: string }[] = [
    { value: 'BankAccount', label: 'Bank Account' },
    { value: 'StocksAndBonds', label: 'Stocks & Bonds' },
    { value: 'LifeInsurance', label: 'Life Insurance' },
    { value: 'RetirementFund', label: 'Retirement Fund' },
    { value: 'Gift', label: 'Gift' },
    { value: 'Other', label: 'Other' },
  ]

  const getTypeOptions = (category: AssetCategory) => {
    switch (category) {
      case 'BankAccount': return ['Checking', 'Savings', 'Money Market']
      case 'StocksAndBonds': return ['Stocks', 'Bonds', 'Mutual Fund']
      case 'LifeInsurance': return ['Policy']
      case 'RetirementFund': return ['401k', 'IRA', 'Pension']
      case 'Gift': return ['Cash Gift', 'Equity Gift', 'Grant']
      case 'Other': return ['Earnest Money Deposit', 'Secured Borrowed Funds Not Deposited', 'Bridge Loan Not Deposited']
      default: return []
    }
  }

  const handleAddAsset = (formData: Partial<AssetRecord>) => {
    const id = addAsset(clientId)
    // Update the newly created asset with the form data
    updateAsset(clientId, id, {
      category: formData.category || 'BankAccount',
      type: formData.type || 'Checking',
      amount: formData.amount || 0,
      institutionName: formData.institutionName || '',
      accountNumber: formData.accountNumber || '',
      source: formData.source || '',
    })
    setShowAddForm(false)
  }

  const handleUpdateAsset = (id: string, updates: Partial<AssetRecord>) => {
    updateAsset(clientId, id, updates)
    setEditingId(null)
  }

  const handleDeleteAsset = (id: string) => {
    removeAsset(clientId, id)
  }

  return (
    <div className="space-y-4">
      {/* Assets Table Card */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Assets</span>
            </div>
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Asset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Asset Form */}
          {showAddForm && (
            <div className="mb-4">
              <AssetForm
                onSubmit={handleAddAsset}
                onCancel={() => setShowAddForm(false)}
                categoryOptions={categoryOptions}
                getTypeOptions={getTypeOptions}
              />
            </div>
          )}

          {/* Assets Table */}
          <div className="space-y-2">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                {editingId === asset.id ? (
                  <div className="flex-1">
                    <AssetForm
                      asset={asset}
                      onSubmit={(updates) => handleUpdateAsset(asset.id, updates)}
                      onCancel={() => setEditingId(null)}
                      categoryOptions={categoryOptions}
                      getTypeOptions={getTypeOptions}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div className="font-medium">{categoryOptions.find(c => c.value === asset.category)?.label}</div>
                      <div className="text-muted-foreground">{asset.type}</div>
                      <div className="text-muted-foreground">
                        {asset.category === 'Gift' ? asset.source : asset.institutionName}
                      </div>
                      <div className="font-bold text-right">{fmt(asset.amount)}</div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(asset.id)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(asset.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {assets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No assets added yet. Click &quot;Add Asset&quot; to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

type AssetFormProps = {
  asset?: AssetRecord
  onSubmit: (data: Partial<AssetRecord>) => void
  onCancel: () => void
  categoryOptions: { value: AssetCategory; label: string }[]
  getTypeOptions: (category: AssetCategory) => string[]
}

function AssetForm({ asset, onSubmit, onCancel, categoryOptions, getTypeOptions }: AssetFormProps) {
  const initialCategory = asset?.category || 'BankAccount'
  const initialTypeOptions = getTypeOptions(initialCategory)
  const initialType = asset?.type || initialTypeOptions[0]

  const [formData, setFormData] = useState({
    category: initialCategory,
    type: initialType,
    amount: asset?.amount || 0,
    institutionName: asset?.institutionName || '',
    accountNumber: asset?.accountNumber || '',
    source: asset?.source || '',
  })

  const typeOptions = getTypeOptions(formData.category as AssetCategory)

  // Ensure the current type is valid for the selected category
  useEffect(() => {
    if (!typeOptions.includes(formData.type)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({ ...prev, type: typeOptions[0] }))
    }
  }, [formData.category, typeOptions, formData.type])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as AssetCategory, type: getTypeOptions(value as AssetCategory)[0] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {typeOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(formData.category !== 'Gift' && formData.category !== 'Other') && (
          <div>
            <Label>Institution</Label>
            <Input value={formData.institutionName} onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })} />
          </div>
        )}
        {formData.category === 'BankAccount' && (
          <div>
            <Label>Account Number (optional)</Label>
            <Input value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} />
          </div>
        )}
        {formData.category === 'Gift' && (
          <div>
            <Label>Source</Label>
            <Input value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />
          </div>
        )}
        <div>
          <Label>Amount</Label>
          <MoneyInput value={formData.amount} onChange={(value: number) => setFormData({ ...formData, amount: value })} placeholder="0" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
