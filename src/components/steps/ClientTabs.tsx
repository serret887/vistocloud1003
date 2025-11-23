'use client'

import { useEffect } from 'react'
import { CheckCircle2, Plus, X } from 'lucide-react'
import { useApplicationStore } from '@/stores/applicationStore';
import { isAlphaName, validateEmail, validatePhoneLoose } from '@/lib/validators';
import type { ApplicationState } from '@/stores/applicationStore';


export default function ClientTabs() {
  const clients = useApplicationStore((state: ApplicationState) => state.clients);
  const tabs = Object.entries(clients).map(([id, data], index) => ({
    id,
    name: data.firstName || `Client ${index + 1}`,
    complete:
      isAlphaName(data.firstName) &&
      isAlphaName(data.lastName) &&
      validateEmail(data.email) &&
      validatePhoneLoose(data.phone) &&
      data.ssn.replace(/\D/g, '').length === 9 &&
      new Date(data.dob) <= new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()),
  }));
  // Use store's activeClientId and setActiveClient
  const activeId = useApplicationStore((state: ApplicationState) => state.activeClientId);
  const setActiveClient = useApplicationStore((state) => state.setActiveClient);
  const addClientStore = useApplicationStore((state) => state.addClient);
  const removeClientStore = useApplicationStore((state) => state.removeClient);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('client:active', { detail: { id: activeId } }))
  }, [activeId])

  function addClient() {
    triggerValidationReveal()
    addClientStore();
  }

  function removeClient(id: string) {
    triggerValidationReveal()
    removeClientStore(id);
  }

  function triggerValidationReveal() {
    window.dispatchEvent(new Event('application:attempt-continue'))
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
