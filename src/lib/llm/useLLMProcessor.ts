'use client'

import { useState, useCallback } from 'react'
import { useApplicationStore } from '@/stores/applicationStore'
import type { VoiceUpdate } from '@/types/voice-assistant'
import type { LLMApplicationState, DynamicIdMap } from './types'
import { processWithOpenAI } from './openaiProcessor'
import { resolveAddressesInActions } from './addressResolver'
import { filterDuplicateActions } from './duplicateFilter'
import { executeStoreAction } from './actionExecutor'
import { generateDefaultNextSteps } from './nextStepsGenerator'

/**
 * Main LLM processing hook
 */
export function useLLMProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const store = useApplicationStore()
  
  const processTranscription = useCallback(async (
    transcription: string, 
    conversationHistory: any[] = []
  ): Promise<{ updates: VoiceUpdate[], nextSteps?: string }> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Clear dynamic ID map for fresh processing
      const dynamicIdMap: DynamicIdMap = new Map()
      
      // Get current application state for context
      const currentState: LLMApplicationState = {
        clients: store.clients,
        activeClientId: store.activeClientId,
        employmentData: store.employmentData,
        incomeData: {
          active: store.activeIncomeData,
          passive: store.passiveIncomeData,
          totals: store.incomeTotals
        },
        realEstateData: store.realEstateData,
        assetsData: store.assetsData,
        addressData: store.addressData
      }
      
      // Process with OpenAI
      const llmResponse = await processWithOpenAI(transcription, currentState, conversationHistory)
      
      console.log('🤖 LLM Response:', JSON.stringify(llmResponse, null, 2))
      
      // Execute the actions returned by the LLM with duplicate detection
      const newUpdates: VoiceUpdate[] = []
      
      // Filter out duplicate actions before executing
      const filteredActions = filterDuplicateActions(llmResponse.actions, store)
      console.log('🔍 Original actions:', llmResponse.actions.length)
      console.log('✅ Filtered actions:', filteredActions.length)
      console.log('🚫 Duplicates filtered:', llmResponse.actions.length - filteredActions.length)
      console.log('🔍 All actions:', llmResponse.actions)
      console.log('🔍 Filtered actions:', filteredActions)
      
      // Resolve addresses in actions
      const resolvedActions = await resolveAddressesInActions(filteredActions)
      
      // Execute each action
      for (const action of resolvedActions) {
        const update = executeStoreAction(action, store, dynamicIdMap)
        if (update) {
          newUpdates.push(update)
        }
      }
      
      // Use LLM provided nextSteps if available, otherwise generate default next steps
      let finalNextSteps = llmResponse.nextSteps
      
      // If LLM didn't provide nextSteps or provided empty/whitespace-only nextSteps, generate default
      if (!finalNextSteps || finalNextSteps.trim() === '') {
        const updatedState: LLMApplicationState = {
          clients: store.clients,
          activeClientId: store.activeClientId,
          employmentData: store.employmentData,
          incomeData: {
            active: store.activeIncomeData,
            passive: store.passiveIncomeData,
            totals: store.incomeTotals
          },
          realEstateData: store.realEstateData,
          assetsData: store.assetsData,
          addressData: store.addressData
        }
        finalNextSteps = generateDefaultNextSteps(updatedState)
      }
      
      return {
        updates: newUpdates,
        nextSteps: finalNextSteps
      }
      
    } catch (err) {
      console.error('LLM processing error:', err)
      setError('Failed to process your input. Please try again.')
      return { updates: [], nextSteps: undefined }
    } finally {
      setIsProcessing(false)
    }
  }, [store])
  
  return {
    isProcessing,
    error,
    processTranscription
  }
}
