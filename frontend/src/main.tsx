import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/features/shared/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'
import { registerServiceWorker } from './utils/serviceWorker'
import './index.css'
import App from './App.tsx'

// Performance monitoring disabled to reduce console spam
// if (process.env.NODE_ENV === 'development') {
//   // Enable React DevTools profiler
//   if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
//     (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = (id: any, _root: any, priorityLevel: any) => {
//       // Track render performance
//       console.log('React render completed', { id, priorityLevel })
//     }
//   }
// }

// Register service worker
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker({
    onSuccess: () => {
      console.log('Service worker registered successfully')
    },
    onError: (error) => {
      console.error('Service worker registration failed:', error)
    },
  }).catch((error) => {
    console.error('Service worker registration error:', error)
  })
}

// Error boundary for the entire app
const AppWithErrorBoundary = () => (
  <ThemeProvider>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
          console.error('App error:', { error, errorInfo })
          // In a real app, you would send this to your error reporting service
          // errorReportingService.captureException(error, { extra: errorInfo })
        }
      }}
    >
      <App />
    </ErrorBoundary>
  </ThemeProvider>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithErrorBoundary />
  </StrictMode>,
)
