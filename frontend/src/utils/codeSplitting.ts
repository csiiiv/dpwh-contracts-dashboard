// Code splitting utilities for better performance

import React, { lazy, Suspense, ComponentType, ReactNode } from 'react'
import { ErrorBoundary } from '../components/features/shared/ErrorBoundary'

interface LazyComponentOptions {
  fallback?: ReactNode
  errorFallback?: ReactNode
  retryDelay?: number
  maxRetries?: number
}

interface LazyComponentState {
  hasError: boolean
  retryCount: number
  isLoading: boolean
}

/**
 * Creates a lazy-loaded component with error handling and retry logic
 */
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions = {}
) => {
  const {
    fallback = <div>Loading...</div>,
    errorFallback = <div>Error loading component</div>,
    retryDelay = 1000,
    maxRetries = 3
  } = options

  const LazyComponent = lazy(importFn)

  return React.forwardRef<any, P>((props, ref) => {
    const [state, setState] = React.useState<LazyComponentState>({
      hasError: false,
      retryCount: 0,
      isLoading: true
    })

    const handleRetry = React.useCallback(() => {
      if (state.retryCount < maxRetries) {
        setState(prev => ({
          ...prev,
          hasError: false,
          retryCount: prev.retryCount + 1,
          isLoading: true
        }))
      }
    }, [state.retryCount, maxRetries])

    const handleError = React.useCallback(() => {
      setState(prev => ({
        ...prev,
        hasError: true,
        isLoading: false
      }))
    }, [])

    const handleLoad = React.useCallback(() => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: false
      }))
    }, [])

    if (state.hasError) {
      return (
        <div>
          {errorFallback}
          {state.retryCount < maxRetries && (
            <button
              onClick={handleRetry}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry ({state.retryCount + 1}/{maxRetries})
            </button>
          )}
        </div>
      )
    }

    return (
      <ErrorBoundary onError={handleError}>
        <Suspense fallback={fallback}>
          <LazyComponent
            {...props}
            ref={ref}
            onLoad={handleLoad}
          />
        </Suspense>
      </ErrorBoundary>
    )
  })
}

/**
 * Preloads a component for better user experience
 */
export const preloadComponent = (importFn: () => Promise<{ default: ComponentType<any> }>) => {
  return importFn().catch(error => {
    console.warn('Failed to preload component:', error)
  })
}

/**
 * Creates a component that loads multiple components in parallel
 */
export const createParallelLoader = <T extends Record<string, () => Promise<{ default: ComponentType<any> }>>>(
  components: T,
  options: LazyComponentOptions = {}
) => {
  const LazyComponents = Object.entries(components).reduce((acc, [key, importFn]) => {
    acc[key] = createLazyComponent(importFn, options)
    return acc
  }, {} as Record<keyof T, ComponentType<any>>)

  return LazyComponents
}

/**
 * Hook for managing component preloading
 */
export const useComponentPreloader = () => {
  const [preloadedComponents, setPreloadedComponents] = React.useState<Set<string>>(new Set())
  const [preloadingComponents, setPreloadingComponents] = React.useState<Set<string>>(new Set())

  const preloadComponent = React.useCallback(async (
    name: string,
    importFn: () => Promise<{ default: ComponentType<any> }>
  ) => {
    if (preloadedComponents.has(name) || preloadingComponents.has(name)) {
      return
    }

    setPreloadingComponents(prev => new Set(prev).add(name))

    try {
      await importFn()
      setPreloadedComponents(prev => new Set(prev).add(name))
    } catch (error) {
      console.warn(`Failed to preload component ${name}:`, error)
    } finally {
      setPreloadingComponents(prev => {
        const newSet = new Set(prev)
        newSet.delete(name)
        return newSet
      })
    }
  }, [preloadedComponents, preloadingComponents])

  const isPreloaded = React.useCallback((name: string) => {
    return preloadedComponents.has(name)
  }, [preloadedComponents])

  const isPreloading = React.useCallback((name: string) => {
    return preloadingComponents.has(name)
  }, [preloadingComponents])

  return {
    preloadComponent,
    isPreloaded,
    isPreloading,
    preloadedComponents: Array.from(preloadedComponents),
    preloadingComponents: Array.from(preloadingComponents)
  }
}

/**
 * Creates a route-based code splitting system
 */
export const createRouteSplitter = <T extends Record<string, () => Promise<{ default: ComponentType<any> }>>>(
  routes: T,
  options: LazyComponentOptions = {}
) => {
  const LazyRoutes = Object.entries(routes).reduce((acc, [route, importFn]) => {
    acc[route] = createLazyComponent(importFn, options)
    return acc
  }, {} as Record<keyof T, ComponentType<any>>)

  const useRoutePreloader = () => {
    const { preloadComponent, isPreloaded, isPreloading } = useComponentPreloader()

    const preloadRoute = React.useCallback((route: keyof T) => {
      if (routes[route]) {
        preloadComponent(route as string, routes[route])
      }
    }, [preloadComponent, routes])

    const preloadAllRoutes = React.useCallback(() => {
      Object.keys(routes).forEach(route => {
        preloadRoute(route as keyof T)
      })
    }, [preloadRoute, routes])

    return {
      preloadRoute,
      preloadAllRoutes,
      isPreloaded: (route: keyof T) => isPreloaded(route as string),
      isPreloading: (route: keyof T) => isPreloading(route as string)
    }
  }

  return {
    LazyRoutes,
    useRoutePreloader
  }
}

/**
 * Creates a component that shows a loading skeleton while loading
 */
export const createSkeletonLoader = (skeleton: ReactNode) => {
  return ({ children, isLoading, ...props }: { children: ReactNode; isLoading: boolean; [key: string]: any }) => {
    if (isLoading) {
      return <>{skeleton}</>
    }
    return <>{children}</>
  }
}

/**
 * Hook for managing component loading states
 */
export const useComponentLoader = () => {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({})

  const setLoading = React.useCallback((componentId: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [componentId]: isLoading
    }))
  }, [])

  const isLoading = React.useCallback((componentId: string) => {
    return loadingStates[componentId] || false
  }, [loadingStates])

  const clearLoading = React.useCallback((componentId: string) => {
    setLoadingStates(prev => {
      const newState = { ...prev }
      delete newState[componentId]
      return newState
    })
  }, [])

  return {
    setLoading,
    isLoading,
    clearLoading,
    loadingStates
  }
}

/**
 * Utility for creating dynamic imports with better error handling
 */
export const createDynamicImport = <T>(
  importFn: () => Promise<T>,
  options: {
    retryDelay?: number
    maxRetries?: number
    onError?: (error: Error, retryCount: number) => void
  } = {}
) => {
  const { retryDelay = 1000, maxRetries = 3, onError } = options

  return async (retryCount = 0): Promise<T> => {
    try {
      return await importFn()
    } catch (error) {
      if (retryCount < maxRetries) {
        onError?.(error as Error, retryCount)
        await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)))
        return createDynamicImport(importFn, options)(retryCount + 1)
      }
      throw error
    }
  }
}

export default {
  createLazyComponent,
  preloadComponent,
  createParallelLoader,
  useComponentPreloader,
  createRouteSplitter,
  createSkeletonLoader,
  useComponentLoader,
  createDynamicImport
}
