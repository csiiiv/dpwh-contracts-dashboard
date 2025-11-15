import React from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { useAccessibility } from '../../../hooks/useAccessibility'
import { getThemeVars } from '../../../design-system/theme'
import { reducedMotion } from '../../../design-system/accessibility'

interface LoadingSpinnerProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  color?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  color,
  ...props
}) => {
  const { isDark } = useTheme()
  const { isHighContrast, prefersReducedMotion } = useAccessibility()
  
  const vars = getThemeVars()
  const spinnerColor = color || vars.primary[600]
  
  const sizeMap = {
    small: '1rem',
    medium: '2rem',
    large: '3rem'
  }
  
  const spinnerSize = sizeMap[size]
  
  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
  border: `3px solid ${vars.border.light}`,
  borderTop: `3px solid ${spinnerColor}`,
    borderRadius: '50%',
    animation: reducedMotion.getAnimation('spin 1s linear infinite'),
    margin: '0 auto',
  }
  
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '2rem',
    textAlign: 'center' as const,
  }
  
  const messageStyle = {
    color: vars.text.secondary,
    fontSize: size === 'small' ? '0.875rem' : '1rem',
    fontWeight: '500',
  }
  
  if (prefersReducedMotion) {
    return (
      <div style={containerStyle} {...props}>
        <div
          style={{
            ...spinnerStyle,
            border: `3px solid ${spinnerColor}`,
            animation: 'none',
          }}
          aria-hidden="true"
        />
        <div style={messageStyle}>{message}</div>
      </div>
    )
  }
  
  return (
    <div style={containerStyle} {...props}>
      <div style={spinnerStyle} aria-hidden="true" />
      <div style={messageStyle}>{message}</div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}
