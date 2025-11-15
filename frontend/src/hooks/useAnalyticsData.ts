import { useState, useCallback } from 'react'
import { advancedSearchService, type ChipSearchParams } from '../services/AdvancedSearchService'
import { errorHandler } from '../utils/errorHandling'

// Helper function to process raw contract data into aggregates format
const processContractDataToAggregates = (contracts: any[]) => {
  const byContractor: any = {}
  const byOrganization: any = {}
  const byArea: any = {}
  const byCategory: any = {}
  const byYear: any = {}
  const byMonth: any = {}

  contracts.forEach((contract, index) => {
    const contractor = contract.awardee_name || 'Unknown'
    const organization = contract.organization_name || 'Unknown'
    const area = contract.area_of_delivery || 'Unknown'
    const category = contract.business_category || 'Unknown'
    const amount = Number(contract.contract_amount) || 0
    const year = new Date(contract.award_date || Date.now()).getFullYear()
    const month = new Date(contract.award_date || Date.now()).toISOString().substring(0, 7)

    // Debug: Log first few contracts to check amounts
    if (index < 5) {
      console.log(`[processContractDataToAggregates] Contract ${index}:`, {
        contractor,
        organization,
        amount,
        raw_amount: contract.contract_amount,
        award_date: contract.award_date
      })
    }

    // Process by contractor
    if (!byContractor[contractor]) {
      byContractor[contractor] = { total_value: 0, count: 0 }
    }
    byContractor[contractor].total_value += amount
    byContractor[contractor].count += 1

    // Process by organization
    if (!byOrganization[organization]) {
      byOrganization[organization] = { total_value: 0, count: 0 }
    }
    byOrganization[organization].total_value += amount
    byOrganization[organization].count += 1

    // Process by area
    if (!byArea[area]) {
      byArea[area] = { total_value: 0, count: 0 }
    }
    byArea[area].total_value += amount
    byArea[area].count += 1

    // Process by category
    if (!byCategory[category]) {
      byCategory[category] = { total_value: 0, count: 0 }
    }
    byCategory[category].total_value += amount
    byCategory[category].count += 1

    // Process by year
    if (!byYear[year]) {
      byYear[year] = { total_value: 0, count: 0 }
    }
    byYear[year].total_value += amount
    byYear[year].count += 1

    // Process by month
    if (!byMonth[month]) {
      byMonth[month] = { total_value: 0, count: 0 }
    }
    byMonth[month].total_value += amount
    byMonth[month].count += 1
  })

  // Convert to arrays with labels
  const convertToArray = (data: any, labelKey: string) => 
    Object.entries(data).map(([key, value]: [string, any]) => ({
      label: key,
      total_value: value.total_value,
      count: value.count
    }))

  // Calculate summary stats
  const totalValue = contracts.reduce((sum, contract) => sum + (Number(contract.contract_amount) || 0), 0)
  const totalCount = contracts.length
  const averageValue = totalCount > 0 ? totalValue / totalCount : 0

  const result = {
    summary: [{ count: totalCount, total_value: totalValue, avg_value: averageValue }],
    by_contractor: convertToArray(byContractor, 'contractor'),
    by_organization: convertToArray(byOrganization, 'organization'),
    by_area: convertToArray(byArea, 'area'),
    by_category: convertToArray(byCategory, 'category'),
    by_year: convertToArray(byYear, 'year').map(item => ({ ...item, year: parseInt(item.label) })),
    by_month: convertToArray(byMonth, 'month').map(item => ({ ...item, month: item.label }))
  }

  // Debug: Log top contractors to check for inflated values
  console.log('[processContractDataToAggregates] Top 5 contractors by value:', 
    result.by_contractor
      .sort((a, b) => (b.total_value || 0) - (a.total_value || 0))
      .slice(0, 5)
  )

  return result
}

interface AppError {
  message: string
  code?: string
  details?: any
}

export interface AnalyticsDataState {
  aggregates: any | null
  loading: boolean
  error: AppError | null
  totalCount: number
}

export interface AnalyticsDataActions {
  loadData: (params: ChipSearchParams) => Promise<void>
  reset: () => void
}

