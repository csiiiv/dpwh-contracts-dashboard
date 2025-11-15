import { useState, useCallback, useMemo } from 'react'

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalCount: number
}

export interface PaginationActions {
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setTotalCount: (count: number) => void
  goToFirstPage: () => void
  goToLastPage: () => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  reset: () => void
}

export interface PaginationInfo {
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  startIndex: number
  endIndex: number
  showingText: string
}

export const usePagination = (initialPageSize: number = 20): PaginationState & PaginationActions & { info: PaginationInfo } => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = Math.ceil(totalCount / pageSize)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalCount)
  const showingText = `Showing ${startIndex} to ${endIndex} of ${totalCount.toLocaleString()} results`

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages)
  }, [totalPages])

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }, [totalPages])

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }, [])

  const reset = useCallback(() => {
    setCurrentPage(1)
    setTotalCount(0)
  }, [])

  const info = useMemo(() => ({
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    showingText
  }), [totalPages, hasNextPage, hasPreviousPage, startIndex, endIndex, totalCount])

  return {
    currentPage,
    pageSize,
    totalCount,
    setCurrentPage,
    setPageSize,
    setTotalCount,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    reset,
    info
  }
}
