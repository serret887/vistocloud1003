'use client'

import { useEffect, useMemo, useCallback } from 'react'
import { CheckCircle2, Plus, X } from 'lucide-react'
import { useApplicationStore } from '@/stores/applicationStore';
import { isAlphaName, validateEmail, validatePhoneLoose } from '@/lib/validators';
import type { ApplicationState } from '@/stores/applicationStore';


export default function ClientTabs() {
  // Optimize: Use a single selector to get all needed values at once
  // This prevents multiple rerenders when different parts of the store update
  const { clients, activeId, setActiveClient, addClientStore, removeClientStore } = useApplicationStore((state: ApplicationState) => ({
    clients: state.clients,
    activeId: state.activeClientId,
    setActiveClient: state.setActiveClient,
    addClientStore: state.addClient,
    removeClientStore: state.removeClient,
  }))
  
  // Memoize tabs calculation to prevent recalculation on every render
  const tabs = useMemo(() => {
    return Object.entries(clients).map(([id, data], index) => ({
      id,
      name: data.firstName || `Client ${index + 1}`,
      complete:
        isAlphaName(data.firstName) &&
        isAlphaName(data.lastName) &&
        validateEmail(data.email) &&
        validatePhoneLoose(data.phone) &&
        data.ssn.replace(/\D/g, '').length === 9 &&
        new Date(data.dob) <= new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()),
    }))
  }, [clients])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('client:active', { detail: { id: activeId } }))
  }, [activeId])

  const triggerValidationReveal = useCallback(() => {
    window.dispatchEvent(new Event('application:attempt-continue'))
  }, [])

  const addClient = useCallback(() => {
    triggerValidationReveal()
    addClientStore();
  }, [triggerValidationReveal, addClientStore])

  const removeClient = useCallback((id: string) => {
    triggerValidationReveal()
    removeClientStore(id);
  }, [triggerValidationReveal, removeClientStore])

  return (
    <div className="mb-4">
      <div role="tablist" aria-label="Applicants" className="flex border-b">
        {tabs.map(t => (
          <button
            role="tab"
            aria-selected={activeId === t.id}
            key={t.id}
            className={`px-4 py-2 -mb-px border-b-2 ${activeId === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => { triggerValidationReveal(); setActiveClient(t.id) }}
          >
            <span className="inline-flex items-center gap-2">
              {t.complete ? <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="Complete" data-testid={`complete-check-${t.id}`} /> : null}
              <span>{t.name}</span>
            </span>
            {tabs.length > 1 && (
              <X className="inline h-4 w-4 text-red-500 ml-2" onClick={(e) => { e.stopPropagation(); removeClient(t.id) }} aria-label="Remove" />
            )}
          </button>
        ))}
        <button className="ml-auto px-3 py-2 text-sm underline" onClick={addClient}><Plus className="h-4 w-4 inline" /> Add A Client</button>
      </div>
    </div>
  )
}
