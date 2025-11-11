import { useState, useRef, useCallback } from 'react'

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  
  const startRecording = useCallback(async () => {
    try {
      setError(null)
      audioChunksRef.current = []
      
      // Request microphone permission and get stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event.error)
        setError(`Recording error: ${event.error}`)
        setIsRecording(false)
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Failed to start recording:', err)
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Failed to access microphone. Please check permissions.')
      } else {
        setError('Failed to start recording. Please try again.')
      }
    }
  }, [])
  
  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        resolve('')
        return
      }
      
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false)
        setIsTranscribing(true)
        
        try {
          // Stop all tracks in the stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
          }
          
          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          
          // Call transcription API
          try {
            // TODO: Replace with your actual transcription API endpoint
            // For now, we'll use OpenAI's Whisper API
            const formData = new FormData()
            formData.append('file', audioBlob, 'recording.webm')
            formData.append('model', 'whisper-1')
            
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
              },
              body: formData
            })
            
            if (!response.ok) {
              throw new Error('Transcription failed')
            }
            
            const data = await response.json()
            setIsTranscribing(false)
            resolve(data.text || '')
          } catch (err) {
            console.error('Transcription error:', err)
            setError('Failed to transcribe audio. Please try again.')
            setIsTranscribing(false)
            reject(err)
          }
        } catch (err) {
          console.error('Failed to process recording:', err)
          setError('Failed to process recording. Please try again.')
          setIsTranscribing(false)
          reject(err)
        }
      }
      
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    })
  }, [])
  
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    audioChunksRef.current = []
    setIsRecording(false)
    setError(null)
  }, [isRecording])
  
  return {
    isRecording,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    cancelRecording
  }
}

