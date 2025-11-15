import React from 'react'
import { getThemeVars } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'

interface FilterChipProps {
  label: string
  onRemove: () => void
  isDark?: boolean
  color?: string
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove, isDark = false, color = '#3b82f6' }) => {
  const vars = getThemeVars(isDark)

  // Generate lighter and darker shades from the color
  const bgColor = `${color}15`
  const borderColor = `${color}40`
  const textColor = color

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[1],
      padding: `${spacing[1]} ${spacing[2]}`,
      backgroundColor: bgColor,
      color: textColor,
      borderRadius: spacing[1],
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      border: `1px solid ${borderColor}`
    }}>
      <span>{label}</span>
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: textColor,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.bold,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '16px',
          height: '16px',
          opacity: 0.8
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8' }}
        aria-label="Remove filter"
      >
        ×
      </button>
    </div>
  )
}
