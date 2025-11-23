import { VoiceAssistant } from '@/components/voice/VoiceAssistant'
import { Mic } from 'lucide-react'

export default function DictateStep() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-b">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Voice Dictation
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Speak naturally and our AI will fill out the application for you
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <VoiceAssistant />
      </div>
    </div>
  )
}

