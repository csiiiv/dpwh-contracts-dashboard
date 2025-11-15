import React from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeVars } from '../../../design-system/theme'
import { typography, spacing, commonStyles } from '../../../design-system'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme()
  const vars = getThemeVars(isDark)

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        padding: `${spacing[2]} ${spacing[3]}`,
        backgroundColor: 'transparent',
        border: `1px solid ${vars.border.medium}`,
        borderRadius: commonStyles.borderRadius.md,
        color: vars.text.primary,
        cursor: 'pointer',
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        transition: commonStyles.transition.base,
        outline: 'none',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = vars.background.secondary
        e.currentTarget.style.borderColor = vars.primary[400]
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.borderColor = vars.border.medium
      }}
      onFocus={(e) => {
        e.currentTarget.style.backgroundColor = vars.background.secondary
        e.currentTarget.style.borderColor = vars.primary[400]
        e.currentTarget.style.boxShadow = `0 0 0 2px ${vars.primary[200]}`
      }}
      onBlur={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.borderColor = vars.border.medium
        e.currentTarget.style.boxShadow = 'none'
      }}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span style={{ fontSize: '16px' }}>
        {isDark ? '☀️' : '🌙'}
      </span>
      <span>
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}

