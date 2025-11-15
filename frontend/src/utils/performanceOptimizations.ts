// Performance optimization utilities

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react'

/**
 * Higher-order component for optimizing components with React.memo
 * Includes custom comparison function for deep equality checks
 */
export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  customCompare?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(Component, customCompare)
}

/**
 * Shallow comparison function for React.memo
 * Compares primitive values and arrays/objects by reference
 */
export const shallowEqual = <T extends object>(prevProps: T, nextProps: T): boolean => {
  const prevKeys = Object.keys(prevProps)
  const nextKeys = Object.keys(nextProps)

  if (prevKeys.length !== nextKeys.length) {
    return false
  }

  return prevKeys.every(key => {
    const prevValue = prevProps[key as keyof T]
    const nextValue = nextProps[key as keyof T]

    if (prevValue === nextValue) {
      return true
    }

    // Handle arrays
    if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
      return prevValue.length === nextValue.length && 
             prevValue.every((item, index) => item === nextValue[index])
    }

    // Handle objects
    if (typeof prevValue === 'object' && typeof nextValue === 'object' && 
        prevValue !== null && nextValue !== null) {
      return shallowEqual(prevValue, nextValue)
    }

    return false
  })
}

/**
 * Deep comparison function for React.memo
 * Performs deep equality check on all properties
 */
export const deepEqual = <T extends object>(prevProps: T, nextProps: T): boolean => {
  if (prevProps === nextProps) {
    return true
  }

  if (prevProps == null || nextProps == null) {
    return prevProps === nextProps
  }

  const prevKeys = Object.keys(prevProps)
  const nextKeys = Object.keys(nextProps)

  if (prevKeys.length !== nextKeys.length) {
    return false
  }

  return prevKeys.every(key => {
    const prevValue = prevProps[key as keyof T]
    const nextValue = nextProps[key as keyof T]

    if (prevValue === nextValue) {
      return true
    }

    if (typeof prevValue === 'object' && typeof nextValue === 'object' && 
        prevValue !== null && nextValue !== null) {
      return deepEqual(prevValue as any, nextValue as any)
    }

    return false
  })
}

/**
 * Hook for debouncing values
 * Useful for search inputs, API calls, etc.
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for throttling values
 * Useful for scroll events, resize events, etc.
 */
export const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = React.useState<T>(value)
  const lastExecuted = useRef<number>(Date.now())

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now()
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now()
        setThrottledValue(value)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [value, delay])

  return throttledValue
}

/**
 * Hook for creating stable references to objects
 * Prevents unnecessary re-renders when passing objects as props
 */
export const useStableValue = <T>(value: T): T => {
  const ref = useRef<T>(value)
  
  if (!deepEqual(ref.current, value)) {
    ref.current = value
  }
  
  return ref.current
}

/**
 * Hook for creating stable callback references
 * Prevents unnecessary re-renders when passing functions as props
 */
export const useStableCallback = <T extends (...args: any[]) => any>(callback: T): T => {
  const ref = useRef<T>(callback)
  
  useEffect(() => {
    ref.current = callback
  })
  
  return useCallback((...args: Parameters<T>) => {
    return ref.current(...args)
  }, []) as T
}

/**
 * Hook for intersection observer (lazy loading)
 * Useful for implementing virtual scrolling and lazy loading
 */
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const [hasIntersected, setHasIntersected] = React.useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options, hasIntersected])

  return { isIntersecting, hasIntersected }
}

/**
 * Hook for virtual scrolling
 * Calculates which items should be visible based on scroll position
 */
export const useVirtualScrolling = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = React.useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan])

  const visibleItems = useMemo(() => {
    const items = []
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      items.push({
        index: i,
        top: i * itemHeight,
        height: itemHeight
      })
    }
    return items
  }, [visibleRange, itemHeight])

  const totalHeight = itemCount * itemHeight

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    scrollTop
  }
}

/**
 * Hook for image lazy loading
 * Loads images only when they come into view
 */
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '')
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [isError, setIsError] = React.useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const { isIntersecting } = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: '50px'
  })

  useEffect(() => {
    if (isIntersecting && src && !isLoaded && !isError) {
      const img = new Image()
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
      }
      img.onerror = () => {
        setIsError(true)
      }
      img.src = src
    }
  }, [isIntersecting, src, isLoaded, isError])

  return {
    src: imageSrc,
    isLoaded,
    isError,
    ref: imgRef
  }
}

/**
 * Hook for code splitting with error boundaries
 * Handles loading states and errors for dynamically imported components
 */
export const useCodeSplitting = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const [Component, setComponent] = React.useState<T | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  useEffect(() => {
    importFn()
      .then(module => {
        setComponent(() => module.default)
        setIsLoading(false)
      })
      .catch(err => {
        setError(err)
        setIsLoading(false)
      })
  }, [importFn])

  if (isLoading) {
    return { Component: fallback || (() => React.createElement('div', null, 'Loading...')), isLoading, error: null }
  }

  if (error) {
    return { Component: fallback || (() => React.createElement('div', null, 'Error loading component')), isLoading: false, error }
  }

  return { Component, isLoading: false, error: null }
}

/**
 * Hook for measuring component render performance
 * Tracks render times and can trigger optimizations
 */
export const useRenderPerformance = (componentName: string, threshold: number = 16) => {
  const renderCount = useRef(0)
  const renderTimes = useRef<number[]>([])
  const startTime = useRef<number>(0)

  useEffect(() => {
    startTime.current = performance.now()
    renderCount.current += 1

    return () => {
      const renderTime = performance.now() - startTime.current
      renderTimes.current.push(renderTime)

      if (renderTime > threshold) {
        console.warn(`🐌 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }

      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current = renderTimes.current.slice(-10)
      }
    }
  })

  const averageRenderTime = useMemo(() => {
    if (renderTimes.current.length === 0) return 0
    return renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length
  }, [renderTimes.current])

  return {
    renderCount: renderCount.current,
    averageRenderTime,
    lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0
  }
}

/**
 * Utility for creating optimized list components
 * Combines virtual scrolling with memoization
 */
export const createOptimizedList = <T, P extends { item: T; index: number }>(
  ItemComponent: React.ComponentType<P>,
  itemHeight: number = 50
) => {
  const MemoizedItem = memo(ItemComponent, (prevProps, nextProps) => {
    return prevProps.index === nextProps.index && 
           deepEqual(prevProps.item, nextProps.item)
  })

  return memo(({ 
    items, 
    height, 
    overscan = 5 
  }: { 
    items: T[]; 
    height: number; 
    overscan?: number 
  }) => {
    const { visibleItems, totalHeight, handleScroll } = useVirtualScrolling(
      items.length,
      itemHeight,
      height,
      overscan
    )

    return React.createElement('div', {
      style: { height, overflow: 'auto' },
      onScroll: handleScroll
    }, React.createElement('div', {
      style: { height: totalHeight, position: 'relative' }
    }, visibleItems.map(({ index, top }) =>
      React.createElement('div', {
        key: index,
        style: {
          position: 'absolute',
          top,
          height: itemHeight,
          width: '100%'
        }
      }, React.createElement(MemoizedItem, { item: items[index], index }))
    )))
  })
}
