import React from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeVars } from '../../../design-system/theme'
import { LoadingSpinner } from './LoadingSpinner'

interface DataLoadingModalProps {
  isOpen: boolean
  loadingStage: string
  message?: string
}

export const DataLoadingModal: React.FC<DataLoadingModalProps> = ({
  isOpen,
  loadingStage,
  message = 'Loading dataset...'
}) => {
  const { isDark } = useTheme()
  const vars = getThemeVars(isDark)

  if (!isOpen) return null

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.95)',
    zIndex: 20000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
    transition: 'opacity 0.3s ease',
    pointerEvents: 'all',
  }

  const modalStyle: React.CSSProperties = {
    backgroundColor: vars.background.surface,
    borderRadius: '12px',
    padding: '3rem 2.5rem',
    maxWidth: '500px',
    width: '90%',
    boxShadow: isDark 
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: `1px solid ${vars.border.default}`,
    textAlign: 'center',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: vars.text.primary,
    marginBottom: '1rem',
    marginTop: 0,
  }

  const stageStyle: React.CSSProperties = {
    fontSize: '1rem',
    color: vars.text.secondary,
    marginTop: '1.5rem',
    fontWeight: '500',
  }

  const descriptionStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: vars.text.tertiary,
    marginTop: '0.5rem',
    lineHeight: '1.5',
  }

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="loading-title">
      <div style={modalStyle}>
        <h2 id="loading-title" style={titleStyle}>
          {message}
        </h2>
        <LoadingSpinner size="large" message="" />
        <div style={stageStyle}>
          {loadingStage}
        </div>
        <div style={descriptionStyle}>
          Please wait while we prepare your data...
        </div>
      </div>
    </div>
  )
}
