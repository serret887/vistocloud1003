import { useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { ApplicationStepDefinition, ApplicationStepState, ApplicationStepId } from '@/models/application'

// Pure functions for step navigation logic
export function isStepEnabledPure(
  stepDefinitions: ApplicationStepDefinition[],
  states: ApplicationStepState[],
  stepId: ApplicationStepId
): boolean {
  const stepIndex = stepDefinitions.findIndex(s => s.id === stepId)
  if (stepIndex === -1) return false
  
  // First step is always enabled
  if (stepIndex === 0) return true
  
  // Check if previous step is complete
  const previousStep = stepDefinitions[stepIndex - 1]
  const previousState = states.find(s => s.id === previousStep.id)
  return previousState?.completionPercentage === 100 || false
}

export function getNextPure(
  stepDefinitions: ApplicationStepDefinition[],
  states: ApplicationStepState[],
  currentStepId: ApplicationStepId
): ApplicationStepId | undefined {
  const currentIndex = stepDefinitions.findIndex(s => s.id === currentStepId)
  if (currentIndex === -1 || currentIndex >= stepDefinitions.length - 1) return undefined
  
  const nextStep = stepDefinitions[currentIndex + 1]
  return isStepEnabledPure(stepDefinitions, states, nextStep.id) ? nextStep.id : undefined
}

export function getPrevPure(
  stepDefinitions: ApplicationStepDefinition[],
  states: ApplicationStepState[],
  currentStepId: ApplicationStepId
): ApplicationStepId | undefined {
  const currentIndex = stepDefinitions.findIndex(s => s.id === currentStepId)
  if (currentIndex <= 0) return undefined
  
  return stepDefinitions[currentIndex - 1].id
}

// Hook for step navigation
export function useStepNavigation(
  stepDefinitions: ApplicationStepDefinition[],
  states: ApplicationStepState[],
  currentStepId: ApplicationStepId
) {
  const router = useRouter()
  const pathname = usePathname()

  const isStepEnabled = useCallback((stepId: ApplicationStepId) => {
    return isStepEnabledPure(stepDefinitions, states, stepId)
  }, [stepDefinitions, states])

  const getNext = useCallback(() => {
    return getNextPure(stepDefinitions, states, currentStepId)
  }, [stepDefinitions, states, currentStepId])

  const getPrev = useCallback(() => {
    return getPrevPure(stepDefinitions, states, currentStepId)
  }, [stepDefinitions, states, currentStepId])

  const canProceed = useCallback(() => {
    // For now, always allow proceeding
    // In the future, this could check if the current step is complete
    return true
  }, [])

  const attemptContinue = useCallback(() => {
    // This will be called by the application to check if the step can continue
    // The step component should handle the actual validation
    return true
  }, [])

  const goToNextStep = useCallback(() => {
    // Navigate to the next step in the application flow
    const currentPath = pathname
    const stepOrder = [
      '/application/client-info',
      '/application/employment',
      '/application/income',
      '/application/real-estate',
      '/application/credit',
      '/application/documents'
    ]
    
    const currentIndex = stepOrder.indexOf(currentPath)
    if (currentIndex >= 0 && currentIndex < stepOrder.length - 1) {
      router.push(stepOrder[currentIndex + 1])
    }
  }, [router, pathname])

  const goToPreviousStep = useCallback(() => {
    // Navigate to the previous step in the application flow
    const currentPath = pathname
    const stepOrder = [
      '/application/client-info',
      '/application/employment',
      '/application/income',
      '/application/real-estate',
      '/application/credit',
      '/application/documents'
    ]
    
    const currentIndex = stepOrder.indexOf(currentPath)
    if (currentIndex > 0) {
      router.push(stepOrder[currentIndex - 1])
    }
  }, [router, pathname])

  const isStepComplete = useCallback((stepId: string) => {
    // For now, always return true
    // In the future, this could check if the step is actually complete
    return true
  }, [])

  return {
    isStepEnabled,
    getNext,
    getPrev,
    canProceed,
    attemptContinue,
    goToNextStep,
    goToPreviousStep,
    isStepComplete
  }
}