'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApplicationStore } from '@/stores/applicationStore'

type Props = { clientId: string }

// Create a stable empty array to avoid reference issues
const EMPTY_ARRAY: any[] = []

export default function ClientAssetsSummary({ clientId }: Props) {
  // Optimize: Use a single selector to get both values at once
  const { assets, client } = useApplicationStore(state => ({
    assets: state.assetsData[clientId] ?? EMPTY_ARRAY,
    client: state.clients[clientId]
  }))

  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: number } = {}
    assets.forEach(asset => {
      const category = asset.category
      totals[category] = (totals[category] || 0) + (Number(asset.amount) || 0)
    })
    return totals
  }, [assets]) // 'assets' is now a direct state slice, so useMemo will react to its reference changes

  const totalAmount = useMemo(() => {
    return assets.reduce((sum, asset) => sum + (Number(asset.amount) || 0), 0)
  }, [assets]) // 'assets' is now a direct state slice, so useMemo will react to its reference changes

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

  const categoryLabels: { [key: string]: string } = {
    'BankAccount': 'Bank Account',
    'StocksAndBonds': 'Stocks & Bonds',
    'LifeInsurance': 'Life Insurance',
    'RetirementFund': 'Retirement Fund',
    'Gift': 'Gift',
    'Other': 'Other',
  }

  const clientName = client ? `${client.firstName} ${client.lastName}`.trim() : `Client ${clientId}`

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          Assets for {clientName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(categoryTotals).map(([category, amount]) => (
          <div key={category} className="flex items-center justify-between">
            <div className="text-sm font-medium">{categoryLabels[category] || category}</div>
            <div className="font-bold">{fmt(amount)}</div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-base font-semibold">Total</div>
          <div className="text-lg font-bold">{fmt(totalAmount)}</div>
        </div>
      </CardContent>
    </Card>
  )
}
