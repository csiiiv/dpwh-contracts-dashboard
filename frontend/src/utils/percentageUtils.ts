/**
 * Utility functions for calculating accurate percentages with chunked data
 */

export interface GlobalTotals {
  global_total_contracts?: number
  global_total_contract_value?: number
  global_total_categories?: number
  global_total_contractors?: number
}

export interface ChartDataItem {
  total_contract_value: number
  contract_count?: number
  [key: string]: any
}

/**
 * Calculate accurate percentages for chart data using global totals
 */
export function calculateAccuratePercentages(
  data: ChartDataItem[],
  globalTotals: GlobalTotals,
  valueField: 'total_contract_value' | 'contract_count' = 'total_contract_value'
): Array<ChartDataItem & { accurate_percentage: number }> {
  const globalTotal = valueField === 'total_contract_value' 
    ? globalTotals.global_total_contract_value 
    : globalTotals.global_total_contracts

  if (!globalTotal || globalTotal === 0) {
    return data.map(item => ({ ...item, accurate_percentage: 0 }))
  }

  return data.map(item => {
    const value = item[valueField] || 0
    const percentage = (value / globalTotal) * 100
    return {
      ...item,
      accurate_percentage: Math.round(percentage * 100) / 100 // Round to 2 decimal places
    }
  })
}

/**
 * Calculate "Other" category data for remaining values not shown in chunk
 */
export function calculateOtherCategory(
  data: ChartDataItem[],
  globalTotals: GlobalTotals,
  valueField: 'total_contract_value' | 'contract_count' = 'total_contract_value'
): ChartDataItem & { accurate_percentage: number } | null {
  const globalTotal = valueField === 'total_contract_value' 
    ? globalTotals.global_total_contract_value 
    : globalTotals.global_total_contracts

  if (!globalTotal || globalTotal === 0) {
    return null
  }

  const shownTotal = data.reduce((sum, item) => sum + (item[valueField] || 0), 0)
  const otherValue = globalTotal - shownTotal

  if (otherValue <= 0) {
    return null
  }

  const otherPercentage = (otherValue / globalTotal) * 100

  return {
    business_category: 'Other',
    awardee_name: 'Other',
    total_contract_value: valueField === 'total_contract_value' ? otherValue : 0,
    contract_count: valueField === 'contract_count' ? otherValue : 0,
    accurate_percentage: Math.round(otherPercentage * 100) / 100
  }
}

/**
 * Create chart data with accurate percentages and "Other" category
 */
export function createAccurateChartData(
  data: ChartDataItem[],
  globalTotals: GlobalTotals,
  valueField: 'total_contract_value' | 'contract_count' = 'total_contract_value',
  includeOther: boolean = true,
  maxItems: number = 10
): {
  labels: string[]
  data: number[]
  percentages: number[]
  otherData?: {
    value: number
    percentage: number
  }
} {
  // Calculate accurate percentages
  const dataWithPercentages = calculateAccuratePercentages(data, globalTotals, valueField)
  
  // Take only the top N items
  const topData = dataWithPercentages.slice(0, maxItems)
  
  // Calculate "Other" category if requested
  let otherData: { value: number; percentage: number } | undefined
  if (includeOther && data.length > maxItems) {
    const otherCategory = calculateOtherCategory(
      data.slice(0, maxItems), 
      globalTotals, 
      valueField
    )
    
    if (otherCategory) {
      otherData = {
        value: otherCategory[valueField] || 0,
        percentage: otherCategory.accurate_percentage
      }
    }
  }

  return {
    labels: topData.map(item => 
      (item.business_category || item.awardee_name || 'Unknown').length > 20
        ? (item.business_category || item.awardee_name || 'Unknown').substring(0, 20) + '...'
        : (item.business_category || item.awardee_name || 'Unknown')
    ),
    data: topData.map(item => item[valueField] || 0),
    percentages: topData.map(item => item.accurate_percentage || 0),
    otherData
  }
}

/**
 * Format percentage for display
 */
export function formatPercentage(percentage: number | undefined | null): string {
  if (percentage === undefined || percentage === null || isNaN(percentage)) {
    return '0.0%'
  }
  return `${percentage.toFixed(1)}%`
}
