import { typography } from '../../../design-system'

/**
 * Configuration interface for contract row layout
 */
export interface ContractRowConfig {
  maxLines: {
    contractors: number
    description: number
  }
  lineHeight: number
  fontSize: {
    primary: string
    secondary: string
  }
}

/**
 * Preset configurations for different table layouts
 */
export const TABLE_CONFIGS = {
  /**
   * Compact layout - 1 line each
   * Best for: High-density tables, mobile views
   * Records per screen: ~12-15
   */
  compact: {
    maxLines: {
      contractors: 1,
      description: 1
    },
    lineHeight: 1.5,
    fontSize: {
      primary: typography.fontSize.xs,
      secondary: typography.fontSize.xs
    }
  },

  /**
   * Default layout - 2 lines each
   * Best for: Standard desktop views
   * Records per screen: ~7-8
   */
  default: {
    maxLines: {
      contractors: 2,
      description: 2
    },
    lineHeight: 2.0,
    fontSize: {
      primary: typography.fontSize.sm,
      secondary: typography.fontSize.xs
    }
  },

  /**
   * Expanded layout - 3 lines each
   * Best for: Detailed views, large screens
   * Records per screen: ~5-6
   */
  expanded: {
    maxLines: {
      contractors: 3,
      description: 3
    },
    lineHeight: 2.0,
    fontSize: {
      primary: typography.fontSize.sm,
      secondary: typography.fontSize.xs
    }
  },

  /**
   * Detailed layout - 4 lines each
   * Best for: Full information display
   * Records per screen: ~3-4
   */
  detailed: {
    maxLines: {
      contractors: 4,
      description: 4
    },
    lineHeight: 2.0,
    fontSize: {
      primary: typography.fontSize.sm,
      secondary: typography.fontSize.xs
    }
  }
} as const

/**
 * Default configuration (3 lines)
 */
export const DEFAULT_ROW_CONFIG: ContractRowConfig = TABLE_CONFIGS.expanded

/**
 * Calculate derived layout values from configuration
 */
export const getLayoutValues = (config: ContractRowConfig) => {
  const row2Height = `${config.maxLines.description * config.lineHeight}em`
  
  return {
    contractorsLines: config.maxLines.contractors,
    descriptionLines: config.maxLines.description,
    lineHeight: config.lineHeight,
    row2Height,
    estimatedRowHeight: calculateRowHeight(config)
  }
}

/**
 * Calculate approximate row height in pixels (assuming 16px base)
 */
function calculateRowHeight(config: ContractRowConfig): number {
  const baseFontSize = 16
  const spacing = 8 // spacing[2] in pixels
  
  // Row 1 height
  const row1ContentHeight = config.maxLines.contractors * config.lineHeight * baseFontSize
  const row1Height = spacing + row1ContentHeight + spacing
  
  // Row 2 height
  const row2ContentHeight = config.maxLines.description * config.lineHeight * baseFontSize
  const row2Height = 0 + row2ContentHeight + spacing // 0 top padding
  
  // Border
  const border = 1
  
  return Math.ceil(row1Height + row2Height + border)
}

/**
 * Type for preset config keys
 */
export type TableConfigPreset = keyof typeof TABLE_CONFIGS


