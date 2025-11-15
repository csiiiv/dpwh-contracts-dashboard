// Theme-aware color system
export const getThemeColors = (isDark: boolean) => ({
  // Primary Colors (same for both themes)
  primary: {
    50: isDark ? '#1e3a8a' : '#eff6ff',
    100: isDark ? '#1e40af' : '#dbeafe',
    200: isDark ? '#1d4ed8' : '#bfdbfe',
    300: isDark ? '#2563eb' : '#93c5fd',
    400: isDark ? '#3b82f6' : '#60a5fa',
    500: '#3b82f6', // Main primary
    600: isDark ? '#60a5fa' : '#2563eb',
    700: isDark ? '#93c5fd' : '#1d4ed8',
    800: isDark ? '#bfdbfe' : '#1e40af',
    900: isDark ? '#dbeafe' : '#1e3a8a',
  },
  
  // Secondary Colors
  secondary: {
    50: isDark ? '#14532d' : '#f0fdf4',
    100: isDark ? '#166534' : '#dcfce7',
    200: isDark ? '#15803d' : '#bbf7d0',
    300: isDark ? '#16a34a' : '#86efac',
    400: isDark ? '#22c55e' : '#4ade80',
    500: '#22c55e',
    600: isDark ? '#4ade80' : '#16a34a',
    700: isDark ? '#86efac' : '#15803d',
    800: isDark ? '#bbf7d0' : '#166534',
    900: isDark ? '#dcfce7' : '#14532d',
  },
  
  // Gray Scale
  gray: {
    50: isDark ? '#111827' : '#f9fafb',
    100: isDark ? '#1f2937' : '#f3f4f6',
    200: isDark ? '#374151' : '#e5e7eb',
    300: isDark ? '#4b5563' : '#d1d5db',
    400: isDark ? '#6b7280' : '#9ca3af',
    500: '#6b7280',
    600: isDark ? '#9ca3af' : '#4b5563',
    700: isDark ? '#d1d5db' : '#374151',
    800: isDark ? '#e5e7eb' : '#1f2937',
    900: isDark ? '#f3f4f6' : '#111827',
  },
  
  // Semantic Colors
  success: {
    50: isDark ? '#14532d' : '#f0fdf4',
    500: '#22c55e',
    600: isDark ? '#4ade80' : '#16a34a',
  },
  
  warning: {
    50: isDark ? '#92400e' : '#fffbeb',
    500: '#f59e0b',
    600: isDark ? '#fbbf24' : '#d97706',
  },
  
  error: {
    50: isDark ? '#991b1b' : '#fef2f2',
    500: '#ef4444',
    600: isDark ? '#f87171' : '#dc2626',
  },
  
  // Background Colors
  background: {
    primary: isDark ? '#111827' : '#ffffff',
    secondary: isDark ? '#1f2937' : '#f9fafb',
    tertiary: isDark ? '#374151' : '#f3f4f6',
  },
  
  // Text Colors
  text: {
    primary: isDark ? '#f9fafb' : '#111827',
    secondary: isDark ? '#d1d5db' : '#6b7280',
    tertiary: isDark ? '#9ca3af' : '#9ca3af',
    inverse: isDark ? '#111827' : '#ffffff',
  },
  
  // Border Colors
  border: {
    light: isDark ? '#374151' : '#e5e7eb',
    medium: isDark ? '#4b5563' : '#d1d5db',
    dark: isDark ? '#6b7280' : '#9ca3af',
  }
})

// CSS custom properties for theme switching
export const getThemeCSSVariables = (isDark: boolean) => {
  const colors = getThemeColors(isDark)
  
  return {
    '--color-primary-50': colors.primary[50],
    '--color-primary-100': colors.primary[100],
    '--color-primary-200': colors.primary[200],
    '--color-primary-300': colors.primary[300],
    '--color-primary-400': colors.primary[400],
    '--color-primary-500': colors.primary[500],
    '--color-primary-600': colors.primary[600],
    '--color-primary-700': colors.primary[700],
    '--color-primary-800': colors.primary[800],
    '--color-primary-900': colors.primary[900],
    
    '--color-background-primary': colors.background.primary,
    '--color-background-secondary': colors.background.secondary,
    '--color-background-tertiary': colors.background.tertiary,
    
    '--color-text-primary': colors.text.primary,
    '--color-text-secondary': colors.text.secondary,
    '--color-text-tertiary': colors.text.tertiary,
    '--color-text-inverse': colors.text.inverse,
    
    '--color-border-light': colors.border.light,
    '--color-border-medium': colors.border.medium,
    '--color-border-dark': colors.border.dark,
    
    // semantic colors (provide distinct shades for proper contrast)
    '--color-success-50': colors.success[50],
    '--color-success-500': colors.success[500],
    '--color-success-600': colors.success[600],
    '--color-warning-50': colors.warning[50],
    '--color-warning-500': colors.warning[500],
    '--color-warning-600': colors.warning[600],
    '--color-error-50': colors.error[50],
    '--color-error-500': colors.error[500],
    '--color-error-600': colors.error[600],
  }
}

