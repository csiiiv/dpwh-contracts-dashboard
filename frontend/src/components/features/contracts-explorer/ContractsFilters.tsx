import React, { useState } from 'react'
import { getThemeVars } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import { ContractFilters } from '../../../types/contracts'
import { Card, SectionTitle } from '../../styled/Common.styled'
import { FilterChip } from '../shared/FilterChip'

// SearchableSelect component extracted to prevent re-creation on each render
interface SearchableSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  onSelect: (value: string) => void
  placeholder: string
  filterType: keyof ContractFilters
  filters: ContractFilters
  vars: ReturnType<typeof getThemeVars>
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  onSelect, 
  placeholder, 
  filterType,
  filters,
  vars
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(value.toLowerCase()) &&
    !(filters[filterType] as (string | number)[]).includes(opt)
  )

  const hasExactMatch = filtered.some(opt => opt.toLowerCase() === value.toLowerCase())
  const showAddOption = value.trim() && !hasExactMatch

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (value.trim()) {
              onSelect(value.trim())
              setIsOpen(false)
            } else if (filtered.length > 0) {
              onSelect(filtered[0])
              setIsOpen(false)
            }
          } else if (e.key === 'Escape') {
            setIsOpen(false)
          }
        }}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: spacing[2],
          border: `1px solid ${vars.border.medium}`,
          borderRadius: spacing[1],
          backgroundColor: vars.background.primary,
          color: vars.text.primary,
          fontSize: typography.fontSize.sm
        }}
      />
      {isOpen && (showAddOption || filtered.length > 0) && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: spacing[1],
          maxHeight: '200px',
          overflowY: 'auto',
          backgroundColor: vars.background.primary,
          border: `1px solid ${vars.border.medium}`,
          borderRadius: spacing[1],
          boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`,
          zIndex: 1000
        }}>
          {showAddOption && (
            <div
              onClick={() => {
                onSelect(value.trim())
                setIsOpen(false)
              }}
              style={{
                padding: spacing[2],
                cursor: 'pointer',
                borderBottom: `1px solid ${vars.border.light}`,
                color: vars.primary[700],
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = vars.background.secondary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Add as new filter: "{value.trim()}"
            </div>
          )}
          {filtered.slice(0, 10).map((opt, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelect(opt)
                setIsOpen(false)
              }}
              style={{
                padding: spacing[2],
                cursor: 'pointer',
                borderBottom: idx < filtered.length - 1 ? `1px solid ${vars.border.light}` : 'none',
                color: vars.text.primary,
                fontSize: typography.fontSize.sm
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = vars.background.secondary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface ContractsFiltersProps {
  filters: ContractFilters
  filterOptions: {
    regions: string[]
    implementing_offices: string[]
    contractors: string[]
    statuses: string[]
    years: number[]
    source_of_funds: string[]
  }
  onAddFilter: (type: keyof ContractFilters, value: string | number) => void
  onRemoveFilter: (type: keyof ContractFilters, index: number) => void
  onClearFilters: () => void
  onDateRangeChange?: (dateRange: ContractFilters['dateRange']) => void
  onValueRangeChange?: (valueRange: ContractFilters['valueRange']) => void
  isDark?: boolean
}

export const ContractsFilters: React.FC<ContractsFiltersProps> = ({
  filters,
  filterOptions,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  onDateRangeChange,
  onValueRangeChange,
  isDark = false
}) => {
  const vars = getThemeVars(isDark)
  const [searchInputs, setSearchInputs] = useState({
    region: '',
    office: '',
    contractor: '',
    source_of_funds: '',
    keyword: ''
  })

  const [showDropdowns, setShowDropdowns] = useState<Record<string, boolean>>({})

  const handleKeywordAdd = (keyword: string) => {
    if (keyword.trim() && !filters.keywords.includes(keyword.trim())) {
      onAddFilter('keywords', keyword.trim())
      setSearchInputs(prev => ({ ...prev, keyword: '' }))
    }
  }

  const toggleDropdown = (key: string) => {
    setShowDropdowns(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const hasActiveFilters = 
    filters.regions.length > 0 ||
    filters.implementing_offices.length > 0 ||
    filters.contractors.length > 0 ||
    filters.statuses.length > 0 ||
    filters.years.length > 0 ||
    filters.keywords.length > 0 ||
    (filters.dateRange && filters.dateRange.type !== 'all_time') ||
    (filters.valueRange && (filters.valueRange.min !== undefined || filters.valueRange.max !== undefined))

  return (
    <Card $isDark={isDark} style={{ marginBottom: spacing[4] }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[4]
      }}>
        <SectionTitle $isDark={isDark}>🔍 Filters</SectionTitle>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              padding: `${spacing[2]} ${spacing[3]}`,
              backgroundColor: 'transparent',
              color: vars.text.secondary,
              border: `1px solid ${vars.border.medium}`,
              borderRadius: spacing[1],
              cursor: 'pointer',
              fontSize: typography.fontSize.sm
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filter Chips - Grouped by Category */}
      {hasActiveFilters && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[3],
          marginBottom: spacing[4],
          padding: spacing[3],
          backgroundColor: vars.background.secondary,
          borderRadius: spacing[2]
        }}>
          {/* Regions */}
          {filters.regions.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
                <span style={{ fontSize: typography.fontSize.xs, fontWeight: 600, color: vars.text.secondary }}>📍 REGIONS</span>
                <button
                  onClick={() => filters.regions.forEach((_, idx) => onRemoveFilter('regions', 0))}
                  style={{
                    background: 'none',
                    border: `1px solid #10b98180`,
                    borderRadius: spacing[1],
                    padding: `2px ${spacing[2]}`,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.xs,
                    color: '#10b981',
                    fontWeight: 600
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                {filters.regions.map((region, idx) => (
                  <FilterChip
                    key={`region-${idx}`}
                    label={region}
                    onRemove={() => onRemoveFilter('regions', idx)}
                    isDark={isDark}
                    color="#10b981"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Implementing Offices */}
          {filters.implementing_offices.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
                <span style={{ fontSize: typography.fontSize.xs, fontWeight: 600, color: vars.text.secondary }}>🏛️ OFFICES</span>
                <button
                  onClick={() => filters.implementing_offices.forEach((_, idx) => onRemoveFilter('implementing_offices', 0))}
                  style={{
                    background: 'none',
                    border: `1px solid #8b5cf680`,
                    borderRadius: spacing[1],
                    padding: `2px ${spacing[2]}`,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.xs,
                    color: '#8b5cf6',
                    fontWeight: 600
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                {filters.implementing_offices.map((office, idx) => (
                  <FilterChip
                    key={`office-${idx}`}
                    label={office}
                    onRemove={() => onRemoveFilter('implementing_offices', idx)}
                    isDark={isDark}
                    color="#8b5cf6"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Contractors */}
          {filters.contractors.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
                <span style={{ fontSize: typography.fontSize.xs, fontWeight: 600, color: vars.text.secondary }}>🏢 CONTRACTORS</span>
                <button
                  onClick={() => filters.contractors.forEach((_, idx) => onRemoveFilter('contractors', 0))}
                  style={{
                    background: 'none',
                    border: `1px solid #f59e0b80`,
                    borderRadius: spacing[1],
                    padding: `2px ${spacing[2]}`,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.xs,
                    color: '#f59e0b',
                    fontWeight: 600
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                {filters.contractors.map((contractor, idx) => (
                  <FilterChip
                    key={`contractor-${idx}`}
                    label={contractor}
                    onRemove={() => onRemoveFilter('contractors', idx)}
                    isDark={isDark}
                    color="#f59e0b"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Statuses */}
          {filters.statuses.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
                <span style={{ fontSize: typography.fontSize.xs, fontWeight: 600, color: vars.text.secondary }}>📊 STATUS</span>
                <button
                  onClick={() => filters.statuses.forEach((_, idx) => onRemoveFilter('statuses', 0))}
                  style={{
                    background: 'none',
                    border: `1px solid #3b82f680`,
                    borderRadius: spacing[1],
                    padding: `2px ${spacing[2]}`,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.xs,
                    color: '#3b82f6',
                    fontWeight: 600
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                {filters.statuses.map((status, idx) => (
                  <FilterChip
                    key={`status-${idx}`}
                    label={status}
                    onRemove={() => onRemoveFilter('statuses', idx)}
                    isDark={isDark}
                    color="#3b82f6"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Years */}
          {filters.years.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
                <span style={{ fontSize: typography.fontSize.xs, fontWeight: 600, color: vars.text.secondary }}>📅 YEARS</span>
                <button
                  onClick={() => filters.years.forEach((_, idx) => onRemoveFilter('years', 0))}
                  style={{
                    background: 'none',
                    border: `1px solid #ec489980`,
                    borderRadius: spacing[1],
                    padding: `2px ${spacing[2]}`,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.xs,
                    color: '#ec4899',
                    fontWeight: 600
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                {filters.years.map((year, idx) => (
                  <FilterChip
                    key={`year-${idx}`}
                    label={`${year}`}
                    onRemove={() => onRemoveFilter('years', idx)}
                    isDark={isDark}
                    color="#ec4899"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Source of Funds */}
          {filters.source_of_funds.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
                <span style={{ fontSize: typography.fontSize.xs, fontWeight: 600, color: vars.text.secondary }}>💰 SOURCE OF FUNDS</span>
                <button
                  onClick={() => filters.source_of_funds.forEach((_, idx) => onRemoveFilter('source_of_funds', 0))}
                  style={{
                    background: 'none',
                    border: `1px solid #06b6d480`,
                    borderRadius: spacing[1],
                    padding: `2px ${spacing[2]}`,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.xs,
                    color: '#06b6d4',
                    fontWeight: 600
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                {filters.source_of_funds.map((source, idx) => (
                  <FilterChip
                    key={`source-${idx}`}
                    label={source}
                    onRemove={() => onRemoveFilter('source_of_funds', idx)}
                    isDark={isDark}
                    color="#06b6d4"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {filters.keywords.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
                <span style={{ fontSize: typography.fontSize.xs, fontWeight: 600, color: vars.text.secondary }}>🔎 KEYWORDS</span>
                <button
                  onClick={() => filters.keywords.forEach((_, idx) => onRemoveFilter('keywords', 0))}
                  style={{
                    background: 'none',
                    border: `1px solid #84cc1680`,
                    borderRadius: spacing[1],
                    padding: `2px ${spacing[2]}`,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.xs,
                    color: '#84cc16',
                    fontWeight: 600
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                {filters.keywords.map((keyword, idx) => (
                  <FilterChip
                    key={`keyword-${idx}`}
                    label={keyword}
                    onRemove={() => onRemoveFilter('keywords', idx)}
                    isDark={isDark}
                    color="#84cc16"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Groups */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: spacing[4]
      }}>
        {/* Region Filter */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: spacing[2],
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: vars.text.primary
          }}>
            📍 Region ({filters.regions.length} selected)
          </label>
          <SearchableSelect
            options={filterOptions.regions}
            value={searchInputs.region}
            onChange={(val) => setSearchInputs(prev => ({ ...prev, region: val }))}
            onSelect={(val) => {
              onAddFilter('regions', val)
              setSearchInputs(prev => ({ ...prev, region: '' }))
            }}
            placeholder={`Search ${filterOptions.regions.length} regions...`}
            filterType="regions"
            filters={filters}
            vars={vars}
          />
        </div>

        {/* Implementing Office Filter */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: spacing[2],
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: vars.text.primary
          }}>
            🏛️ Implementing Office ({filters.implementing_offices.length} selected)
          </label>
          <SearchableSelect
            options={filterOptions.implementing_offices}
            value={searchInputs.office}
            onChange={(val) => setSearchInputs(prev => ({ ...prev, office: val }))}
            onSelect={(val) => {
              onAddFilter('implementing_offices', val)
              setSearchInputs(prev => ({ ...prev, office: '' }))
            }}
            placeholder={`Search ${filterOptions.implementing_offices.length} offices...`}
            filterType="implementing_offices"
            filters={filters}
            vars={vars}
          />
        </div>

        {/* Contractor Filter */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: spacing[2],
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: vars.text.primary
          }}>
            🏢 Contractor ({filters.contractors.length} selected)
          </label>
          <SearchableSelect
            options={filterOptions.contractors}
            value={searchInputs.contractor}
            onChange={(val) => setSearchInputs(prev => ({ ...prev, contractor: val }))}
            onSelect={(val) => {
              onAddFilter('contractors', val)
              setSearchInputs(prev => ({ ...prev, contractor: '' }))
            }}
            placeholder={`Search ${filterOptions.contractors.length} contractors...`}
            filterType="contractors"
            filters={filters}
            vars={vars}
          />
        </div>

        {/* Source of Funds Filter */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: spacing[2],
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: vars.text.primary
          }}>
            💰 Source of Funds ({filters.source_of_funds.length} selected)
          </label>
          <SearchableSelect
            options={filterOptions.source_of_funds}
            value={searchInputs.source_of_funds}
            onChange={(val) => setSearchInputs(prev => ({ ...prev, source_of_funds: val }))}
            onSelect={(val) => {
              onAddFilter('source_of_funds', val)
              setSearchInputs(prev => ({ ...prev, source_of_funds: '' }))
            }}
            placeholder={`Search ${filterOptions.source_of_funds.length} sources...`}
            filterType="source_of_funds"
            filters={filters}
            vars={vars}
          />
        </div>

        {/* Status Filter */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: spacing[2],
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: vars.text.primary
          }}>
            📊 Status ({filters.statuses.length} selected)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
            {filterOptions.statuses.map(status => (
              <button
                key={status}
                onClick={() => {
                  if (filters.statuses.includes(status)) {
                    const index = filters.statuses.indexOf(status)
                    onRemoveFilter('statuses', index)
                  } else {
                    onAddFilter('statuses', status)
                  }
                }}
                style={{
                  padding: `${spacing[1]} ${spacing[2]}`,
                  border: `1px solid ${filters.statuses.includes(status) ? vars.primary[500] : vars.border.medium}`,
                  borderRadius: spacing[1],
                  backgroundColor: filters.statuses.includes(status) ? vars.primary[500] : 'transparent',
                  color: filters.statuses.includes(status) ? '#ffffff' : vars.text.primary,
                  cursor: 'pointer',
                  fontSize: typography.fontSize.xs,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Year Filter */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: spacing[2],
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: vars.text.primary
          }}>
            📅 Year ({filters.years.length} selected)
          </label>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: spacing[2], 
            maxHeight: '120px', 
            overflowY: 'auto',
            padding: spacing[1]
          }}>
            {filterOptions.years.map(year => (
              <button
                key={year}
                onClick={() => {
                  if (filters.years.includes(year)) {
                    const index = filters.years.indexOf(year)
                    onRemoveFilter('years', index)
                  } else {
                    onAddFilter('years', year)
                  }
                }}
                style={{
                  padding: `${spacing[1]} ${spacing[2]}`,
                  border: `1px solid ${filters.years.includes(year) ? vars.primary[500] : vars.border.medium}`,
                  borderRadius: spacing[1],
                  backgroundColor: filters.years.includes(year) ? vars.primary[500] : 'transparent',
                  color: filters.years.includes(year) ? '#ffffff' : vars.text.primary,
                  cursor: 'pointer',
                  fontSize: typography.fontSize.xs,
                  transition: 'all 0.2s'
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Keywords - Full Width */}
      <div style={{ marginTop: spacing[4] }}>
        <label style={{
          display: 'block',
          marginBottom: spacing[2],
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          color: vars.text.primary
        }}>
          🔎 Keywords ({filters.keywords.length} keywords)
        </label>
        <div style={{ display: 'flex', gap: spacing[2] }}>
          <input
            type="text"
            value={searchInputs.keyword}
            onChange={(e) => setSearchInputs(prev => ({ ...prev, keyword: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleKeywordAdd(searchInputs.keyword)
              }
            }}
            placeholder="Enter keyword and press Enter to search in description and contract ID..."
            style={{
              flex: 1,
              padding: spacing[2],
              border: `1px solid ${vars.border.medium}`,
              borderRadius: spacing[1],
              backgroundColor: vars.background.primary,
              color: vars.text.primary,
              fontSize: typography.fontSize.sm
            }}
          />
          <button
            onClick={() => handleKeywordAdd(searchInputs.keyword)}
            disabled={!searchInputs.keyword.trim()}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: searchInputs.keyword.trim() ? vars.primary[500] : vars.background.secondary,
              color: searchInputs.keyword.trim() ? '#ffffff' : vars.text.secondary,
              border: 'none',
              borderRadius: spacing[1],
              cursor: searchInputs.keyword.trim() ? 'pointer' : 'not-allowed',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              whiteSpace: 'nowrap'
            }}
          >
            Add Keyword
          </button>
        </div>
      </div>
    </Card>
  )
}
