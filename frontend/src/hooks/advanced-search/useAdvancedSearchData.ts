import { useState, useCallback } from 'react'
import { advancedSearchService, type ChipSearchParams, type SearchResult, type ChipAggregatesResponse } from '../../services/AdvancedSearchService'

export interface UseAdvancedSearchDataReturn {
  // Data state
  searchResults: SearchResult[]
  aggregates: ChipAggregatesResponse['data'] | null
  loading: boolean
  error: string | null
  hasSearched: boolean
  analyticsLoading: boolean
  
  // Data actions
  performSearch: (params: ChipSearchParams, onPaginationUpdate?: (pagination: any) => void) => Promise<void>
  refreshData: () => Promise<void>
  clearResults: () => void
  setError: (error: string | null) => void
  
  // Utility functions
  hasResults: boolean
  getResultCount: () => number
  getAggregateCount: () => number
}

export const useAdvancedSearchData = (): UseAdvancedSearchDataReturn => {
  // Search state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [aggregates, setAggregates] = useState<ChipAggregatesResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Main search function
  const performSearch = useCallback(async (params: ChipSearchParams, onPaginationUpdate?: (pagination: any) => void) => {
    try {
      console.log('🔍 useAdvancedSearchData - performSearch called with:', params)
      setLoading(true)
      setError(null)
      setAnalyticsLoading(true)

      // Perform search and aggregates in parallel
      const [response, aggs] = await Promise.all([
        advancedSearchService.searchContractsWithChips(params),
        advancedSearchService.chipAggregates(params)
      ])
      
      console.log('📊 useAdvancedSearchData - search response:', {
        success: true,
        dataCount: response.data?.length || 0,
        aggregatesSuccess: !!aggs.data,
        aggregatesCount: aggs.data ? Object.keys(aggs.data).length : 0
      })

      if (response.data) {
        setSearchResults(response.data || [])
        if (aggs.data) {
          setAggregates(aggs.data)
        } else {
          setAggregates(null)
        }
        setHasSearched(true)
        
        // Update pagination if callback provided
        if (onPaginationUpdate && response.pagination) {
          onPaginationUpdate({
            page: response.pagination.page || 1,
            pageSize: response.pagination.page_size || 20,
            totalCount: response.pagination.total_count || 0,
            totalPages: response.pagination.total_pages || 0
          })
        }
        
        console.log('✅ useAdvancedSearchData - search completed successfully')
      } else {
        // Backend may return `error` or `message` depending on implementation
        const backendMsg = (response as any).error || (response as any).message
        setError(backendMsg || 'Search failed')
        setSearchResults([])
        setAggregates(null)
        console.log('❌ useAdvancedSearchData - search failed:', backendMsg)
      }
    } catch (error) {
      console.error('🚨 useAdvancedSearchData - search error:', error)
      // Surface the underlying error message when possible
      const msg = error instanceof Error ? error.message : String(error)
      setError(msg || 'Search failed. Please try again.')
      setSearchResults([])
      setAggregates(null)
    } finally {
      setLoading(false)
      setAnalyticsLoading(false)
    }
  }, [])

  // Refresh data function
  const refreshData = useCallback(async () => {
    console.log('🔄 useAdvancedSearchData - refreshData called')
    if (hasSearched) {
      // Re-run the last search with current parameters
      // This would need to be passed from the parent component
      console.log('⚠️ useAdvancedSearchData - refreshData called but no previous search parameters available')
    }
  }, [hasSearched])

  // Clear results function
  const clearResults = useCallback(() => {
    console.log('🧹 useAdvancedSearchData - clearResults called')
    setSearchResults([])
    setAggregates(null)
    setError(null)
    setHasSearched(false)
    setLoading(false)
    setAnalyticsLoading(false)
  }, [])

  // Set error function
  const setErrorState = useCallback((error: string | null) => {
    console.log('🚨 useAdvancedSearchData - setError called:', error)
    setError(error)
  }, [])

  // Utility functions
  const hasResults = searchResults.length > 0

  const getResultCount = useCallback(() => {
    return searchResults.length
  }, [searchResults])

  const getAggregateCount = useCallback(() => {
    if (!aggregates) return 0
    return Object.values(aggregates).reduce((total, category) => {
      return total + (Array.isArray(category) ? category.length : 0)
    }, 0)
  }, [aggregates])

  return {
    // Data state
    searchResults,
    aggregates,
    loading,
    error,
    hasSearched,
    analyticsLoading,
    
    // Data actions
    performSearch,
    refreshData,
    clearResults,
    setError: setErrorState,
    
    // Utility functions
    hasResults,
    getResultCount,
    getAggregateCount
  }
}