// Return a parallel object that contains CSS var() references instead of hex colors.
export const getThemeVars = (/* isDark: boolean */) => {
  // We intentionally ignore isDark here because CSS variables are applied at runtime by ThemeProvider.
  // Consumers should prefer these var(...) strings when writing styles that should respond to data-theme.
  return {
    primary: {
      50: 'var(--color-primary-50)',
      100: 'var(--color-primary-100)',
      200: 'var(--color-primary-200)',
      300: 'var(--color-primary-300)',
      400: 'var(--color-primary-400)',
      500: 'var(--color-primary-500)',
      600: 'var(--color-primary-600)',
      700: 'var(--color-primary-700)',
      800: 'var(--color-primary-800)',
      900: 'var(--color-primary-900)'
    },
    background: {
      primary: 'var(--color-background-primary)',
      secondary: 'var(--color-background-secondary)',
      tertiary: 'var(--color-background-tertiary)'
    },
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      tertiary: 'var(--color-text-tertiary)',
      inverse: 'var(--color-text-inverse)'
    },
    border: {
      light: 'var(--color-border-light)',
      medium: 'var(--color-border-medium)',
      dark: 'var(--color-border-dark)'
    },
    gray: {
      50: 'var(--color-primary-50)',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    // semantic tokens
    success: {
      50: 'var(--color-success-50)',
      500: 'var(--color-success-500)',
      600: 'var(--color-success-600)'
    },
    warning: {
      50: 'var(--color-warning-50)',
      500: 'var(--color-warning-500)',
      600: 'var(--color-warning-600)'
    },
    error: {
      50: 'var(--color-error-50)',
      500: 'var(--color-error-500)',
      600: 'var(--color-error-600)'
    }
  }
}

// Typed token names for themeVar helper
export type ThemeToken =
  | 'text.primary'
  | 'text.secondary'
  | 'text.inverse'
  | 'background.primary'
  | 'background.secondary'
  | 'background.tertiary'
  | 'border.light'
  | 'border.medium'
  | 'primary.50'
  | 'primary.100'
  | 'primary.200'
  | 'primary.300'
  | 'primary.400'
  | 'primary.500'
  | 'primary.600'
  | 'primary.700'
  | 'primary.800'
  | 'primary.900'
  | 'success.50'
  | 'success.500'
  | 'success.600'
  | 'warning.50'
  | 'warning.500'
  | 'warning.600'
  | 'error.50'
  | 'error.500'
  | 'error.600'

// Small helper to return a CSS var string for a semantic token
export const themeVar = (token: ThemeToken): string => {
  const map: Record<ThemeToken, string> = {
    'text.primary': 'var(--color-text-primary)',
    'text.secondary': 'var(--color-text-secondary)',
    'text.inverse': 'var(--color-text-inverse)',
    'background.primary': 'var(--color-background-primary)',
    'background.secondary': 'var(--color-background-secondary)',
    'background.tertiary': 'var(--color-background-tertiary)',
    'border.light': 'var(--color-border-light)',
    'border.medium': 'var(--color-border-medium)',
    'primary.50': 'var(--color-primary-50)',
    'primary.100': 'var(--color-primary-100)',
    'primary.200': 'var(--color-primary-200)',
    'primary.300': 'var(--color-primary-300)',
    'primary.400': 'var(--color-primary-400)',
    'primary.500': 'var(--color-primary-500)',
    'primary.600': 'var(--color-primary-600)',
    'primary.700': 'var(--color-primary-700)',
    'primary.800': 'var(--color-primary-800)',
    'primary.900': 'var(--color-primary-900)',
    'success.50': 'var(--color-success-50)',
    'success.500': 'var(--color-success-500)',
    'success.600': 'var(--color-success-600)',
    'warning.50': 'var(--color-warning-50)',
    'warning.500': 'var(--color-warning-500)',
    'warning.600': 'var(--color-warning-600)',
    'error.50': 'var(--color-error-50)',
    'error.500': 'var(--color-error-500)',
    'error.600': 'var(--color-error-600)'
  }
  return map[token]
}

