import { useState, useEffect, useCallback, useRef } from 'react'

const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

type Breakpoint = keyof typeof breakpoints

interface ResponsiveAnalytics {
  resizeCount: number
  orientationChanges: number
  lastResizeTime: number
  averageResizeInterval: number
  breakpointHistory: Array<{
    breakpoint: Breakpoint
    timestamp: number
    duration: number
  }>
}

interface UseResponsiveOptions {
  enableAnalytics?: boolean
  debounceMs?: number
  trackOrientation?: boolean
  trackBreakpointHistory?: boolean
}

export const useResponsive = (options: UseResponsiveOptions = {}) => {
  const {
    enableAnalytics = false,
    debounceMs = 100,
    trackOrientation = false,
    trackBreakpointHistory = false
  } = options

  const [screenSize, setScreenSize] = useState<{
    width: number
    height: number
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    breakpoint: Breakpoint
    orientation: 'portrait' | 'landscape'
    aspectRatio: number
  }>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        breakpoint: 'lg',
        orientation: 'landscape',
        aspectRatio: 1024 / 768
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const isMobile = width < 768
    const isTablet = width >= 768 && width < 1024
    const isDesktop = width >= 1024
    
    let breakpoint: Breakpoint = 'lg'
    if (width < 640) breakpoint = 'sm'
    else if (width < 768) breakpoint = 'md'
    else if (width < 1024) breakpoint = 'lg'
    else if (width < 1280) breakpoint = 'xl'
    else breakpoint = '2xl'

    return {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      breakpoint,
      orientation: width > height ? 'landscape' : 'portrait',
      aspectRatio: width / height
    }
  })

  const [analytics, setAnalytics] = useState<ResponsiveAnalytics>({
    resizeCount: 0,
    orientationChanges: 0,
    lastResizeTime: Date.now(),
    averageResizeInterval: 0,
    breakpointHistory: []
  })

  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastBreakpointRef = useRef<Breakpoint>(screenSize.breakpoint)
  const lastOrientationRef = useRef<'portrait' | 'landscape'>(screenSize.orientation)
  const resizeTimesRef = useRef<number[]>([])

  const calculateScreenInfo = useCallback((width: number, height: number) => {
    const isMobile = width < 768
    const isTablet = width >= 768 && width < 1024
    const isDesktop = width >= 1024
    
    let breakpoint: Breakpoint = 'lg'
    if (width < 640) breakpoint = 'sm'
    else if (width < 768) breakpoint = 'md'
    else if (width < 1024) breakpoint = 'lg'
    else if (width < 1280) breakpoint = 'xl'
    else breakpoint = '2xl'

    const orientation = width > height ? 'landscape' : 'portrait'
    const aspectRatio = width / height

    return {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      breakpoint,
      orientation,
      aspectRatio
    }
  }, [])

  const updateAnalytics = useCallback((newScreenInfo: ReturnType<typeof calculateScreenInfo>) => {
    if (!enableAnalytics) return

    const now = Date.now()
    const currentBreakpoint = newScreenInfo.breakpoint
    const currentOrientation = newScreenInfo.orientation

    setAnalytics(prev => {
      const newResizeCount = prev.resizeCount + 1
      const newResizeTimes = [...resizeTimesRef.current, now].slice(-10) // Keep last 10 resize times
      resizeTimesRef.current = newResizeTimes

      const averageInterval = newResizeTimes.length > 1 
        ? newResizeTimes.reduce((sum, time, index) => {
            if (index === 0) return 0
            return sum + (time - newResizeTimes[index - 1])
          }, 0) / (newResizeTimes.length - 1)
        : 0

      let orientationChanges = prev.orientationChanges
      if (trackOrientation && currentOrientation !== lastOrientationRef.current) {
        orientationChanges++
        lastOrientationRef.current = currentOrientation
      }

      let breakpointHistory = prev.breakpointHistory
      if (trackBreakpointHistory && currentBreakpoint !== lastBreakpointRef.current) {
        const lastEntry = breakpointHistory[breakpointHistory.length - 1]
        const duration = lastEntry ? now - lastEntry.timestamp : 0
        
        breakpointHistory = [...breakpointHistory, {
          breakpoint: currentBreakpoint,
          timestamp: now,
          duration
        }].slice(-50) // Keep last 50 breakpoint changes

        lastBreakpointRef.current = currentBreakpoint
      }

      return {
        resizeCount: newResizeCount,
        orientationChanges,
        lastResizeTime: now,
        averageResizeInterval: averageInterval,
        breakpointHistory
      }
    })
  }, [enableAnalytics, trackOrientation, trackBreakpointHistory, calculateScreenInfo])

  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current)
    }

    resizeTimeoutRef.current = setTimeout(() => {
      const width = window.innerWidth
      const height = window.innerHeight
      const newScreenInfo = calculateScreenInfo(width, height)
      
      setScreenSize(newScreenInfo)
      updateAnalytics(newScreenInfo)
    }, debounceMs)
  }, [debounceMs, calculateScreenInfo, updateAnalytics])

  useEffect(() => {
    // Set initial analytics
    if (enableAnalytics) {
      lastBreakpointRef.current = screenSize.breakpoint
      lastOrientationRef.current = screenSize.orientation
      resizeTimesRef.current = [Date.now()]
    }

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [handleResize, enableAnalytics, screenSize.breakpoint, screenSize.orientation])

  return {
    ...screenSize,
    analytics: enableAnalytics ? analytics : undefined
  }
}

// Helper hook for specific breakpoint checks
export const useBreakpoint = (breakpoint: Breakpoint) => {
  const { width } = useResponsive()
  return width >= parseInt(breakpoints[breakpoint])
}

// Helper hook for mobile detection
export const useIsMobile = () => {
  const { isMobile } = useResponsive()
  return isMobile
}

// Helper hook for tablet detection
export const useIsTablet = () => {
  const { isTablet } = useResponsive()
  return isTablet
}

// Helper hook for desktop detection
export const useIsDesktop = () => {
  const { isDesktop } = useResponsive()
  return isDesktop
}

// Helper hook for orientation detection
export const useOrientation = () => {
  const { orientation } = useResponsive()
  return orientation
}

// Helper hook for aspect ratio
export const useAspectRatio = () => {
  const { aspectRatio } = useResponsive()
  return aspectRatio
}

// Helper hook for checking if screen is in a specific range
export const useScreenRange = (minWidth: number, maxWidth: number) => {
  const { width } = useResponsive()
  return width >= minWidth && width <= maxWidth
}