'use client'

import { useEffect, useMemo } from 'react'
import { CheckCircle2, Plus, X } from 'lucide-react'
import { useApplicationStore } from '@/stores/applicationStore'
import { isAlphaName, validateEmail, validatePhoneLoose } from '@/lib/validators'
import type { ApplicationState } from '@/stores/applicationStore'
import type { ClientData } from '@/types/client-data'

/**
 * Tab data structure for the presentational component
 */
export interface ClientTab {
  id: string
  name: string
  complete: boolean
}

/**
 * Props for the presentational ClientTabs component
 * This component is "dumb" - it only receives data and callbacks via props
 */
export interface ClientTabsProps {
  tabs: ClientTab[]
  activeId: string
  onTabClick: (id: string) => void
  onAddClient: () => void
  onRemoveClient: (id: string) => void
}

/**
 * Presentational ClientTabs component
 * This is a "dumb" component that only displays data and calls callbacks
 * It has no knowledge of the store or state management
 */
export function ClientTabs({
  tabs,
  activeId,
  onTabClick,
  onAddClient,
  onRemoveClient
}: ClientTabsProps) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('client:active', { detail: { id: activeId } }))
  }, [activeId])

  const triggerValidationReveal = () => {
    window.dispatchEvent(new Event('application:attempt-continue'))
  }

  const handleTabClick = (id: string) => {
    triggerValidationReveal()
    onTabClick(id)
  }

  const handleAddClient = () => {
    triggerValidationReveal()
    onAddClient()
  }

  const handleRemoveClient = (id: string) => {
    triggerValidationReveal()
    onRemoveClient(id)
  }

  return (
    <div className="mb-4">
      <div role="tablist" aria-label="Applicants" className="flex border-b">
        {tabs.map(t => (
          <button
            role="tab"
            aria-selected={activeId === t.id}
            key={t.id}
            className={`px-4 py-2 -mb-px border-b-2 ${activeId === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => handleTabClick(t.id)}
          >
            <span className="inline-flex items-center gap-2">
              {t.complete ? <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="Complete" data-testid={`complete-check-${t.id}`} /> : null}
              <span>{t.name}</span>
            </span>
            {tabs.length > 1 && (
              <X className="inline h-4 w-4 text-red-500 ml-2" onClick={(e) => { e.stopPropagation(); handleRemoveClient(t.id) }} aria-label="Remove" />
            )}
          </button>
        ))}
        <button className="ml-auto px-3 py-2 text-sm underline" onClick={handleAddClient}>
          <Plus className="h-4 w-4 inline" /> Add A Client
        </button>
      </div>
    </div>
  )
}

/**
 * Helper function to calculate tab completeness
 * Extracted to keep business logic separate from presentation
 */
function calculateTabCompleteness(client: ClientData): boolean {
  return (
    isAlphaName(client.firstName) &&
    isAlphaName(client.lastName) &&
    validateEmail(client.email) &&
    validatePhoneLoose(client.phone) &&
    client.ssn.replace(/\D/g, '').length === 9 &&
    new Date(client.dob) <= new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())
  )
}

/**
 * Helper function to transform clients data into tabs
 * Extracted to keep data transformation logic separate
 */
function transformClientsToTabs(clients: { [id: string]: ClientData }): ClientTab[] {
  return Object.entries(clients).map(([id, data], index) => ({
    id,
    name: data.firstName || `Client ${index + 1}`,
    complete: calculateTabCompleteness(data),
  }))
}

/**
 * Container component that connects ClientTabs to the Zustand store
 * This is the "smart" component that handles state management
 * 
 * Uses separate selectors to avoid creating new object references on every render
 * This prevents infinite loops with Zustand's useSyncExternalStore
 */
export default function ClientTabsContainer() {
  // Use separate selectors - each returns a primitive or stable reference
  // This prevents the "getServerSnapshot should be cached" error
  const clients = useApplicationStore((state) => state.clients)
  const activeId = useApplicationStore((state) => state.activeClientId)

  // Access actions directly from store (non-reactive, stable references)
  // Using getState() ensures we don't subscribe to these (they're stable anyway)
  const setActiveClient = useApplicationStore.getState().setActiveClient
  const addClient = useApplicationStore.getState().addClient
  const removeClient = useApplicationStore.getState().removeClient

  // Transform clients data to tabs format
  // Only recalculates when clients object reference changes
  const tabs = useMemo(() => transformClientsToTabs(clients), [clients])

  // Handlers that connect store actions to component callbacks
  // These are stable because they only reference stable functions
  const handleTabClick = (id: string) => {
    setActiveClient(id)
  }

  const handleAddClient = () => {
    addClient()
  }

  const handleRemoveClient = (id: string) => {
    removeClient(id)
  }

  return (
    <ClientTabs
      tabs={tabs}
      activeId={activeId}
      onTabClick={handleTabClick}
      onAddClient={handleAddClient}
      onRemoveClient={handleRemoveClient}
    />
  )
}
