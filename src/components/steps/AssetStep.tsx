'use client'

import ClientTabs from './ClientTabs'
import AssetsCard from '@/components/application/AssetsCard'
import AssetsSummary from '@/components/application/AssetsSummary'
import { useApplicationStore } from '@/stores/applicationStore'

export default function AssetStep() {
  const activeClientId = useApplicationStore((s) => s.activeClientId)

  return (
    <div className="space-y-4">
      <ClientTabs />
      <AssetsCard clientId={activeClientId} />
      <AssetsSummary />
    </div>
  )
}

