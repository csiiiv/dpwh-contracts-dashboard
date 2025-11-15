import React from 'react'
import { getThemeVars } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'

interface FilterChipProps {
  label: string
  onRemove: () => void
  isDark?: boolean
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove, isDark = false }) => {
  const vars = getThemeVars(isDark)

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[1],
      padding: `${spacing[1]} ${spacing[2]}`,
      backgroundColor: vars.primary[100],
      color: vars.primary[800],
      borderRadius: spacing[1],
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      border: `1px solid ${vars.primary[300]}`
    }}>
      <span>{label}</span>
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: vars.primary[600],
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.bold,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '16px',
          height: '16px'
        }}
        aria-label="Remove filter"
      >
        ×
      </button>
    </div>
  )
}
