import React, { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { getThemeVars } from '../../../design-system/theme'
import { useTheme } from '../../../contexts/ThemeContext'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // In a real app, you would send this to your error reporting service
      console.error('Production error:', { error, errorInfo })
    }

    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const { isDark } = useTheme()
  const vars = getThemeVars(isDark)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '2rem',
        backgroundColor: vars.background.secondary,
        color: vars.text.primary,
        textAlign: 'center',
        borderRadius: '8px',
        border: `1px solid ${vars.border.light}`,
        margin: '1rem',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
      <h2 style={{ marginBottom: '1rem', color: vars.text.primary }}>
        Something went wrong
      </h2>
      <p style={{ marginBottom: '1.5rem', color: vars.text.secondary }}>
        We're sorry, but something unexpected happened. Please try refreshing the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: vars.primary[600],
          color: vars.text.inverse,
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '500',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = vars.primary[700]
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = vars.primary[600]
        }}
      >
        Refresh Page
      </button>
      {process.env.NODE_ENV === 'development' && error && (
        <details style={{ marginTop: '1rem', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
            Error Details (Development)
          </summary>
          <pre
            style={{
              backgroundColor: vars.background.primary,
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.875rem',
              color: vars.text.secondary,
            }}
          >
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}

// HOC for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryClass {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundaryClass>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

export { ErrorBoundaryClass as ErrorBoundary }
