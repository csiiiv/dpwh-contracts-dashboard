import React, { useState, useCallback, useEffect } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeVars } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'

export interface UnifiedPaginationProps {
  // Core pagination data
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  
  // Callbacks
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  
  // Optional callbacks for advanced navigation (analytics style)
  onFirstPage?: () => void
  onPreviousPage?: () => void
  onNextPage?: () => void
  onLastPage?: () => void
  
  // Display options
  showingText?: string
  isDark?: boolean
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
  enableCustomPageInput?: boolean
  
  // Styling options
  variant?: 'default' | 'analytics' | 'minimal'
  className?: string
}

export const UnifiedPagination: React.FC<UnifiedPaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  showingText,
  isDark = false,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 20, 50, 100],
  enableCustomPageInput = true,
  variant = 'default',
  className
}) => {
  const { isDark: themeIsDark } = useTheme()
  const darkMode = isDark !== undefined ? isDark : themeIsDark
  const vars = getThemeVars(darkMode)

  // Generate showing text if not provided
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)
  const displayShowingText = showingText || `Showing ${startItem}-${endItem} of ${totalCount} results`

  // Navigation state
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage >= totalPages

  // Custom page input state
  const [pageInput, setPageInput] = useState(currentPage.toString())
  const [isEditingPage, setIsEditingPage] = useState(false)

  // Update input when currentPage changes externally
  useEffect(() => {
    setPageInput(currentPage.toString())
  }, [currentPage])

  // Custom page input handlers
  const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value)
  }, [])

  const handlePageInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(pageInput)
    
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    } else if (page < 1) {
      onPageChange(1)
    } else if (page > totalPages) {
      onPageChange(totalPages)
    }
    
    setIsEditingPage(false)
  }, [pageInput, totalPages, currentPage, onPageChange])

  const handlePageInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePageInputSubmit(e)
    } else if (e.key === 'Escape') {
      setPageInput(currentPage.toString())
      setIsEditingPage(false)
    }
  }, [handlePageInputSubmit, currentPage])

  const handlePageInputBlur = useCallback(() => {
    setPageInput(currentPage.toString())
    setIsEditingPage(false)
  }, [currentPage])

  const handlePageInputFocus = useCallback(() => {
    setIsEditingPage(true)
  }, [])

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      
      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push('...')
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...')
        }
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // Handle navigation with fallbacks
  const handleFirstPage = () => {
    if (onFirstPage) {
      onFirstPage()
    } else {
      onPageChange(1)
    }
  }

  const handlePreviousPage = () => {
    if (onPreviousPage) {
      onPreviousPage()
    } else {
      onPageChange(Math.max(1, currentPage - 1))
    }
  }

  const handleNextPage = () => {
    if (onNextPage) {
      onNextPage()
    } else {
      onPageChange(Math.min(totalPages, currentPage + 1))
    }
  }

  const handleLastPage = () => {
    if (onLastPage) {
      onLastPage()
    } else {
      onPageChange(totalPages)
    }
  }

  // Styles based on variant
  const getContainerStyle = () => {
    const baseStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing[4],
      padding: `${spacing[4]} ${spacing[6]}`,
      // Use theme variables so the container follows the current theme
      backgroundColor: vars.background.secondary,
      borderRadius: spacing[2],
      border: `1px solid ${vars.border.light}`
    }

    if (variant === 'minimal') {
      return {
        ...baseStyle,
        padding: `${spacing[2]} ${spacing[4]}`,
        backgroundColor: 'transparent',
        border: 'none',
        marginTop: spacing[2]
      }
    }

    return baseStyle
  }

    const buttonStyle = (disabled: boolean, isActive = false) => ({
    padding: `${spacing[2]} ${spacing[3]}`,
    backgroundColor: disabled 
      ? vars.background.tertiary 
      : isActive 
        ? vars.primary[600] 
        : vars.primary[500],
    color: disabled ? vars.text.secondary : vars.text.inverse,
    border: 'none',
    borderRadius: spacing[1],
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    transition: 'all 0.2s ease',
    minWidth: variant === 'minimal' ? '32px' : '40px',
    height: variant === 'minimal' ? '32px' : 'auto'
  })

  const selectStyle = {
    padding: `${spacing[1]} ${spacing[2]}`,
    backgroundColor: vars.background.primary,
    color: vars.text.primary,
    border: `1px solid ${vars.border.light}`,
    borderRadius: spacing[1],
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
    marginLeft: spacing[2]
  }

  const inputStyle = {
    padding: `${spacing[2]} ${spacing[2]}`,
    border: `1px solid ${vars.primary[500]}`,
    borderRadius: spacing[1],
    backgroundColor: vars.background.primary,
    color: vars.text.primary,
    fontSize: typography.fontSize.sm,
    margin: `0 ${spacing[1]}`,
    width: '60px',
    height: variant === 'minimal' ? '32px' : '36px',
    textAlign: 'center' as const,
    fontWeight: typography.fontWeight.semibold
  }

  // Don't render if only one page
  if (totalPages <= 1) {
    return (
      <div style={getContainerStyle()}>
        <div style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
          {displayShowingText}
        </div>
      </div>
    )
  }

  const pageNumbers = getPageNumbers()

  return (
    <div style={getContainerStyle()} className={className}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
        <div style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
          {displayShowingText}
        </div>
        
        {showPageSizeSelector && (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <label style={{ fontSize: typography.fontSize.sm, color: vars.text.secondary }}>
              Show:
            </label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={selectStyle}
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
        {/* First and Previous buttons */}
        {variant !== 'minimal' && (
          <>
            <button
              onClick={handleFirstPage}
              disabled={isFirstPage}
              style={buttonStyle(isFirstPage)}
            >
              First
            </button>
            
            <button
              onClick={handlePreviousPage}
              disabled={isFirstPage}
              style={buttonStyle(isFirstPage)}
            >
              Previous
            </button>
          </>
        )}

        {/* Previous button for minimal variant */}
        {variant === 'minimal' && (
          <button
            onClick={handlePreviousPage}
            disabled={isFirstPage}
            style={buttonStyle(isFirstPage)}
          >
            ←
          </button>
        )}
        
        {/* Page numbers */}
        <div style={{ display: 'flex', gap: spacing[1] }}>
          {pageNumbers.map((pageNum, index) => {
            // Handle ellipsis
            if (pageNum === '...') {
              return (
                <span
                  key={index}
                  style={{
                    color: vars.text.secondary,
                    fontSize: typography.fontSize.sm,
                    margin: `0 ${spacing[1]}`,
                    padding: `${spacing[2]} ${spacing[1]}`,
                    fontWeight: typography.fontWeight.normal,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: variant === 'minimal' ? '32px' : '40px'
                  }}
                >
                  ...
                </span>
              )
            }
            
            const page = pageNum as number
            const isActive = page === currentPage
            
            // Regular page button
            return (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                style={{
                  ...buttonStyle(false, isActive),
                  minWidth: variant === 'minimal' ? '32px' : '40px',
                  padding: variant === 'minimal' ? `${spacing[1]} ${spacing[2]}` : `${spacing[2]} ${spacing[2]}`
                }}
                title={`Go to page ${page}`}
              >
                {page}
              </button>
            )
          })}
        </div>
        
        {/* Custom page input - always visible when enabled */}
        {enableCustomPageInput && (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1], marginLeft: spacing[2] }}>
            <label style={{ 
              fontSize: typography.fontSize.sm, 
              color: vars.text.secondary,
              whiteSpace: 'nowrap'
            }}>
              Go to:
            </label>
            <form onSubmit={handlePageInputSubmit} style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputKeyDown}
                onBlur={handlePageInputBlur}
                style={{
                  ...inputStyle,
                  width: '50px',
                  height: variant === 'minimal' ? '32px' : '36px',
                  fontSize: typography.fontSize.sm
                }}
                min="1"
                max={totalPages}
                placeholder="Page"
                title={`Enter page number (1-${totalPages})`}
              />
            </form>
          </div>
        )}
        
        {/* Next button for minimal variant */}
        {variant === 'minimal' && (
          <button
            onClick={handleNextPage}
            disabled={isLastPage}
            style={buttonStyle(isLastPage)}
          >
            →
          </button>
        )}

        {/* Next and Last buttons */}
        {variant !== 'minimal' && (
          <>
            <button
              onClick={handleNextPage}
              disabled={isLastPage}
              style={buttonStyle(isLastPage)}
            >
              Next
            </button>
            
            <button
              onClick={handleLastPage}
              disabled={isLastPage}
              style={buttonStyle(isLastPage)}
            >
              Last
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default UnifiedPagination

