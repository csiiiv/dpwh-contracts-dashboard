import { spacing, typography } from '../../../design-system'
import { getThemeVars } from '../../../design-system/theme'

export interface ModalStyles {
  modal: React.CSSProperties
  panel: React.CSSProperties
  header: React.CSSProperties
  title: React.CSSProperties
  closeButton: React.CSSProperties
  content: React.CSSProperties
  footer?: React.CSSProperties
}

export interface ModalSize {
  width?: string | number
  maxWidth?: string | number
  height?: string | number
  maxHeight?: string | number
}

export interface ModalConfig {
  isDark?: boolean
  size?: ModalSize
  zIndex?: number
  showFooter?: boolean
}

/**
 * Creates unified modal styles based on the excellent patterns from EntityDrillDownModal
 * This ensures consistency across all modals in the application
 */
export const createModalStyles = (
  isDark: boolean = false,
  config: ModalConfig = {}
): ModalStyles => {
  const vars = getThemeVars(isDark)
  const {
    size = {
      width: '1000px',
      maxWidth: '90vw',
      maxHeight: '90vh'
    },
    zIndex = 10000,
    showFooter = false
  } = config

  return {
    modal: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex,
      padding: spacing[4]
    },
    panel: {
      backgroundColor: vars.background.primary,
      borderRadius: '12px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      width: size.width,
      maxWidth: size.maxWidth,
      height: size.height,
      maxHeight: size.maxHeight,
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      padding: spacing[4],
      borderBottom: `1px solid ${vars.border.light}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: vars.background.secondary,
      borderRadius: '12px 12px 0 0'
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: vars.text.primary,
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: vars.text.secondary,
      padding: spacing[1],
      borderRadius: spacing[1],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: vars.background.tertiary
      }
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: spacing[4]
    },
    ...(showFooter && {
      footer: {
        padding: spacing[4],
        borderTop: `1px solid ${vars.border.light}`,
        backgroundColor: vars.background.secondary,
        borderRadius: '0 0 12px 12px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: spacing[3]
      }
    })
  }
}

/**
 * Predefined modal sizes for common use cases
 */
export const ModalSizes = {
  small: {
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '80vh'
  },
  medium: {
    width: '900px',
    maxWidth: '90vw',
    maxHeight: '85vh'
  },
  large: {
    width: '1200px',
    maxWidth: '90vw',
    maxHeight: '90vh'
  },
  xlarge: {
    width: '1400px',
    maxWidth: '95vw',
    maxHeight: '95vh'
  },
  fullscreen: {
    width: '100vw',
    height: '100vh',
    maxWidth: '100vw',
    maxHeight: '100vh'
  }
} as const

/**
 * Common modal z-index values
 */
export const ModalZIndex = {
  modal: 10000,
  dropdown: 1000,
  tooltip: 5000,
  notification: 15000
} as const

/**
 * Hook for easy modal styling
 */
export const useModalStyles = (isDark: boolean = false, config: ModalConfig = {}) => {
  return createModalStyles(isDark, config)
}

/**
 * Utility function to create responsive modal styles
 */
export const createResponsiveModalStyles = (
  isDark: boolean = false,
  config: ModalConfig = {}
): ModalStyles => {
  const baseStyles = createModalStyles(isDark, config)
  
  return {
    ...baseStyles,
    panel: {
      ...baseStyles.panel,
      '@media (max-width: 768px)': {
        width: '95vw',
        height: '95vh',
        maxWidth: '95vw',
        maxHeight: '95vh',
        borderRadius: '8px'
      }
    }
  }
}

// ============================================================================
// UNIFIED TABLE STYLES
// ============================================================================

export interface TableStyles {
  container: React.CSSProperties
  table: React.CSSProperties
  header: React.CSSProperties
  headerCell: React.CSSProperties
  body: React.CSSProperties
  row: React.CSSProperties
  cell: React.CSSProperties
  cellAmount: React.CSSProperties
  cellNumber: React.CSSProperties
  cellCenter: React.CSSProperties
  loading: React.CSSProperties
  empty: React.CSSProperties
  hover: React.CSSProperties
}

export interface TableConfig {
  isDark?: boolean
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  compact?: boolean
  sortable?: boolean
}

/**
 * Creates unified table styles based on the excellent patterns from SearchResults
 * This ensures consistency across all tables in the application
 */
export const createTableStyles = (
  isDark: boolean = false,
  config: TableConfig = {}
): TableStyles => {
  const vars = getThemeVars(isDark)
  const {
    striped = true,
    hoverable = true,
    bordered = true,
    compact = false,
    sortable = false
  } = config

  const padding = compact ? spacing[2] : spacing[3]
  const fontSize = compact ? typography.fontSize.xs : typography.fontSize.sm

  return {
    container: {
      backgroundColor: vars.background.primary,
      borderRadius: spacing[2],
      border: bordered ? `1px solid ${vars.border.light}` : 'none',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize,
      color: vars.text.primary
    },
    header: {
      backgroundColor: isDark ? vars.background.secondary : vars.background.tertiary,
      borderBottom: `1px solid ${vars.border.medium}`
    },
    headerCell: {
      padding: `${padding} ${spacing[4]}`,
      textAlign: 'left' as const,
      fontSize,
      fontWeight: typography.fontWeight.medium,
      color: vars.text.primary,
      backgroundColor: isDark ? vars.background.secondary : vars.background.tertiary,
      borderBottom: `1px solid ${vars.border.medium}`,
      cursor: sortable ? 'pointer' : 'default',
      userSelect: 'none' as const,
      transition: 'background-color 0.2s ease',
      whiteSpace: 'nowrap' as const
    },
    body: {
      backgroundColor: vars.background.primary
    },
    row: {
      borderBottom: `1px solid ${vars.border.light}`,
      transition: hoverable ? 'background-color 0.2s ease' : 'none',
      ':hover': hoverable ? {
        backgroundColor: isDark ? vars.background.secondary : vars.background.tertiary
      } : {}
    },
    cell: {
      padding: `${padding} ${spacing[4]}`,
      fontSize,
      color: vars.text.primary,
      borderBottom: `1px solid ${vars.border.light}`,
      verticalAlign: 'top' as const,
      wordWrap: 'break-word' as const,
      wordBreak: 'break-word' as const,
      whiteSpace: 'normal' as const,
      maxWidth: '200px'
    },
    cellAmount: {
      padding: `${padding} ${spacing[4]}`,
      fontSize,
      color: vars.text.primary,
      borderBottom: `1px solid ${vars.border.light}`,
      verticalAlign: 'top' as const,
      whiteSpace: 'nowrap' as const,
      textAlign: 'right' as const,
      minWidth: '120px',
      fontWeight: typography.fontWeight.medium
    },
    cellNumber: {
      padding: `${padding} ${spacing[4]}`,
      fontSize,
      color: vars.text.secondary,
      borderBottom: `1px solid ${vars.border.light}`,
      verticalAlign: 'top' as const,
      whiteSpace: 'nowrap' as const,
      textAlign: 'right' as const,
      minWidth: '80px',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    },
    cellCenter: {
      padding: `${padding} ${spacing[4]}`,
      fontSize,
      color: vars.text.secondary,
      borderBottom: `1px solid ${vars.border.light}`,
      verticalAlign: 'top' as const,
      whiteSpace: 'nowrap' as const,
      textAlign: 'center' as const,
      minWidth: '60px',
      fontWeight: typography.fontWeight.medium
    },
    loading: {
      padding: spacing[8],
      textAlign: 'center' as const,
      color: vars.text.secondary,
      fontSize: typography.fontSize.sm
    },
    empty: {
      padding: spacing[8],
      textAlign: 'center' as const,
      color: vars.text.secondary,
      fontStyle: 'italic' as const,
      fontSize: typography.fontSize.sm
    },
    hover: {
      backgroundColor: isDark ? vars.background.secondary : vars.background.tertiary
    }
  }
}

/**
 * Predefined table configurations for common use cases
 */
export const TableConfigs = {
  default: {
    striped: true,
    hoverable: true,
    bordered: true,
    compact: false,
    sortable: false
  },
  compact: {
    striped: true,
    hoverable: true,
    bordered: true,
    compact: true,
    sortable: false
  },
  sortable: {
    striped: true,
    hoverable: true,
    bordered: true,
    compact: false,
    sortable: true
  },
  minimal: {
    striped: false,
    hoverable: false,
    bordered: false,
    compact: true,
    sortable: false
  },
  analytics: {
    striped: true,
    hoverable: true,
    bordered: true,
    compact: false,
    sortable: true
  }
} as const

/**
 * Hook for easy table styling
 */
export const useTableStyles = (isDark: boolean = false, config: TableConfig = {}) => {
  return createTableStyles(isDark, config)
}

/**
 * Utility functions for common table operations
 */
export const TableUtils = {
  formatCurrency: (amount: number | string, currency: string = 'PHP'): string => {
    if (amount === null || amount === undefined || amount === '' || isNaN(Number(amount))) {
      return '₱0'
    }
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
    if (isNaN(numAmount)) {
      return '₱0'
    }
    
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount)
  },

  formatNumber: (value: number | string): string => {
    if (value === null || value === undefined || value === '') {
      return '0'
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value)
    if (isNaN(numValue)) {
      return '0'
    }
    
    return new Intl.NumberFormat('en-PH').format(numValue)
  },

  formatDate: (dateString: string): string => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  },

  getSortIcon: (sortKey: string, currentKey: string, direction: 'asc' | 'desc'): string => {
    if (sortKey !== currentKey) {
      return '↕️'
    }
    return direction === 'asc' ? '↑' : '↓'
  }
}
