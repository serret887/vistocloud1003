import { useMemo } from 'react'
import type { ApplicationStepDefinition, ApplicationStepState, ProgressSummary, ApplicationStepId } from '../models/application'

export function computeProgress(
  stepDefinitions: ApplicationStepDefinition[],
  stepStates: ApplicationStepState[]
): ProgressSummary {
  const perStep: Record<ApplicationStepId, number> = {} as Record<ApplicationStepId, number>
  let completedSteps = 0
  let totalSteps = 0

  // Only count steps that can be completed (exclude review)
  // const completableSteps = stepDefinitions.filter(step => step.id !== 'review')

  for (const def of stepDefinitions) {
    const state = stepStates.find(s => s.id === def.id)
    const pct = Math.max(0, Math.min(100, state?.completionPercentage ?? 0))
    perStep[def.id] = pct
    
    // Only count completable steps for overall progress
    if (def.id !== 'review') {
      totalSteps++
      if (pct === 100) {
        completedSteps++
      }
    }
  }

  // Overall progress is simply: (completed steps / total steps) * 100
  const overallPercentage = totalSteps > 0
    ? Math.round((completedSteps / totalSteps) * 100)
    : 0

  return { overallPercentage, perStep }
}

export function useApplicationProgress(
  stepDefinitions: ApplicationStepDefinition[],
  stepStates: ApplicationStepState[]
): ProgressSummary {
  return useMemo(() => computeProgress(stepDefinitions, stepStates), [stepDefinitions, stepStates])
}
