'use client'

import { useEffect, useMemo, useState } from 'react'
import { useApplicationProgress } from '../../hooks/useApplicationProgress'
import { useStepNavigation } from '../../hooks/useStepNavigation'
import { useStepCompletion } from '../../hooks/useStepCompletion'
import type { ApplicationStepState, ApplicationStepId } from '../../models/application'
import { usePathname, useRouter, useParams } from 'next/navigation'
import { announce } from '@/lib/a11yFocus'
import { getStepPath, getStepIdFromPath, stepDefinitions } from '@/lib/applicationSteps'
import { useApplicationStore } from '@/stores/applicationStore'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ApplicationSidebar } from '@/components/application/ApplicationSidebar'

export default function ApplicationForm({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<{ appId?: string }>()
  const appId = params?.appId ?? null
  const { getStepCompletion } = useStepCompletion()
  const loadApplicationFromFirestore = useApplicationStore(state => state.loadApplicationFromFirestore)
  const setCurrentApplicationId = useApplicationStore(state => state.setCurrentApplicationId)
  const currentApplicationId = useApplicationStore(state => state.currentApplicationId)

  const [states, setStates] = useState<ApplicationStepState[]>(
    stepDefinitions.map(s => ({ id: s.id, status: 'pending', completionPercentage: 0, errorCount: 0 }))
  )

  // Load application data from Firestore when appId is present in URL
  useEffect(() => {
    if (appId && appId !== currentApplicationId) {
      loadApplicationFromFirestore(appId).catch(err => {
        console.error('Failed to load application:', err)
      })
    } else if (!appId && currentApplicationId) {
      // Clear application ID if no appId in URL
      setCurrentApplicationId(null)
    }
  }, [appId, currentApplicationId, loadApplicationFromFirestore, setCurrentApplicationId])

  const currentStepId: ApplicationStepId = useMemo(() => {
    return getStepIdFromPath(pathname)
  }, [pathname])

  const progress = useApplicationProgress(stepDefinitions, states)
  const { isStepEnabled, getNext, getPrev } = useStepNavigation(stepDefinitions, states, currentStepId)

  // Update progress when the store changes instead of polling
  useEffect(() => {
    const updateProgress = () => {
      setStates(prevStates => {
        const newStates = prevStates.map(state => {
          const completion = getStepCompletion(state.id)
          if (
            state.completionPercentage !== completion.completionPercentage ||
            state.errorCount !== completion.errorCount
          ) {
            return {
              ...state,
              completionPercentage: completion.completionPercentage,
              errorCount: completion.errorCount,
            }
          }
          return state
        })
        
        const hasChanges = newStates.some((newState, index) => 
          newState.completionPercentage !== prevStates[index].completionPercentage ||
          newState.errorCount !== prevStates[index].errorCount
        )
        
        return hasChanges ? newStates : prevStates
      })
    }

    updateProgress()
    const unsubscribe = useApplicationStore.subscribe(updateProgress)
    return () => unsubscribe()
  }, [getStepCompletion])

  function goToStep(stepId: ApplicationStepId | undefined) {
    if (!stepId || !appId) return
    if (!isStepEnabled(stepId)) return
    const url = getStepPath(appId, stepId)
    router.push(url)
    announce(`Navigated to ${stepDefinitions.find(s => s.id === stepId)?.title ?? 'next step'}`)
  }

  function tryContinue(): void {
    // Validate current step before continuing
    const currentStepCompletion = getStepCompletion(currentStepId)
    console.log(`Validating step ${currentStepId}: ${currentStepCompletion.completionPercentage}% complete`)
    
    // Update the current step's progress
    setStates(prevStates => 
      prevStates.map(state => 
        state.id === currentStepId 
          ? { ...state, completionPercentage: currentStepCompletion.completionPercentage, errorCount: currentStepCompletion.errorCount }
          : state
      )
    )
    
    const ev = new Event('application:attempt-continue', { cancelable: true })
    const ok = window.dispatchEvent(ev)
    if (!ok) return
    const nextId = getNext()
    goToStep(nextId)
  }

  const prevId = getPrev()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "25%",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      <ApplicationSidebar stepStates={states} overallProgress={progress.overallPercentage} />
      <div className="flex h-screen w-full">
        {/* Main Content Area - 50% (middle) */}
        <main className="flex flex-col w-[50%] ml-[25%]">
          <div className="flex items-center gap-3 p-5 border-b bg-background">
            <SidebarTrigger className="h-9 w-9" />
            <h1 className="text-xl font-semibold">
              {stepDefinitions.find(s => s.id === currentStepId)?.title ?? 'Application'}
            </h1>
          </div>
          <div className="flex-1 p-6 overflow-auto bg-background">
            {children}
        </div>
          <footer className="p-5 bg-background border-t flex gap-3 justify-end">
            <button 
              onClick={() => goToStep(prevId)} 
              disabled={!prevId}
              className="px-6 py-2.5 text-base rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={tryContinue}
              className="px-6 py-2.5 text-base rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
           </footer>
        </main>
        {/* Right Side - 25% (reserved for future use) */}
        <aside className="w-[25%] border-l border-border bg-background">
          {/* Reserved for future content */}
        </aside>
      </div>
    </SidebarProvider>
  )
}
