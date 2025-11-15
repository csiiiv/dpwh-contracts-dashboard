interface ServiceWorkerConfig {
  enabled: boolean
  scope: string
  updateInterval: number
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onSuccess?: (registration: ServiceWorkerRegistration) => void
  onError?: (error: Error) => void
}

const defaultConfig: ServiceWorkerConfig = {
  enabled: process.env.NODE_ENV === 'production',
  scope: '/',
  updateInterval: 60000, // 1 minute
  onUpdate: (registration) => {
    console.log('Service worker updated:', registration)
  },
  onSuccess: (registration) => {
    console.log('Service worker registered successfully:', registration)
  },
  onError: (error) => {
    console.error('Service worker registration failed:', error)
  },
}

export const registerServiceWorker = (config: Partial<ServiceWorkerConfig> = {}) => {
  const mergedConfig = { ...defaultConfig, ...config }

  if (!mergedConfig.enabled || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve, reject) => {
    navigator.serviceWorker
      .register('/sw.js', { scope: mergedConfig.scope })
      .then((registration) => {
        mergedConfig.onSuccess?.(registration)

        // Check for updates periodically
        const checkForUpdates = () => {
          registration.update().catch((error) => {
            console.warn('Service worker update check failed:', error)
          })
        }

        // Check for updates on page load
        checkForUpdates()

        // Set up periodic update checks
        const updateInterval = setInterval(checkForUpdates, mergedConfig.updateInterval)

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                mergedConfig.onUpdate?.(registration)
                clearInterval(updateInterval)
              }
            })
          }
        })

        // Listen for controller changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })

        resolve()
      })
      .catch((error) => {
        mergedConfig.onError?.(error)
        reject(error)
      })
  })
}

export const unregisterServiceWorker = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve()
  }

  return navigator.serviceWorker.getRegistrations().then((registrations) => {
    const unregisterPromises = registrations.map((registration) => registration.unregister())
    return Promise.all(unregisterPromises)
  })
}

// Hook for service worker management
export const useServiceWorker = (config: Partial<ServiceWorkerConfig> = {}) => {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const register = async () => {
      try {
        await registerServiceWorker({
          ...config,
          onSuccess: (registration) => {
            setIsRegistered(true)
            config.onSuccess?.(registration)
          },
          onUpdate: (registration) => {
            setIsUpdateAvailable(true)
            config.onUpdate?.(registration)
          },
          onError: (error) => {
            setError(error)
            config.onError?.(error)
          },
        })
      } catch (err) {
        setError(err as Error)
      }
    }

    register()
  }, [])

  const updateServiceWorker = () => {
    if (isUpdateAvailable) {
      window.location.reload()
    }
  }

  return {
    isRegistered,
    isUpdateAvailable,
    error,
    updateServiceWorker,
  }
}

// Import useState for the hook
import { useState, useEffect } from 'react'
