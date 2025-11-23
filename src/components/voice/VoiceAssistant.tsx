'use client'

import { useState, useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, User, Briefcase, DollarSign, Home, Mic } from 'lucide-react'
import { useVoiceRecording } from '@/hooks/useVoiceRecording'
import { useLLMProcessor } from '@/hooks/useLLMProcessor'
import { useApplicationStore } from '@/stores/applicationStore'
import { Message, MessageAvatar, MessageContent } from '@/components/ui/shadcn-io/ai/message'
import { formatValueForDisplay } from '@/lib/addressFormatter'
import { 
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit
} from '@/components/ui/shadcn-io/ai/prompt-input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { ChatMessage } from '@/types/voice-assistant'

const suggestionCards = [
  {
    icon: User,
    title: 'Client Information',
    description: 'Add client personal details',
    color: 'from-amber-400 to-orange-500'
  },
  {
    icon: Briefcase,
    title: 'Employment',
    description: 'Add employment history',
    color: 'from-blue-400 to-blue-600'
  },
  {
    icon: DollarSign,
    title: 'Income & Assets',
    description: 'Add financial information',
    color: 'from-green-400 to-green-600'
  },
  {
    icon: Home,
    title: 'Property Details',
    description: 'Add real estate information',
    color: 'from-purple-400 to-purple-600'
  }
]

