import React from 'react'
import { getThemeVars } from '../../../design-system/theme'
import { typography, spacing } from '../../../design-system'

export interface FilterChipProps {
  label: string
  value: string
  type: 'contractor' | 'area' | 'organization' | 'category' | 'keyword' | 'timerange' | 'date'
  onRemove: () => void
  isDark?: boolean
}

const FilterChip: React.FC<FilterChipProps> = ({ 
  label, 
  value, 
  type, 
  onRemove, 
  isDark = false 
}) => {
  const vars = getThemeVars(isDark)
  
  const getChipStyle = (type: string) => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      padding: `${spacing[1]} ${spacing[3]}`,
      borderRadius: spacing[2],
      fontSize: typography.fontSize.sm,
      border: '1px solid',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      maxWidth: '200px'
    }

    switch (type) {
      case 'contractor':
        return {
          ...baseStyle,
          backgroundColor: vars.primary[100],
          color: vars.primary[800],
          borderColor: vars.primary[300]
        }
      case 'area':
        return {
          ...baseStyle,
          backgroundColor: vars.success[50],
          color: vars.success[600],
          borderColor: vars.success[500]
        }
      case 'organization':
        return {
          ...baseStyle,
          backgroundColor: vars.warning[50],
          color: vars.warning[600],
          borderColor: vars.warning[500]
        }
      case 'category':
        return {
          ...baseStyle,
          backgroundColor: vars.primary[50],
          color: vars.primary[600],
          borderColor: vars.primary[500]
        }
      case 'keyword':
        return {
          ...baseStyle,
          backgroundColor: vars.primary[50],
          color: vars.primary[600],
          borderColor: vars.primary[500]
        }
      case 'timerange':
        return {
          ...baseStyle,
          backgroundColor: vars.gray[100],
          color: vars.gray[700],
          borderColor: vars.gray[400]
        }
      case 'date':
        return {
          ...baseStyle,
          backgroundColor: vars.warning[50],
          color: vars.warning[700],
          borderColor: vars.warning[400]
        }
      default:
        return {
          ...baseStyle,
          backgroundColor: vars.gray[100],
          color: vars.gray[700],
          borderColor: vars.gray[400]
        }
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'contractor': return '👤'
      case 'area': return '📍'
      case 'organization': return '🏢'
      case 'category': return '📂'
      case 'keyword': return '🔍'
      case 'timerange': return '📅'
      case 'date': return '📅'
      default: return '🏷️'
    }
  }

  return (
    <div
      style={getChipStyle(type)}
      title={`Remove ${label}`}
    >
      <span style={{ marginRight: spacing[1] }}>
        {getIcon(type)}
      </span>
      <span style={{
        flex: 1,
        whiteSpace: 'normal',
        wordBreak: 'break-word',
      }}>
        {label}
      </span>
      <span
        style={{ 
          marginLeft: spacing[1], 
          fontSize: typography.fontSize.xs,
          opacity: 0.7,
          cursor: 'pointer',
          padding: '0 4px',
          userSelect: 'none',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove ${label}`}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onRemove();
          }
        }}
      >
        ×
      </span>
    </div>
  )
}

export { FilterChip }
