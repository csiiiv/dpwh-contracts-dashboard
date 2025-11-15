import React from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeVars } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import { 
  FiltersContainer,
  FilterGroup,
  FilterLabel,
  FilterSelect
} from '../../styled/Common.styled'
import { DimensionType, MetricType, TimeGranularityType } from '../../../hooks/useAnalyticsControls'

interface AnalyticsControlsProps {
  dimension: DimensionType
  metric: MetricType
  yearFilter: number | 'all'
  onDimensionChange: (dimension: DimensionType) => void
  onMetricChange: (metric: MetricType) => void
  onYearFilterChange: (year: number | 'all') => void
  isDark?: boolean
}

export const AnalyticsControls: React.FC<AnalyticsControlsProps> = ({
  dimension,
  metric,
  yearFilter,
  onDimensionChange,
  onMetricChange,
  onYearFilterChange,
  isDark = false
}) => {
  const { isDark: themeIsDark } = useTheme()
  const darkMode = isDark !== undefined ? isDark : themeIsDark
  const vars = getThemeVars(darkMode)

  const currentYear = new Date().getFullYear()
  // Generate years from 2013 to 2027 (15 years total)
  const years = Array.from({ length: 15 }, (_, i) => 2013 + i)

  return (
    <FiltersContainer $isDark={darkMode}>
      <FilterGroup>
        <FilterLabel $isDark={darkMode}>Dimension</FilterLabel>
        <FilterSelect
          value={dimension}
          onChange={(e) => onDimensionChange(e.target.value as DimensionType)}
          $isDark={darkMode}
        >
          <option value="by_contractor">By Contractor</option>
          <option value="by_organization">By Organization</option>
          <option value="by_area">By Area</option>
          <option value="by_category">By Category</option>
        </FilterSelect>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel $isDark={darkMode}>Sorting Metric</FilterLabel>
        <FilterSelect
          value={metric}
          onChange={(e) => onMetricChange(e.target.value as MetricType)}
          $isDark={darkMode}
        >
          <option value="amount">Contract Amount</option>
          <option value="count">Contract Count</option>
          <option value="avg">Average Contract Price</option>
        </FilterSelect>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel $isDark={darkMode}>Year</FilterLabel>
        <FilterSelect
          value={yearFilter}
          onChange={(e) => onYearFilterChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          $isDark={darkMode}
        >
          <option value="all">All Years</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </FilterSelect>
      </FilterGroup>

    </FiltersContainer>
  )
}