export const useAnalyticsData = (): AnalyticsDataState & AnalyticsDataActions => {
  const [aggregates, setAggregates] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const loadData = useCallback(async (params: ChipSearchParams) => {
    setLoading(true)
    setError(null)
    
    try {
      // For analytics mode with pagination, use chipAggregatesPaginated
      // For explorer mode, also use chipAggregatesPaginated since we need dimension support
      const isAnalyticsMode = params.page && params.pageSize
      const isExplorerMode = params.dimension && !isAnalyticsMode
      
      if (isAnalyticsMode) {
        console.log('[useAnalyticsData] Analytics mode - calling chipAggregatesPaginated with params:', params)
        const response = await advancedSearchService.chipAggregatesPaginated({
          ...params,
          dimension: params.dimension || 'by_contractor'
        })
        console.log('[useAnalyticsData] chipAggregatesPaginated response:', response)
        
        if (!response.data) {
          throw new Error('Failed to load analytics data')
        }
        
        // For analytics mode, we also need time-based data for charts
        // Make an additional call to get time-based aggregates
        console.log('[useAnalyticsData] Fetching time-based data for charts...')
        const timeResponse = await advancedSearchService.chipAggregates({
          ...params,
          page: undefined,
          pageSize: undefined,
          dimension: undefined
        })
        
        if (!timeResponse.data) {
          console.warn('[useAnalyticsData] Failed to load time-based data: No data in response')
        } else {
          console.log('[useAnalyticsData] Successfully loaded time-based data with summary:', timeResponse.data.summary)
        }
        
        // Convert paginated response to aggregates format
        const summaryData = timeResponse.data ? timeResponse.data.summary : [{ 
          count: response.pagination.total_count, 
          total_value: response.data.reduce((sum, item) => sum + (item.total_value || 0), 0),
          avg_value: response.data.length > 0 ? response.data.reduce((sum, item) => sum + (item.total_value || 0), 0) / response.data.length : 0
        }]
        
        console.log('[useAnalyticsData] Using summary data:', summaryData)
        
        const aggregates = {
          [params.dimension || 'by_contractor']: response.data,
          summary: summaryData,
          by_month: timeResponse.data ? timeResponse.data.by_month : [],
          by_year: timeResponse.data ? timeResponse.data.by_year : []
        }
        
        setAggregates(aggregates)
        setTotalCount(response.pagination.total_count)
      } else if (isExplorerMode) {
        console.log('[useAnalyticsData] Explorer mode - calling chipAggregatesPaginated and chipAggregates with params:', params)
        
        // Get paginated data for the table
        const response = await advancedSearchService.chipAggregatesPaginated({
          ...params,
          dimension: params.dimension || 'by_contractor',
          page: 1,
          pageSize: 1000 // Get more results for explorer mode
        })
        console.log('[useAnalyticsData] chipAggregatesPaginated response:', response)
        
        if (!response.data) {
          throw new Error('Failed to load analytics data')
        }
        
        // Get summary data from chipAggregates for correct totals
        const summaryResponse = await advancedSearchService.chipAggregates({
          ...params,
          page: undefined,
          pageSize: undefined,
          dimension: undefined
        })
        console.log('[useAnalyticsData] chipAggregates summary response:', summaryResponse)
        
        if (!summaryResponse.data) {
          console.warn('[useAnalyticsData] Failed to load summary data: No data in response')
        }
        
        // Convert paginated response to aggregates format for explorer mode
        const aggregates = {
          [params.dimension || 'by_contractor']: response.data,
          summary: summaryResponse.data ? summaryResponse.data.summary : [{ 
            count: response.pagination.total_count, 
            total_value: response.data.reduce((sum, item) => sum + (item.total_value || 0), 0),
            avg_value: response.data.length > 0 ? response.data.reduce((sum, item) => sum + (item.total_value || 0), 0) / response.data.length : 0
          }]
        }
        
        setAggregates(aggregates)
        setTotalCount(response.pagination.total_count)
      } else {
        console.log('[useAnalyticsData] Basic mode - calling chipAggregates with params:', params)
        const response = await advancedSearchService.chipAggregates(params)
        console.log('[useAnalyticsData] chipAggregates response:', response)
        
        if (!response.data) {
          throw new Error('Failed to load analytics data')
        }
        
        setAggregates(response.data)
        setTotalCount(response.data?.by_contractor?.length || 0)
      }
    } catch (err) {
      const appError: AppError = {
        message: err instanceof Error ? err.message : 'Failed to load analytics data',
        code: 'ANALYTICS_LOAD_ERROR'
      }
      setError(appError)
      console.error('[useAnalyticsData] Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setAggregates(null)
    setError(null)
    setTotalCount(0)
  }, [])

  return {
    aggregates,
    loading,
    error,
    totalCount,
    loadData,
    reset
  }
}
