// Enhanced custom hook for managing loading states with persistence, timeout handling, and analytics

import { useState, useCallback, useEffect, useRef } from 'react'
import { LoadingState } from '../types/DataExplorer'

interface LoadingAnalytics {
  totalLoadingTime: number
  loadingCount: number
  averageLoadingTime: number
  longestLoadingTime: number
  loadingHistory: Array<{
    type: keyof LoadingState
    startTime: number
    endTime: number
    duration: number
  }>
}

interface UseLoadingStateOptions {
  debounceTime?: number
  timeout?: number
  persistState?: boolean
  enableAnalytics?: boolean
  storageKey?: string
}

export const useLoadingState = (
  initialState: Partial<LoadingState> = {},
  options: UseLoadingStateOptions = {}
) => {
  const {
    debounceTime = 300,
    timeout = 30000, // 30 seconds default timeout
    persistState = false,
    enableAnalytics = false,
    storageKey = 'loadingState'
  } = options

  // Load persisted state if enabled
  const getInitialState = useCallback((): LoadingState => {
    if (persistState && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          return { ...parsed, ...initialState }
        }
      } catch (error) {
        console.warn('Failed to load persisted loading state:', error)
      }
    }
    return {
      main: false,
      modal: false,
      dbInitializing: true,
      debouncing: false,
      ...initialState
    }
  }, [persistState, storageKey, initialState])

  const [loading, setLoading] = useState<LoadingState>(getInitialState)
  const [analytics, setAnalytics] = useState<LoadingAnalytics>({
    totalLoadingTime: 0,
    loadingCount: 0,
    averageLoadingTime: 0,
    longestLoadingTime: 0,
    loadingHistory: []
  })

  const loadingStartTimes = useRef<Partial<Record<keyof LoadingState, number>>>({})
  const timeoutRefs = useRef<Partial<Record<keyof LoadingState, NodeJS.Timeout>>>({})
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Persist state to localStorage when it changes
  useEffect(() => {
    if (persistState && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(loading))
      } catch (error) {
        console.warn('Failed to persist loading state:', error)
      }
    }
  }, [loading, persistState, storageKey])

  // Track loading start time and set timeout
  const startLoading = useCallback((type: keyof LoadingState) => {
    const startTime = Date.now()
    loadingStartTimes.current[type] = startTime

    // Clear existing timeout for this type
    if (timeoutRefs.current[type]) {
      clearTimeout(timeoutRefs.current[type]!)
    }

    // Set timeout for this loading operation
    timeoutRefs.current[type] = setTimeout(() => {
      console.warn(`Loading operation '${type}' timed out after ${timeout}ms`)
      setLoading(prev => ({ ...prev, [type]: false }))
      delete loadingStartTimes.current[type]
      delete timeoutRefs.current[type]
    }, timeout)

    setLoading(prev => ({ ...prev, [type]: true }))
  }, [timeout])

  // Track loading end time and update analytics
  const stopLoading = useCallback((type: keyof LoadingState) => {
    const startTime = loadingStartTimes.current[type]
    if (startTime) {
      const endTime = Date.now()
      const duration = endTime - startTime

      // Update analytics
      if (enableAnalytics) {
        setAnalytics(prev => {
          const newHistory = [...prev.loadingHistory, {
            type,
            startTime,
            endTime,
            duration
          }].slice(-100) // Keep only last 100 entries

          const totalTime = newHistory.reduce((sum, entry) => sum + entry.duration, 0)
          const count = newHistory.length
          const average = count > 0 ? totalTime / count : 0
          const longest = Math.max(...newHistory.map(entry => entry.duration), 0)

          return {
            totalLoadingTime: totalTime,
            loadingCount: count,
            averageLoadingTime: average,
            longestLoadingTime: longest,
            loadingHistory: newHistory
          }
        })
      }

      delete loadingStartTimes.current[type]
    }

    // Clear timeout
    if (timeoutRefs.current[type]) {
      clearTimeout(timeoutRefs.current[type]!)
      delete timeoutRefs.current[type]
    }

    setLoading(prev => ({ ...prev, [type]: false }))
  }, [enableAnalytics])

  // Debounced loading state management
  const debounce = useCallback((callback: () => void) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    setLoading(prev => ({ ...prev, debouncing: true }))

    debounceTimeoutRef.current = setTimeout(() => {
      callback()
      setLoading(prev => ({ ...prev, debouncing: false }))
    }, debounceTime)
  }, [debounceTime])

  const setMainLoading = useCallback((isLoading: boolean) => {
    if (isLoading) {
      startLoading('main')
    } else {
      stopLoading('main')
    }
  }, [startLoading, stopLoading])

  const setModalLoading = useCallback((isLoading: boolean) => {
    if (isLoading) {
      startLoading('modal')
    } else {
      stopLoading('modal')
    }
  }, [startLoading, stopLoading])

  const setDbInitializing = useCallback((isInitializing: boolean) => {
    if (isInitializing) {
      startLoading('dbInitializing')
    } else {
      stopLoading('dbInitializing')
    }
  }, [startLoading, stopLoading])

  const setDebouncing = useCallback((isDebouncing: boolean) => {
    setLoading(prev => ({ ...prev, debouncing: isDebouncing }))
  }, [])

  const setAllLoading = useCallback((isLoading: boolean) => {
    if (isLoading) {
      startLoading('main')
      startLoading('modal')
    } else {
      stopLoading('main')
      stopLoading('modal')
    }
  }, [startLoading, stopLoading])

  const resetLoading = useCallback(() => {
    // Clear all timeouts
    Object.values(timeoutRefs.current).forEach(timeout => {
      if (timeout) clearTimeout(timeout)
    })
    timeoutRefs.current = {}

    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }

    // Reset loading start times
    loadingStartTimes.current = {}

    setLoading({
      main: false,
      modal: false,
      dbInitializing: false,
      debouncing: false
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const isLoading = loading.main || loading.modal || loading.dbInitializing

  return {
    loading,
    isLoading,
    analytics: enableAnalytics ? analytics : undefined,
    setMainLoading,
    setModalLoading,
    setDbInitializing,
    setDebouncing,
    setAllLoading,
    resetLoading,
    debounce,
    startLoading,
    stopLoading
  }
}
