import { useState, useCallback } from 'react'

export interface PaginationState {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export interface UseAdvancedSearchPaginationReturn {
  // Pagination state
  pagination: PaginationState
  sortConfig: SortConfig
  
  // Pagination actions
  setPagination: (pagination: PaginationState) => void
  handlePageChange: (page: number) => void
  handlePageSizeChange: (pageSize: number) => void
  resetPagination: () => void
  
  // Sorting actions
  setSortConfig: (sortConfig: SortConfig) => void
  handleSort: (key: string) => void
  toggleSortDirection: (key: string) => void
  
  // Utility functions
  canGoToPreviousPage: boolean
  canGoToNextPage: boolean
  getPageRange: () => { start: number; end: number }
  getTotalPages: () => number
  isFirstPage: boolean
  isLastPage: boolean
}

export const useAdvancedSearchPagination = (): UseAdvancedSearchPaginationReturn => {
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  })

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'contract_amount',
    direction: 'desc'
  })

  // Pagination actions
  const handlePageChange = useCallback((page: number) => {
    console.log('📄 useAdvancedSearchPagination - handlePageChange called:', page)
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const handlePageSizeChange = useCallback((pageSize: number) => {
    console.log('📄 useAdvancedSearchPagination - handlePageSizeChange called:', pageSize)
    setPagination(prev => ({ 
      ...prev, 
      pageSize, 
      page: 1 // Reset to first page when changing page size
    }))
  }, [])

  const resetPagination = useCallback(() => {
    console.log('🔄 useAdvancedSearchPagination - resetPagination called')
    setPagination({
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0
    })
  }, [])

  // Sorting actions
  const handleSort = useCallback((key: string) => {
    console.log('🔄 useAdvancedSearchPagination - handleSort called:', key)
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({ key, direction })
  }, [sortConfig])

  const toggleSortDirection = useCallback((key: string) => {
    console.log('🔄 useAdvancedSearchPagination - toggleSortDirection called:', key)
    if (sortConfig.key === key) {
      setSortConfig(prev => ({
        ...prev,
        direction: prev.direction === 'asc' ? 'desc' : 'asc'
      }))
    } else {
      setSortConfig({ key, direction: 'asc' })
    }
  }, [sortConfig])

  // Utility functions
  const canGoToPreviousPage = pagination.page > 1
  const canGoToNextPage = pagination.page < pagination.totalPages

  const getPageRange = useCallback(() => {
    const start = (pagination.page - 1) * pagination.pageSize + 1
    const end = Math.min(pagination.page * pagination.pageSize, pagination.totalCount)
    return { start, end }
  }, [pagination])

  const getTotalPages = useCallback(() => {
    return Math.ceil(pagination.totalCount / pagination.pageSize)
  }, [pagination])

  const isFirstPage = pagination.page === 1
  const isLastPage = pagination.page === pagination.totalPages

  return {
    // Pagination state
    pagination,
    sortConfig,
    
    // Pagination actions
    setPagination,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
    
    // Sorting actions
    setSortConfig,
    handleSort,
    toggleSortDirection,
    
    // Utility functions
    canGoToPreviousPage,
    canGoToNextPage,
    getPageRange,
    getTotalPages,
    isFirstPage,
    isLastPage
  }
}
