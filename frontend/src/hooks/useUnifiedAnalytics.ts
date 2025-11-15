import { useCallback, useMemo, useEffect } from 'react'
import { useAnalyticsData } from './useAnalyticsData'
import { usePagination } from './usePagination'
import { useEntityFilters } from './useEntityFilters'
import { useAnalyticsControls } from './useAnalyticsControls'
import { type ChipSearchParams } from '../services/AdvancedSearchService'

export interface UnifiedAnalyticsConfig {
  mode: 'analytics' | 'explorer'
  currentFilters?: {
    contractors: string[]
    areas: string[]
    organizations: string[]
    business_categories: string[]
    keywords: string[]
    time_ranges: any[]
    includeFloodControl?: boolean
    valueRange?: { min?: number; max?: number; }
  }
}

export const useUnifiedAnalytics = (config: UnifiedAnalyticsConfig) => {
  const { mode, currentFilters } = config
  
  // Core hooks
  const { aggregates, loading, error, totalCount, loadData, reset: resetAnalyticsData } = useAnalyticsData()
  const pagination = usePagination(20)
  const entityFilters = useEntityFilters()
  const analyticsControls = useAnalyticsControls()

  // Build search parameters based on mode
  const searchParams = useMemo((): ChipSearchParams => {
    if (mode === 'analytics' && currentFilters) {
      // Build time ranges based on analytics controls
      const timeRanges = []
      if (analyticsControls.yearFilter !== 'all') {
        if (analyticsControls.timeGranularity === 'quarter') {
          // For quarterly, we need to add all quarters of the selected year
          timeRanges.push(
            { type: 'quarterly', year: analyticsControls.yearFilter, quarter: 1 },
            { type: 'quarterly', year: analyticsControls.yearFilter, quarter: 2 },
            { type: 'quarterly', year: analyticsControls.yearFilter, quarter: 3 },
            { type: 'quarterly', year: analyticsControls.yearFilter, quarter: 4 }
          )
        } else {
          // For yearly, just add the year
          timeRanges.push({ type: 'yearly', year: analyticsControls.yearFilter })
        }
      }

      return {
        contractors: currentFilters.contractors || [],
        areas: currentFilters.areas || [],
        organizations: currentFilters.organizations || [],
        businessCategories: currentFilters.business_categories || [],
        keywords: currentFilters.keywords || [],
        timeRanges: timeRanges.length > 0 ? timeRanges : (currentFilters.time_ranges || []),
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        sortBy: analyticsControls.metric === 'amount' ? 'total_value' : 
                analyticsControls.metric === 'count' ? 'count' : 'avg_value',
        sortDirection: 'desc',
        includeFloodControl: currentFilters.includeFloodControl || false,
        dimension: analyticsControls.dimension,
        valueRange: currentFilters.valueRange
      }
    } else {
      // Explorer mode - use analytics controls for time filtering
      const timeRanges = []
      if (analyticsControls.yearFilter !== 'all') {
        // Use the year filter from analytics controls
        timeRanges.push({ type: 'yearly', year: analyticsControls.yearFilter })
      }

      // Map dimension to the appropriate filter based on selected entity
      const contractors = analyticsControls.dimension === 'by_contractor' && entityFilters.selectedEntity ? [entityFilters.selectedEntity] : []
      const areas = analyticsControls.dimension === 'by_area' && entityFilters.selectedEntity ? [entityFilters.selectedEntity] : []
      const organizations = analyticsControls.dimension === 'by_organization' && entityFilters.selectedEntity ? [entityFilters.selectedEntity] : []
      const businessCategories = analyticsControls.dimension === 'by_category' && entityFilters.selectedEntity ? [entityFilters.selectedEntity] : []

      return {
        contractors,
        areas,
        organizations,
        businessCategories,
        keywords: [], // Don't use keywords for entity search
        timeRanges,
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        includeFloodControl: entityFilters.includeFloodControl,
        dimension: analyticsControls.dimension,
        valueRange: { min: 0, max: 1000000000000 } // Default to min 0 and max 1T for Data Explorer
      }
    }
  }, [
    mode, 
    currentFilters, 
    entityFilters.selectedEntity, 
    entityFilters.includeFloodControl,
    pagination.currentPage, 
    pagination.pageSize, 
    analyticsControls.metric,
    analyticsControls.dimension,
    analyticsControls.yearFilter
  ])

  // Auto-load data when search params change
  useEffect(() => {
    console.log('[useUnifiedAnalytics] Loading data with search params:', searchParams)
    loadData(searchParams)
  }, [
    loadData,
    mode,
    currentFilters?.contractors?.join(','),
    currentFilters?.areas?.join(','),
    currentFilters?.organizations?.join(','),
    currentFilters?.business_categories?.join(','),
    currentFilters?.keywords?.join(','),
    currentFilters?.time_ranges?.length,
    currentFilters?.includeFloodControl,
    entityFilters.selectedEntity,
    entityFilters.includeFloodControl,
    pagination.currentPage,
    pagination.pageSize,
    analyticsControls.metric,
    analyticsControls.dimension,
    analyticsControls.yearFilter
  ])

  // Update pagination total count when data loads
  useEffect(() => {
    if (totalCount > 0) {
      pagination.setTotalCount(totalCount)
    }
  }, [totalCount, pagination.setTotalCount])

  // Process data for display
  const processedData = useMemo(() => {
    if (!aggregates) {
      console.log('[useUnifiedAnalytics] No aggregates data')
      return []
    }
    
    const base = aggregates[analyticsControls.dimension] || []
    console.log('[useUnifiedAnalytics] Base data for dimension', analyticsControls.dimension, ':', base)
    
    // Sort the data for both analytics and explorer modes
    const sorted = [...base].sort((a: any, b: any) => {
      if (analyticsControls.metric === 'amount') return (b.total_value || 0) - (a.total_value || 0)
      if (analyticsControls.metric === 'count') return (b.count || 0) - (a.count || 0)
      const aAvg = (a.total_value || 0) / Math.max(1, (a.count || 0))
      const bAvg = (b.total_value || 0) / Math.max(1, (b.count || 0))
      return bAvg - aAvg
    })
    
    console.log('[useUnifiedAnalytics] Processed data:', sorted)
    return sorted
  }, [aggregates, analyticsControls.dimension, analyticsControls.metric, mode])

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!aggregates?.summary?.[0]) {
      return { totalContracts: 0, totalValue: 0, averageValue: 0 }
    }
    
    const summary = aggregates.summary[0]
    return {
      totalContracts: summary.count || 0,
      totalValue: summary.total_value || 0,
      averageValue: summary.avg_value || 0
    }
  }, [aggregates])

  // Reset all state
  const reset = useCallback(() => {
    resetAnalyticsData()
    pagination.reset()
    entityFilters.reset()
    analyticsControls.reset()
  }, [])

  return {
    // Data
    aggregates,
    processedData,
    summaryStats,
    loading,
    error,
    
    // Pagination
    pagination,
    
    // Filters (explorer mode)
    entityFilters,
    
    // Controls (analytics mode)
    analyticsControls,
    
    // Actions
    reset
  }
}
