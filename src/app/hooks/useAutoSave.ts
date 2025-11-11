import { useEffect, useRef, useState } from 'react'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface UseAutoSaveOptions<T> {
  data: T
  stepKey: string
  save: (payload: { data: T; stepKey: string }) => Promise<void>
  intervalMs?: number
}

export function useAutoSave<T>({ data, stepKey, save, intervalMs = 10000 }: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')
  const lastSavedRef = useRef<string>('')
  const versionRef = useRef<number>(0)

  async function doSave(_trigger: 'interval' | 'blur' | 'step') {
    try {
      setStatus('saving')
      versionRef.current += 1
      const version = versionRef.current
      await save({ data, stepKey })
      // last-write-wins: only mark saved if this is the latest version
      if (version === versionRef.current) {
        lastSavedRef.current = new Date().toISOString()
        setStatus('saved')
      }
    } catch (e) {
      setStatus('error')
    }
  }

  // Interval save
  useEffect(() => {
    const id = setInterval(() => {
      void doSave('interval')
    }, intervalMs)
    return () => clearInterval(id)
  }, [data, stepKey, intervalMs])

  // Blur save
  useEffect(() => {
    const handler = () => void doSave('blur')
    window.addEventListener('blur', handler)
    return () => window.removeEventListener('blur', handler)
  }, [data, stepKey])

  // Step-change save (call when parent changes stepKey)
  useEffect(() => {
    void doSave('step')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey])

  return { status, lastSavedAt: lastSavedRef.current }
}
