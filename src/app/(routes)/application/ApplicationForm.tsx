'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAutoSave } from '../../hooks/useAutoSave'
import { useApplicationProgress } from '../../hooks/useApplicationProgress'
import { useStepNavigation } from '../../hooks/useStepNavigation'
import { useStepCompletion } from '../../hooks/useStepCompletion'
import type { ApplicationStepDefinition, ApplicationStepState, ApplicationStepId } from '../../models/application'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { announce } from '@/lib/a11yFocus'
import { stepIdToPath } from './stepPaths'
import { useApplicationStore } from '@/stores/applicationStore'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ApplicationSidebar } from '@/components/application/ApplicationSidebar'

const stepDefinitions: ApplicationStepDefinition[] = [
  { id: 'client-info', title: 'Client Information', description: 'Personal details', estimatedTime: '2 min', fields: [] },
  { id: 'employment', title: 'Employment', description: 'Employment', estimatedTime: '5 min', fields: [] },
  { id: 'income', title: 'Income', description: 'Financial info', estimatedTime: '4 min', fields: [] },
  { id: 'assets', title: 'Assets', description: 'Assets Owned', estimatedTime: '6 min', fields: [] },
  { id: 'real-estate', title: 'Real Estate Owned', description: 'Properties', estimatedTime: '4 min', fields: [] },
  { id: 'documents', title: 'Documentation', description: 'Required documents', estimatedTime: '10 min', fields: [] },
  { id: 'dictate', title: 'Voice Dictation', description: 'Fill by voice', estimatedTime: '5 min', fields: [] },
  { id: 'review', title: 'Review & Submit', description: 'Review all information', estimatedTime: '3 min', fields: [] },
]

  // Time weights for progress calculation (in minutes)
  // const stepTimeWeights: Record<string, number> = {
  //   'client-info': 2,
  //   'employment': 5,
  //   'income': 4,
  //   'assets': 6,
  //   'real-estate': 4,
  //   'documents': 10,
  //   'review': 3
  // }

export default function ApplicationForm({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { getStepCompletion } = useStepCompletion()
  const { loadApplicationFromFirestore, setCurrentApplicationId, currentApplicationId } = useApplicationStore()

  const [states, setStates] = useState<ApplicationStepState[]>(
    stepDefinitions.map(s => ({ id: s.id, status: 'pending', completionPercentage: 0, errorCount: 0 }))
  )

  // Load application data from Firestore when appId is present in URL
  useEffect(() => {
    const appId = searchParams.get('appId')
    if (appId && appId !== currentApplicationId) {
      loadApplicationFromFirestore(appId).catch(err => {
        console.error('Failed to load application:', err)
      })
    } else if (!appId && currentApplicationId) {
      // Clear application ID if no appId in URL
      setCurrentApplicationId(null)
    }
  }, [searchParams, currentApplicationId, loadApplicationFromFirestore, setCurrentApplicationId])

  const currentStepId: ApplicationStepId = useMemo(() => {
    const match = Object.entries(stepIdToPath).find(([, path]) => pathname.startsWith(path))
    return (match?.[0] as ApplicationStepId) ?? 'client-info'
  }, [pathname])

  const progress = useApplicationProgress(stepDefinitions, states)
  const { isStepEnabled, getNext, getPrev } = useStepNavigation(stepDefinitions, states, currentStepId)

  const data = useMemo(() => ({ states }), [states])


  // Update progress based on form completion - make it reactive to store changes
  useEffect(() => {
    const updateProgress = () => {
      setStates(prevStates => {
        const newStates = prevStates.map(state => {
          const completion = getStepCompletion(state.id)
          // Only update if the completion percentage actually changed
          if (state.completionPercentage !== completion.completionPercentage || 
              state.errorCount !== completion.errorCount) {
            return {
              ...state,
              completionPercentage: completion.completionPercentage,
              errorCount: completion.errorCount
            }
          }
          return state
        })
        
        // Only update if something actually changed
        const hasChanges = newStates.some((newState, index) => 
          newState.completionPercentage !== prevStates[index].completionPercentage ||
          newState.errorCount !== prevStates[index].errorCount
        )
        
        return hasChanges ? newStates : prevStates
      })
    }

    // Update progress immediately
    updateProgress()

    // Set up interval to update progress more frequently for real-time updates
    const interval = setInterval(updateProgress, 1000) // Check every second

    return () => clearInterval(interval)
  }, [getStepCompletion]) // Add getStepCompletion dependency to make it reactive

  function goToStep(stepId: ApplicationStepId | undefined) {
    if (!stepId) return
    if (!isStepEnabled(stepId)) return
    const appId = searchParams.get('appId')
    const url = appId ? `${stepIdToPath[stepId]}?appId=${appId}` : stepIdToPath[stepId]
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
