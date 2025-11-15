import React, { forwardRef, useCallback, useRef, useEffect } from 'react'
import { useAccessibility } from '../../../hooks/useAccessibility'
import { accessibility } from '../../../design-system/accessibility'
import { useScreenReaderAnnouncements, useFocusManagement } from '../../../utils/accessibility'

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  announceOnClick?: boolean
  announceText?: string
  pressed?: boolean
  expanded?: boolean
  controls?: string
  describedBy?: string
  liveRegion?: 'polite' | 'assertive'
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText = 'Loading...',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      announceOnClick = false,
      announceText,
      pressed,
      expanded,
      controls,
      describedBy,
      liveRegion = 'polite',
      children,
      className = '',
      style,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const { announce, isHighContrast, getAnimation, getTransition } = useAccessibility()

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) {
          e.preventDefault()
          return
        }

        if (announceOnClick) {
          const text = announceText || (typeof children === 'string' ? children : 'Button clicked')
          announce(text, liveRegion)
        }

        onClick?.(e)
      },
      [loading, disabled, announceOnClick, announceText, children, onClick, announce]
    )

    const getVariantStyles = () => {
      const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        border: 'none',
        borderRadius: '0.375rem',
        fontWeight: '500',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: getTransition('all 0.2s ease-in-out'),
        opacity: disabled || loading ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        position: 'relative',
        overflow: 'hidden',
      }

      const sizeStyles = {
        sm: {
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
          minHeight: accessibility.touchTarget.minSize,
        },
        md: {
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          minHeight: accessibility.touchTarget.recommendedSize,
        },
        lg: {
          padding: '1rem 1.5rem',
          fontSize: '1.125rem',
          minHeight: accessibility.touchTarget.recommendedSize,
        },
      }

      const variantStyles = {
        primary: {
          backgroundColor: isHighContrast ? '#0000ff' : '#3b82f6',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: isHighContrast ? '#0000cc' : '#2563eb',
          },
          '&:focus': {
            outline: `2px solid ${accessibility.focus.ring.color.light}`,
            outlineOffset: '2px',
          },
        },
        secondary: {
          backgroundColor: isHighContrast ? '#ffffff' : '#f3f4f6',
          color: isHighContrast ? '#000000' : '#374151',
          border: `1px solid ${isHighContrast ? '#000000' : '#d1d5db'}`,
          '&:hover': {
            backgroundColor: isHighContrast ? '#f0f0f0' : '#e5e7eb',
          },
          '&:focus': {
            outline: `2px solid ${accessibility.focus.ring.color.light}`,
            outlineOffset: '2px',
          },
        },
        danger: {
          backgroundColor: isHighContrast ? '#ff0000' : '#ef4444',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: isHighContrast ? '#cc0000' : '#dc2626',
          },
          '&:focus': {
            outline: `2px solid ${accessibility.focus.ring.color.light}`,
            outlineOffset: '2px',
          },
        },
        ghost: {
          backgroundColor: 'transparent',
          color: isHighContrast ? '#000000' : '#374151',
          '&:hover': {
            backgroundColor: isHighContrast ? '#f0f0f0' : '#f3f4f6',
          },
          '&:focus': {
            outline: `2px solid ${accessibility.focus.ring.color.light}`,
            outlineOffset: '2px',
          },
        },
      }

      return {
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }
    }

    const buttonStyles = {
      ...getVariantStyles(),
      ...style,
    }

    const iconElement = icon && (
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          animation: loading ? getAnimation('spin 1s linear infinite', 'none') : 'none',
        }}
        aria-hidden="true"
      >
        {icon}
      </span>
    )

    const content = (
      <>
        {icon && iconPosition === 'left' && iconElement}
        {loading ? (
          <>
            <span
              style={{
                display: 'inline-block',
                width: '1rem',
                height: '1rem',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: getAnimation('spin 1s linear infinite', 'none'),
              }}
              aria-hidden="true"
            />
            <span className="sr-only">{loadingText}</span>
          </>
        ) : (
          children
        )}
        {icon && iconPosition === 'right' && iconElement}
      </>
    )

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || loading}
        onClick={handleClick}
        className={className}
        style={buttonStyles}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        aria-pressed={pressed}
        aria-expanded={expanded}
        aria-controls={controls}
        aria-describedby={describedBy}
        {...props}
      >
        {content}
      </button>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

// Screen reader only text component
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      ...accessibility.screenReader.only,
    }}
  >
    {children}
  </span>
)

// Focus trap component
export const FocusTrap: React.FC<{
  children: React.ReactNode
  active: boolean
  onEscape?: () => void
}> = ({ children, active, onEscape }) => {
  const { trapFocus, handleEscape } = useAccessibility()
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!active || !containerRef.current) return

    const cleanup = trapFocus(containerRef.current)
    return cleanup
  }, [active, trapFocus])

  React.useEffect(() => {
    if (!active || !onEscape) return

    const handleKeyDown = (e: KeyboardEvent) => {
      handleEscape(e, onEscape)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active, onEscape, handleEscape])

  if (!active) return <>{children}</>

  return (
    <div
      ref={containerRef}
      style={{
        outline: 'none',
      }}
      tabIndex={-1}
    >
      {children}
    </div>
  )
}

// Skip link component
export const SkipLink: React.FC<{
  href: string
  children: React.ReactNode
}> = ({ href, children }) => (
  <a
    href={href}
    style={{
      ...accessibility.screenReader.only,
      position: 'absolute',
      top: '0.5rem',
      left: '0.5rem',
      zIndex: 1000,
      padding: '0.75rem 1rem',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      textDecoration: 'none',
      borderRadius: '0.375rem',
      fontWeight: '500',
      '&:focus': {
        ...accessibility.screenReader.visible,
        position: 'absolute',
      },
    }}
    onFocus={(e) => {
      e.currentTarget.style.position = 'absolute'
      Object.assign(e.currentTarget.style, accessibility.screenReader.visible)
    }}
    onBlur={(e) => {
      Object.assign(e.currentTarget.style, accessibility.screenReader.only)
    }}
  >
    {children}
  </a>
)
