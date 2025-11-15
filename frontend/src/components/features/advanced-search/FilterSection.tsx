import React, { useState } from 'react'
import { getThemeVars } from '../../../design-system/theme'
import { typography, spacing } from '../../../design-system'
import { SearchableSelect } from './SearchableSelect'
import { FilterChip } from './FilterChip'

export interface FilterSectionProps {
  title: string
  icon: string
  type: 'contractor' | 'area' | 'organization' | 'category' | 'keyword' | 'timerange'
  options: string[]
  selectedValues: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  onClear?: () => void
  isDark?: boolean
  disabled?: boolean
  supportAndLogic?: boolean
  loading?: boolean
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon,
  type,
  options,
  selectedValues = [],
  onAdd,
  onRemove,
  onClear,
  isDark = false,
  disabled = false,
  supportAndLogic = false,
  loading = false
}) => {
  const vars = getThemeVars(isDark)
  const [exactWord, setExactWord] = useState(false)

  const containerStyle = {
    marginBottom: spacing[4]
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: spacing[2],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: vars.text.primary
  }

  const chipsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: spacing[2],
    marginBottom: spacing[2],
    minHeight: '32px'
  }

  const selectContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2]
  }

  const addButtonStyle = {
    padding: `${spacing[1]} ${spacing[3]}`,
    backgroundColor: vars.primary[500],
    color: vars.white,
    border: 'none',
    borderRadius: spacing[2],
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    whiteSpace: 'nowrap' as const
  }

  const addButtonHoverStyle = {
    backgroundColor: vars.primary[600]
  }

  const handleAdd = (value: string) => {
    if (value && !selectedValues.includes(value)) {
      onAdd(value)
    }
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={{ marginRight: spacing[2] }}>{icon}</span>
        {title}
        {loading && (
          <span style={{ 
            marginLeft: spacing[2], 
            color: vars.text.secondary,
            fontSize: typography.fontSize.xs
          }}>
            (Loading...)
          </span>
        )}
        {!loading && (
          <span style={{ 
            marginLeft: spacing[2], 
            color: vars.text.secondary,
            fontSize: typography.fontSize.xs
          }}>
            ({selectedValues.length} selected)
          </span>
        )}
      </div>

      {selectedValues.length > 0 && (
        <div style={{ ...chipsContainerStyle, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2], flex: 1 }}>
            {selectedValues.map((value, index) => (
              <FilterChip
                key={`${type}-${index}`}
                label={value}
                value={value}
                type={type}
                onRemove={() => onRemove(index)}
                isDark={isDark}
              />
            ))}
          </div>
          {typeof onClear === 'function' && (
            <button
              style={{
                marginLeft: spacing[2],
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: 'transparent',
                color: vars.text.secondary,
                border: `1px solid ${vars.border.medium}`,
                borderRadius: spacing[1],
                cursor: 'pointer',
                fontSize: typography.fontSize.xs,
                opacity: 0.8,
                height: 28,
                alignSelf: 'flex-start',
              }}
              onClick={onClear}
              type="button"
              aria-label={`Clear all ${title}`}
            >
              Clear
            </button>
          )}
        </div>
      )}

      <div style={selectContainerStyle}>
        <div style={{ flex: 1 }}>
          <SearchableSelect
            value=""
            onChange={handleAdd}
            options={options}
            placeholder={loading ? `Loading ${title.toLowerCase()}...` : `Select ${title.toLowerCase()}...`}
            icon={icon}
            isDark={isDark}
            disabled={disabled || loading}
            typeKey={type === 'contractor' || type === 'area' || type === 'organization' || type === 'category' ? type : undefined}
            exactWord={exactWord}
            supportAndLogic={supportAndLogic}
            selectedValues={selectedValues}
          />
        </div>
        {(type === 'contractor' || type === 'area' || type === 'organization' || type === 'category') && (
          <label style={{ display: 'flex', alignItems: 'center', gap: spacing[1], fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
            <input type="checkbox" checked={exactWord} onChange={(e) => setExactWord(e.target.checked)} />
            Exact word
          </label>
        )}
      </div>
    </div>
  )
}

export { FilterSection }
