/**
 * FPRD-10: Module 20 — Autosave Hook
 * Automatically saves form data every 30 seconds to localStorage.
 * Module 21 — Draft Recovery: detects and offers to recover a previous draft.
 */
import { useEffect, useRef, useCallback, useState } from 'react'

interface AutosaveOptions<T> {
  key: string          // unique storage key e.g. 'cms:roadmap:new'
  data: T              // current form data to persist
  interval?: number    // ms between saves (default 30000)
  enabled?: boolean    // disable when not needed
}

interface AutosaveReturn<T> {
  lastSaved: Date | null
  hasDraft: boolean
  recoverDraft: () => T | null
  clearDraft: () => void
  saveNow: () => void
}

const PREFIX = 'cms_autosave_'

export function useAutosave<T>({ key, data, interval = 30_000, enabled = true }: AutosaveOptions<T>): AutosaveReturn<T> {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const dataRef = useRef(data)
  const storageKey = `${PREFIX}${key}`

  // Keep ref in sync with latest data (no re-subscribe needed)
  useEffect(() => {
    dataRef.current = data
  }, [data])

  // Check for existing draft on mount
  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        JSON.parse(raw)
        setHasDraft(true)
      } catch {
        localStorage.removeItem(storageKey)
      }
    }
  }, [storageKey])

  const saveNow = useCallback(() => {
    if (!enabled) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({ data: dataRef.current, savedAt: new Date().toISOString() }))
      setLastSaved(new Date())
      setHasDraft(true)
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, [storageKey, enabled])

  const recoverDraft = useCallback((): T | null => {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      return parsed.data as T
    } catch {
      return null
    }
  }, [storageKey])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey)
    setHasDraft(false)
    setLastSaved(null)
  }, [storageKey])

  // Interval autosave
  useEffect(() => {
    if (!enabled) return
    const timer = setInterval(saveNow, interval)
    return () => clearInterval(timer)
  }, [saveNow, interval, enabled])

  // Save on page unload
  useEffect(() => {
    if (!enabled) return
    const handleUnload = () => saveNow()
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [saveNow, enabled])

  return { lastSaved, hasDraft, recoverDraft, clearDraft, saveNow }
}
