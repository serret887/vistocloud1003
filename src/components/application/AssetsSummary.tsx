'use client'

import { useMemo } from 'react'
import { useApplicationStore } from '@/stores/applicationStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AssetsSummary() {
  const { clients, getPerClientAssetTotals, getOverallAssetsTotal } = useApplicationStore()

  const perClientTotals = getPerClientAssetTotals()
  const overallTotal = getOverallAssetsTotal()

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)

  // Get detailed breakdown for each client
  const clientBreakdowns = useMemo(() => {
    return perClientTotals.map(({ clientId, total }) => {
      const client = clients[clientId]
      const clientName = client ? `${client.firstName} ${client.lastName}`.trim() : `Client ${clientId}`
      
      // Get assets for this client
      const clientAssets = useApplicationStore.getState().assetsData[clientId] || []
      
      // Group by category
      const categoryTotals: { [key: string]: number } = {}
      clientAssets.forEach(asset => {
        const category = asset.category
        categoryTotals[category] = (categoryTotals[category] || 0) + (Number(asset.amount) || 0)
      })

      const categoryLabels: { [key: string]: string } = {
        'BankAccount': 'Bank Account',
        'StocksAndBonds': 'Stocks & Bonds',
        'LifeInsurance': 'Life Insurance',
        'RetirementFund': 'Retirement Fund',
        'Gift': 'Gift',
        'Other': 'Other',
      }

      return {
        clientId,
        clientName,
        total,
        categories: Object.entries(categoryTotals).map(([category, amount]) => ({
          category: categoryLabels[category] || category,
          amount
        }))
      }
    })
  }, [perClientTotals, clients])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Assets Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {clientBreakdowns.map(({ clientId, clientName, total, categories }) => (
          <div key={clientId} className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Assets for {clientName}</div>
            {categories.map(({ category, amount }) => (
              <div key={category} className="flex justify-between text-sm">
                <span>{category}</span>
                <span>{fmt(amount)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        ))}
        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-4">
          <span>Grand Total</span>
          <span>{fmt(overallTotal)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
