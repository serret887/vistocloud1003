export interface VoiceUpdate {
  description: string
  field?: string
  timestamp?: string
  clientName?: string
  updates?: Record<string, any>
  type?: 'client' | 'employment' | 'address' | 'income' | 'asset' | 'realEstate'
}

export interface LLMAction {
  action: string
  params: Record<string, any>
  returnId?: string
}

export interface LLMResponse {
  actions: LLMAction[]
  summary: string
  nextSteps?: string
  validationErrors?: Array<{
    action: string
    errors: string[]
    warnings: string[]
  }>
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  updates?: string[]
}

