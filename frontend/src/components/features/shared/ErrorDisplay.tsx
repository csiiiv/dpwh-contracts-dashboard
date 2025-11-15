import React from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { useAccessibility } from '../../../hooks/useAccessibility'
import { AccessibleButton } from './AccessibleButton'
import { getThemeVars } from '../../../design-system/theme'

interface ErrorDisplayProps {
  error: string | { message?: string }
  onRetry?: () => void
  onDismiss?: () => void
  title?: string
  variant?: 'error' | 'warning' | 'info'
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  title = 'Something went wrong',
  variant = 'error'
}) => {
  const { isDark } = useTheme()
  const { isHighContrast, announce } = useAccessibility()
  
  const vars = getThemeVars()
  
  const getVariantStyles = () => {
    const baseStyles = {
      padding: '1.5rem',
      borderRadius: '0.75rem',
      border: '1px solid',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
    }
    
    switch (variant) {
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: isHighContrast ? '#000000' : vars.error[50],
          borderColor: isHighContrast ? '#ffffff' : 'var(--color-error)',
          color: isHighContrast ? '#ffffff' : 'var(--color-error)'
        }
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: isHighContrast ? '#000000' : vars.warning[50],
          borderColor: isHighContrast ? '#ffffff' : 'var(--color-warning)',
          color: isHighContrast ? '#ffffff' : 'var(--color-warning)'
        }
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: isHighContrast ? '#000000' : vars.primary[50],
          borderColor: isHighContrast ? '#ffffff' : 'var(--color-primary-200)',
          color: isHighContrast ? '#ffffff' : 'var(--color-primary-600)'
        }
      default:
        return baseStyles
    }
  }
  
  const getIcon = () => {
    switch (variant) {
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '❌'
    }
  }
  
  const containerStyle = {
    ...getVariantStyles(),
    margin: '1rem 0',
  }
  
  const iconStyle = {
    fontSize: '1.5rem',
    flexShrink: 0,
  }
  
  const contentStyle = {
    flex: 1,
  }
  
  const titleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
    color: 'inherit',
  }
  
  const messageStyle = {
    fontSize: '0.875rem',
    margin: '0 0 1rem 0',
    color: 'inherit',
    lineHeight: '1.5',
  }
  
  const buttonGroupStyle = {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
  }
  
  // Announce error to screen readers
  React.useEffect(() => {
    const msg = typeof error === 'string' ? error : (error?.message || 'An error occurred')
    announce(`${title}: ${msg}`, 'assertive')
  }, [title, error, announce])
  
  return (
    <div style={containerStyle} role="alert" aria-live="assertive">
      <div style={iconStyle} aria-hidden="true">
        {getIcon()}
      </div>
      
      <div style={contentStyle}>
        <h3 style={titleStyle}>{title}</h3>
        <p style={messageStyle}>{typeof error === 'string' ? error : (error?.message || 'An error occurred')}</p>
        
        <div style={buttonGroupStyle}>
          {onRetry && (
            <AccessibleButton
              variant="primary"
              size="sm"
              onClick={onRetry}
              announceOnClick
              announceText="Retrying operation"
            >
              Try Again
            </AccessibleButton>
          )}
          
          {onDismiss && (
            <AccessibleButton
              variant="secondary"
              size="sm"
              onClick={onDismiss}
              announceOnClick
              announceText="Error dismissed"
            >
              Dismiss
            </AccessibleButton>
          )}
        </div>
      </div>
    </div>
  )
}
