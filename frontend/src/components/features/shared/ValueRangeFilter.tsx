import React, { useState, useCallback, useEffect } from 'react'
import { getThemeVars } from '../../../design-system/theme'
import { typography, spacing } from '../../../design-system'

export interface ValueRange {
  min?: number
  max?: number
}

export interface ValueRangeFilterProps {
  value: ValueRange
  onChange: (range: ValueRange) => void
  isDark?: boolean
  disabled?: boolean
  className?: string
  minValue?: number
  maxValue?: number
  currency?: string
  showPresets?: boolean
  showSlider?: boolean
  showInputs?: boolean
  minHeight?: string
}

// Utility functions for number formatting
const parseValue = (input: string): number | null => {
  if (!input || input.trim() === '') return null
  
  const cleanInput = input.trim().toUpperCase()
  // Updated regex to handle more formats: 1K, 1.5M, 1,000K, etc.
  const numberMatch = cleanInput.match(/^([\d,]+\.?\d*)\s*([KMBT]?)$/)
  
  if (!numberMatch) return null
  
  const [, numberStr, suffix] = numberMatch
  // Remove commas and parse the number
  const number = parseFloat(numberStr.replace(/,/g, ''))
  
  if (isNaN(number)) return null
  
  const multipliers: Record<string, number> = {
    'K': 1000,
    'M': 1000000,
    'B': 1000000000,
    'T': 1000000000000
  }
  
  return number * (multipliers[suffix] || 1)
}

const formatValue = (value: number, showSuffix: boolean = true): string => {
  if (value >= 1000000000000) {
    return showSuffix ? `${(value / 1000000000000).toFixed(1)}T` : `${(value / 1000000000000).toFixed(1)}`
  } else if (value >= 1000000000) {
    return showSuffix ? `${(value / 1000000000).toFixed(1)}B` : `${(value / 1000000000).toFixed(1)}`
  } else if (value >= 1000000) {
    return showSuffix ? `${(value / 1000000).toFixed(1)}M` : `${(value / 1000000).toFixed(1)}`
  } else if (value >= 1000) {
    return showSuffix ? `${(value / 1000).toFixed(1)}K` : `${(value / 1000).toFixed(1)}`
  } else {
    return value.toLocaleString('en-PH')
  }
}

const formatCurrency = (value: number): string => {
  return `₱${formatValue(value)}`
}

export const ValueRangeFilter: React.FC<ValueRangeFilterProps> = ({
  value,
  onChange,
  isDark = false,
  disabled = false,
  className = '',
  minValue = 0,
  maxValue = 10000000000, // 10B default max - more reasonable for government contracts
  showInputs = true,
  minHeight
}) => {
  const vars = getThemeVars(isDark)
  
  // Local state for input values
  const [minInput, setMinInput] = useState('')
  const [maxInput, setMaxInput] = useState('')
  
  // Update input values when value prop changes
  useEffect(() => {
    setMinInput(value.min ? formatValue(value.min, true) : '')
    setMaxInput(value.max ? formatValue(value.max, true) : '')
  }, [value.min, value.max])
  
  // Handle input changes
  const handleMinInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    setMinInput(e.target.value)
  }, [disabled])
  
  const handleMaxInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    setMaxInput(e.target.value)
  }, [disabled])
  
  // Handle input blur/enter - commit the value
  const commitMinValue = useCallback(() => {
    const parsed = parseValue(minInput)
    console.log('🔍 commitMinValue:', { minInput, parsed, value })
    if (parsed !== null && parsed >= 0) {
      const newValue = { ...value, min: parsed }
      console.log('✅ commitMinValue - calling onChange:', newValue)
      onChange(newValue)
    } else {
      console.log('❌ commitMinValue - reverting input')
      setMinInput(value.min ? formatValue(value.min, true) : '')
    }
  }, [minInput, value, onChange])
  
  const commitMaxValue = useCallback(() => {
    const parsed = parseValue(maxInput)
    console.log('🔍 commitMaxValue:', { maxInput, parsed, value })
    if (parsed !== null && parsed >= 0) {
      const newValue = { ...value, max: parsed }
      console.log('✅ commitMaxValue - calling onChange:', newValue)
      onChange(newValue)
    } else {
      console.log('❌ commitMaxValue - reverting input')
      setMaxInput(value.max ? formatValue(value.max, true) : '')
    }
  }, [maxInput, value, onChange])
  
  // Styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: vars.background.secondary,
    borderRadius: spacing[2],
    border: `1px solid ${vars.border.light}`,
    ...(disabled && { opacity: 0.6 }),
    ...(minHeight && { minHeight })
  }
  
  
  const inputStyle = {
    padding: `${spacing[1]} ${spacing[2]}`,
    backgroundColor: vars.background.primary,
    color: vars.text.primary,
    border: `1px solid ${vars.border.medium}`,
    borderRadius: spacing[1],
    fontSize: typography.fontSize.sm,
    width: '80px',
    textAlign: 'center' as const,
    ...(disabled && { cursor: 'not-allowed' })
  }
  
  return (
    <div style={containerStyle} className={className}>
      {/* Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[1]
      }}>
        <span style={{ fontSize: '16px' }}>💰</span>
        <span style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: vars.text.primary
        }}>
          Contract Value Range
        </span>
      </div>
      
      {/* Input Fields and Range Display */}
      {showInputs && (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], justifyContent: 'space-between' }}>
          {/* Input Fields */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
              <label style={{
                fontSize: typography.fontSize.sm,
                color: vars.text.secondary,
                whiteSpace: 'nowrap'
              }}>
                Min:
              </label>
              <input
                type="text"
                value={minInput}
                onChange={handleMinInputChange}
                onBlur={commitMinValue}
                onKeyDown={(e) => e.key === 'Enter' && commitMinValue()}
                disabled={disabled}
                style={inputStyle}
                placeholder="1K, 1M, 1B..."
                title="Enter minimum value (e.g., 1K, 1M, 1B, 1T)"
              />
            </div>
            
            <div style={{ color: vars.text.secondary, fontSize: typography.fontSize.sm }}>
              to
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
              <label style={{
                fontSize: typography.fontSize.sm,
                color: vars.text.secondary,
                whiteSpace: 'nowrap'
              }}>
                Max:
              </label>
              <input
                type="text"
                value={maxInput}
                onChange={handleMaxInputChange}
                onBlur={commitMaxValue}
                onKeyDown={(e) => e.key === 'Enter' && commitMaxValue()}
                disabled={disabled}
                style={inputStyle}
                placeholder="1K, 1M, 1B..."
                title="Enter maximum value (e.g., 1K, 1M, 1B, 1T)"
              />
            </div>
          </div>
          
          {/* Current Range Display */}
          {(value.min || value.max) && (
            <div style={{
              fontSize: typography.fontSize.sm,
              color: vars.text.secondary,
              padding: `${spacing[1]} ${spacing[2]}`,
              backgroundColor: vars.background.primary,
              borderRadius: spacing[1],
              border: `1px solid ${vars.border.light}`,
              whiteSpace: 'nowrap',
              minWidth: '120px',
              textAlign: 'center'
            }}>
              {value.min && value.max ? (
                `${formatCurrency(value.min)} - ${formatCurrency(value.max)}`
              ) : value.min ? (
                `≥ ${formatCurrency(value.min)}`
              ) : (
                `≤ ${formatCurrency(value.max!)}`
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ValueRangeFilter