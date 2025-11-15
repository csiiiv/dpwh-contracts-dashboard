import { useEffect, useRef, useCallback, useState } from 'react'

interface PerformanceMetrics {
  componentName: string
  renderTime: number
  mountTime: number
  updateCount: number
  lastUpdate: number
}

interface PerformanceConfig {
  enabled: boolean
  logToConsole: boolean
  sendToAnalytics: boolean
  threshold: number // Log if render time exceeds this threshold (ms)
  enableAnalytics?: boolean
  maxEntries?: number
  enableMemoryTracking?: boolean
}

interface PerformanceEntry {
  metric: 'render' | 'page_load' | 'api_call' | 'user_interaction' | 'memory_usage'
  name: string
  duration: number
  timestamp: number
  details?: Record<string, any>
  componentName?: string
}

interface PerformanceAnalytics {
  totalEntries: number
  averageDuration: number
  slowestEntry: PerformanceEntry | null
  entriesByMetric: Record<string, PerformanceEntry[]>
  recentEntries: PerformanceEntry[]
}

const defaultConfig: PerformanceConfig = {
  enabled: process.env.NODE_ENV === 'development',
  logToConsole: true,
  sendToAnalytics: false,
  threshold: 16, // 16ms = 60fps
  enableAnalytics: false,
  maxEntries: 1000,
  enableMemoryTracking: false
}

// Global performance entries storage
const performanceEntries: PerformanceEntry[] = []
const maxGlobalEntries = 1000

const logPerformanceEntry = (
  metric: PerformanceEntry['metric'],
  name: string,
  duration: number,
  details?: Record<string, any>,
  componentName?: string
) => {
  const entry: PerformanceEntry = {
    metric,
    name,
    duration,
    timestamp: Date.now(),
    details,
    componentName
  }

  // Add to global entries
  performanceEntries.push(entry)
  
  // Keep only the most recent entries
  if (performanceEntries.length > maxGlobalEntries) {
    performanceEntries.splice(0, performanceEntries.length - maxGlobalEntries)
  }

  if (process.env.NODE_ENV === 'development') {
    const emoji = {
      render: '⚡',
      page_load: '🚀',
      api_call: '🌐',
      user_interaction: '👆',
      memory_usage: '💾'
    }[metric] || '📊'
    
    console.log(`${emoji} Performance - ${metric}: ${name} took ${duration.toFixed(2)}ms`, details)
  }
}

const calculateAnalytics = (entries: PerformanceEntry[]): PerformanceAnalytics => {
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      averageDuration: 0,
      slowestEntry: null,
      entriesByMetric: {},
      recentEntries: []
    }
  }

  const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0)
  const averageDuration = totalDuration / entries.length
  const slowestEntry = entries.reduce((slowest, entry) => 
    entry.duration > slowest.duration ? entry : slowest
  )

  const entriesByMetric = entries.reduce((acc, entry) => {
    if (!acc[entry.metric]) {
      acc[entry.metric] = []
    }
    acc[entry.metric].push(entry)
    return acc
  }, {} as Record<string, PerformanceEntry[]>)

  const recentEntries = entries.slice(-20) // Last 20 entries

  return {
    totalEntries: entries.length,
    averageDuration,
    slowestEntry,
    entriesByMetric,
    recentEntries
  }
}

