import type { LLMAction, LLMResponse } from '@/types/voice-assistant'
import type { LLMApplicationState } from './types'
import { buildSystemPrompt } from './promptBuilder'
import { generateDefaultNextSteps } from './nextStepsGenerator'
import { DEFAULT_LLM_CONFIG } from './config'
import { logUsage } from '@/lib/usage'

/**
 * Process transcription with OpenAI GPT-4
 */
export async function processWithOpenAI(
  transcription: string, 
  currentState: LLMApplicationState,
  conversationHistory: any[] = []
): Promise<LLMResponse> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found')
  }
  
  try {
    const systemPrompt = buildSystemPrompt(currentState, conversationHistory)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEFAULT_LLM_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          // Include recent conversation history for context
          ...conversationHistory.slice(-4).map((msg: any) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.role === 'assistant' 
              ? `I updated: ${msg.updates?.join(', ') || 'acknowledged'}`
              : msg.content
          })),
          {
            role: 'user',
            content: `Extract mortgage application information from this spoken input:\n\n"${transcription}"`
          }
        ],
        temperature: DEFAULT_LLM_CONFIG.temperature,
        response_format: { type: 'json_object' }
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }
    
    const data = await response.json()
    const content = data.choices[0].message.content
    const result = JSON.parse(content)
    
    // Best-effort usage logging
    try {
      const promptTokens = data?.usage?.prompt_tokens ?? 0
      const completionTokens = data?.usage?.completion_tokens ?? 0
      const totalTokens = (promptTokens || 0) + (completionTokens || 0)
      await logUsage({
        clientId: currentState.activeClientId || 'unknown',
        service: 'openai',
        operation: 'chat.completions',
        units: totalTokens,
        metadata: {
          model: DEFAULT_LLM_CONFIG.model,
          promptTokens,
          completionTokens
        }
      })
    } catch {}
    
    // After parsing, analyze state if nextSteps is empty
    let nextSteps = result.nextSteps || ''
    
    if (!nextSteps) {
      nextSteps = generateDefaultNextSteps(currentState)
    }
    
    return {
      actions: result.actions || [],
      summary: result.summary || 'Information extracted',
      nextSteps: nextSteps
    }
  } catch (error) {
    console.error('OpenAI processing error:', error)
    throw error
  }
}