export function VoiceAssistant() {
  const store = useApplicationStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>('ready')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isHoldingRef = useRef(false)
  
  // Load chat history on mount
  useEffect(() => {
    const history = store.getChatHistory()
    if (history.length > 0) {
      // Ensure timestamps are Date objects (they may be strings when loaded from storage)
      const messagesWithDates = history.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      }))
      setMessages(messagesWithDates)
    }
  }, [store])
  
  const { 
    isRecording,
    isTranscribing,
    startRecording, 
    stopRecording,
    error: recordingError 
  } = useVoiceRecording()
  
  const {
    isProcessing,
    error: processingError,
    processTranscription
  } = useLLMProcessor()
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isProcessing])
  
  // Handle mouse/touch down - start recording
  const handleRecordStart = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    isHoldingRef.current = true
    await startRecording()
  }
  
  // Handle mouse/touch up - stop recording and get transcript
  const handleRecordStop = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isHoldingRef.current) return
    
    isHoldingRef.current = false
    
    try {
      const transcript = await stopRecording()
      if (transcript) {
        // Append to current input text
        setInputText(prev => {
          const newText = prev ? `${prev} ${transcript}` : transcript
          return newText
        })
      }
    } catch (err) {
      console.error('Failed to get transcript:', err)
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const textToSend = inputText.trim()
    if (!textToSend || isProcessing) return
    
    setStatus('submitted')
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    store.addChatMessage(userMessage)
    
    // Clear input
    setInputText('')
    
    // Process with AI
    setStatus('streaming')
    // Pass conversation history for context
    const result = await processTranscription(textToSend, messages)
    
    // Format updates in a more readable way
    const formatFieldName = (key: string): string => {
      // Convert camelCase to readable format
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim()
    }
    
    const formatValue = formatValueForDisplay
    
    // Generate detailed update descriptions
    const updateDescriptions: string[] = []
    result.updates.forEach((update) => {
      if (update.updates && Object.keys(update.updates).length > 0) {
        // Format as key-value pairs
        const formattedUpdates = Object.entries(update.updates)
          .map(([key, value]) => `  ${formatFieldName(key)}: ${formatValue(value)}`)
          .join('\n')
        updateDescriptions.push(`${update.description}:\n${formattedUpdates}`)
      } else {
        // Simple description
        updateDescriptions.push(update.description)
      }
    })
    
    // Generate a natural summary based on the updates
    let summaryContent = ''
    if (updateDescriptions.length > 0) {
      // Only show next steps guidance, not the detailed updates (those will be shown in the green card)
      if (result.nextSteps) {
        summaryContent = `📋 **Next Steps:**\n${result.nextSteps}`
      } else {
        summaryContent = `Is there anything else you'd like to add?`
      }
    } else {
      summaryContent = `I received your message, but I couldn't identify any specific application information to extract. Could you provide more details about the client, their employment, income, assets, or property?`
    }
    
    // Add assistant response
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: summaryContent,
      timestamp: new Date(),
      updates: updateDescriptions
    }
    setMessages(prev => [...prev, assistantMessage])
    store.addChatMessage(assistantMessage)
    
    setStatus('ready')
  }
  
  const error = recordingError || processingError
  const showWelcome = messages.length === 0
  
  const handleSuggestionClick = (title: string) => {
    const prompts: Record<string, string> = {
      'Client Information': 'Help me add client personal information',
      'Employment': 'Help me add employment details',
      'Income & Assets': 'Help me add income and asset information',
      'Property Details': 'Help me add property and real estate details'
    }
    const text = prompts[title] || title
    setInputText(text)
  }
  
  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-background">
      <ScrollArea className="flex-1 overflow-y-auto">
        {showWelcome ? (
          /* Welcome Screen */
          <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] px-3 sm:px-4 py-6 sm:py-8">
            <div className="max-w-4xl w-full space-y-6 sm:space-y-12">
              <div className="text-center space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Welcome to AI Chat</h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                  Get started by describing what you'd like to add to the application. You can type or use voice to chat with the AI assistant.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
                {suggestionCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <Button
                      key={card.title}
                      variant="outline"
                      onClick={() => handleSuggestionClick(card.title)}
                      className="h-auto p-4 sm:p-6 justify-start hover:shadow-md active:scale-95 transition-all group touch-manipulation"
                    >
                      <div className="flex items-start gap-3 sm:gap-4 w-full">
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">{card.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{card.description}</p>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="pb-4">
            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageAvatar
                  src={message.role === 'user' ? 'https://github.com/shadcn.png' : undefined}
                  name={message.role === 'user' ? 'You' : 'AI Assistant'}
                />
                <MessageContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {(message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {message.updates && message.updates.length > 0 && (
                      <div className="mt-4 space-y-2 rounded-lg bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-900">
                        <p className="text-xs font-semibold text-green-900 dark:text-green-100 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Updates Applied
                        </p>
                        <div className="space-y-1.5">
                          {message.updates.map((update, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-green-800 dark:text-green-200">
                              <span className="text-green-600 dark:text-green-400">•</span>
                              <span>{update}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p>{message.content}</p>
                  </div>
                </MessageContent>
              </Message>
            ))}
            
            {isProcessing && (
              <Message from="assistant">
                <MessageAvatar name="AI Assistant" />
                <MessageContent>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </MessageContent>
              </Message>
            )}
            
            {/* Invisible element for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {/* Input Area - Sticky at bottom of container */}
      <div className="sticky bottom-0 w-full bg-white dark:bg-background border-t shadow-lg">
        <div className="max-w-4xl mx-auto p-2 sm:p-4">
          {error && (
            <Alert variant="destructive" className="mb-2 sm:mb-3 animate-in fade-in slide-in-from-bottom-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}
          
          {(isRecording || isTranscribing) && (
            <div className="mb-2 sm:mb-3 flex items-center justify-center">
              <Badge 
                variant={isRecording ? "destructive" : "secondary"} 
                className={`text-xs ${isRecording ? "animate-pulse" : ""}`}
              >
                {isRecording && <span className="inline-block w-2 h-2 bg-white rounded-full mr-2"></span>}
                {isRecording ? 'Recording...' : 'Transcribing...'}
              </Badge>
            </div>
          )}
          
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or hold mic to record..."
              disabled={isProcessing || isTranscribing}
              minHeight={120}
              maxHeight={500}
              className="text-sm sm:text-base"
            />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputButton
                  onMouseDown={handleRecordStart}
                  onMouseUp={handleRecordStop}
                  onMouseLeave={handleRecordStop}
                  onTouchStart={handleRecordStart}
                  onTouchEnd={handleRecordStop}
                  disabled={isProcessing || isTranscribing}
                  variant={isRecording ? 'destructive' : 'ghost'}
                  className={`touch-manipulation min-h-[44px] ${isRecording ? 'animate-pulse' : ''}`}
                >
                  <Mic size={16} className="sm:mr-1.5" />
                  <span className="hidden sm:inline">Hold to Record</span>
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={!inputText.trim() || isProcessing || isTranscribing}
                status={status}
                className="touch-manipulation min-h-[44px] min-w-[44px]"
              />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}