export const usePerformanceMonitoring = (
  componentName: string,
  config: Partial<PerformanceConfig> = {}
) => {
  const mergedConfig = { ...defaultConfig, ...config }
  const metricsRef = useRef<PerformanceMetrics>({
    componentName,
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    lastUpdate: 0,
  })
  const mountTimeRef = useRef<number>(0)
  const renderStartRef = useRef<number>(0)

  const logPerformance = useCallback((metrics: PerformanceMetrics) => {
    if (!mergedConfig.enabled) return

    const { renderTime, mountTime, updateCount } = metrics

    // Log to global performance tracking
    if (mergedConfig.enableAnalytics) {
      logPerformanceEntry('render', componentName, renderTime, {
        mountTime,
        updateCount,
        lastUpdate: new Date(metrics.lastUpdate).toISOString()
      }, componentName)
    }

    if (mergedConfig.logToConsole) {
      if (renderTime > mergedConfig.threshold) {
        console.warn(
          `🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
        )
      }

      if (updateCount > 10) {
        console.warn(
          `🔄 High update count in ${componentName}: ${updateCount} updates`
        )
      }

      console.log(`📊 Performance metrics for ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        mountTime: `${mountTime.toFixed(2)}ms`,
        updateCount,
        lastUpdate: new Date(metrics.lastUpdate).toISOString(),
      })
    }

    if (mergedConfig.sendToAnalytics) {
      // In a real app, you would send this to your analytics service
      // analytics.track('component_performance', metrics)
    }
  }, [componentName, mergedConfig])

  // Track component mount
  useEffect(() => {
    mountTimeRef.current = performance.now()
    metricsRef.current.mountTime = mountTimeRef.current
    metricsRef.current.lastUpdate = Date.now()

    return () => {
      const totalMountTime = performance.now() - mountTimeRef.current
      console.log(`⏱️ ${componentName} total mount time: ${totalMountTime.toFixed(2)}ms`)
    }
  }, [componentName])

  // Track renders
  useEffect(() => {
    renderStartRef.current = performance.now()
    
    return () => {
      const renderTime = performance.now() - renderStartRef.current
      metricsRef.current.renderTime = renderTime
      metricsRef.current.updateCount += 1
      metricsRef.current.lastUpdate = Date.now()

      logPerformance(metricsRef.current)
    }
  })

  // Track specific operations
  const trackOperation = useCallback((operationName: string, operation: () => void) => {
    if (!mergedConfig.enabled) {
      operation()
      return
    }

    const startTime = performance.now()
    operation()
    const endTime = performance.now()
    const duration = endTime - startTime

    if (duration > mergedConfig.threshold) {
      console.warn(
        `🐌 Slow operation "${operationName}" in ${componentName}: ${duration.toFixed(2)}ms`
      )
    }

    if (mergedConfig.logToConsole) {
      console.log(`⚡ Operation "${operationName}" in ${componentName}: ${duration.toFixed(2)}ms`)
    }
  }, [componentName, mergedConfig])

  // Track async operations
  const trackAsyncOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    if (!mergedConfig.enabled) {
      return operation()
    }

    const startTime = performance.now()
    try {
      const result = await operation()
      const endTime = performance.now()
      const duration = endTime - startTime

      if (duration > mergedConfig.threshold) {
        console.warn(
          `🐌 Slow async operation "${operationName}" in ${componentName}: ${duration.toFixed(2)}ms`
        )
      }

      if (mergedConfig.logToConsole) {
        console.log(`⚡ Async operation "${operationName}" in ${componentName}: ${duration.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      console.error(
        `❌ Failed async operation "${operationName}" in ${componentName} after ${duration.toFixed(2)}ms:`,
        error
      )
      throw error
    }
  }, [componentName, mergedConfig])

  return {
    trackOperation,
    trackAsyncOperation,
    metrics: metricsRef.current,
  }
}

// Hook for tracking page load performance
export const usePageLoadPerformance = (options?: { enableAnalytics?: boolean }) => {
  const { enableAnalytics = false } = options || {}

  useEffect(() => {
    if (typeof window === 'undefined') return

    const trackPageLoad = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          load: navigation.loadEventEnd - navigation.loadEventStart,
          total: navigation.loadEventEnd - navigation.fetchStart,
        }

        // Log to global performance tracking
        if (enableAnalytics) {
          logPerformanceEntry('page_load', 'initial_render', metrics.total, metrics)
        }

        console.log('📊 Page Load Performance:', metrics)

        // Check for performance issues
        if (metrics.total > 3000) {
          console.warn('🐌 Slow page load detected:', `${metrics.total.toFixed(2)}ms`)
        }

        if (metrics.dom > 1000) {
          console.warn('🐌 Slow DOM processing:', `${metrics.dom.toFixed(2)}ms`)
        }
      }
    }

    // Track when page is fully loaded
    if (document.readyState === 'complete') {
      trackPageLoad()
    } else {
      window.addEventListener('load', trackPageLoad)
      return () => window.removeEventListener('load', trackPageLoad)
    }
  }, [enableAnalytics])
}

/**
 * Hook to monitor API call performance.
 */
export const useApiPerformanceMonitoring = (apiName: string) => {
  const startTimeRef = useRef<number | null>(null)

  const startApiCall = useCallback(() => {
    startTimeRef.current = performance.now()
  }, [])

  const endApiCall = useCallback((success: boolean = true, error?: any) => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current
      const details = {
        success,
        error: error?.message || null,
        timestamp: new Date().toISOString()
      }

      logPerformanceEntry('api_call', apiName, duration, details)
      startTimeRef.current = null
    }
  }, [apiName])

  return { startApiCall, endApiCall }
}

/**
 * Hook to monitor user interaction performance.
 */
export const useUserInteractionMonitoring = (interactionName: string) => {
  const startTimeRef = useRef<number | null>(null)

  const startInteraction = useCallback(() => {
    startTimeRef.current = performance.now()
  }, [])

  const endInteraction = useCallback((details?: Record<string, any>) => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current
      logPerformanceEntry('user_interaction', interactionName, duration, details)
      startTimeRef.current = null
    }
  }, [interactionName])

  return { startInteraction, endInteraction }
}

/**
 * Hook to get performance analytics.
 */
export const usePerformanceAnalytics = (maxEntries?: number) => {
  const [analytics, setAnalytics] = useState<PerformanceAnalytics>(() => 
    calculateAnalytics(performanceEntries)
  )

  useEffect(() => {
    const updateAnalytics = () => {
      const entries = maxEntries ? performanceEntries.slice(-maxEntries) : performanceEntries
      setAnalytics(calculateAnalytics(entries))
    }

    // Update analytics every 5 seconds
    const interval = setInterval(updateAnalytics, 5000)
    
    // Initial update
    updateAnalytics()

    return () => clearInterval(interval)
  }, [maxEntries])

  const clearAnalytics = useCallback(() => {
    performanceEntries.length = 0
    setAnalytics(calculateAnalytics([]))
  }, [])

  const getEntriesByComponent = useCallback((componentName: string) => {
    return performanceEntries.filter(entry => entry.componentName === componentName)
  }, [])

  const getSlowestEntries = useCallback((count: number = 10) => {
    return [...performanceEntries]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, count)
  }, [])

  return {
    analytics,
    clearAnalytics,
    getEntriesByComponent,
    getSlowestEntries,
    allEntries: performanceEntries
  }
}

/**
 * Hook to monitor memory usage (if available).
 */
export const useMemoryMonitoring = (options?: { interval?: number; enableLogging?: boolean }) => {
  const { interval = 10000, enableLogging = false } = options || {}
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return
    }

    const updateMemoryInfo = () => {
      const memory = (performance as any).memory
      if (memory) {
        const info = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        }
        
        setMemoryInfo(info)

        if (enableLogging) {
          const usagePercent = (info.usedJSHeapSize / info.jsHeapSizeLimit) * 100
          logPerformanceEntry('memory_usage', 'memory_check', usagePercent, info)
        }
      }
    }

    updateMemoryInfo()
    const intervalId = setInterval(updateMemoryInfo, interval)

    return () => clearInterval(intervalId)
  }, [interval, enableLogging])

  return memoryInfo
}
