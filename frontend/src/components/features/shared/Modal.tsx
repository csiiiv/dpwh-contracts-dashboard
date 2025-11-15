import React from 'react'
import { createModalStyles, ModalSizes, ModalConfig } from './ModalStyles'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  isDark?: boolean
  size?: keyof typeof ModalSizes | ModalConfig['size']
  zIndex?: number
  showFooter?: boolean
  footerContent?: React.ReactNode
  headerActions?: React.ReactNode
  className?: string
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  isDark = false,
  size = 'large',
  zIndex,
  showFooter = false,
  footerContent,
  headerActions,
  className,
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  // Handle escape key
  React.useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeOnEscape, onClose])

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle close button hover
  const handleCloseButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHovering: boolean) => {
    if (isHovering) {
      e.currentTarget.style.backgroundColor = isDark ? '#4b5563' : '#e5e7eb'
    } else {
      e.currentTarget.style.backgroundColor = 'transparent'
    }
  }

  if (!open) return null

  console.log('🔷 [Modal] Rendering modal:', { open, title, isDark })

  const modalSize = typeof size === 'string' ? ModalSizes[size] : size
  const styles = createModalStyles(isDark, { size: modalSize, zIndex, showFooter })

  return (
    <div
      style={styles.modal}
      onClick={handleOverlayClick}
      className={className}
    >
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {headerActions}
            <button
              onClick={onClose}
              style={styles.closeButton}
              onMouseEnter={(e) => handleCloseButtonHover(e, true)}
              onMouseLeave={(e) => handleCloseButtonHover(e, false)}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div style={styles.footer}>
            {footerContent}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Higher-order component for easy modal creation
 */
export const withModal = <P extends object>(
  Component: React.ComponentType<P>,
  defaultProps: Partial<ModalProps> = {}
) => {
  return React.forwardRef<HTMLDivElement, P & Omit<ModalProps, 'children'>>((props, ref) => (
    <Modal {...defaultProps} {...props}>
      <Component {...(props as P)} ref={ref} />
    </Modal>
  ))
}

/**
 * Hook for modal state management
 */
export const useModal = (initialOpen: boolean = false) => {
  const [open, setOpen] = React.useState(initialOpen)

  const openModal = React.useCallback(() => setOpen(true), [])
  const closeModal = React.useCallback(() => setOpen(false), [])
  const toggleModal = React.useCallback(() => setOpen(prev => !prev), [])

  return {
    open,
    openModal,
    closeModal,
    toggleModal
  }
}
