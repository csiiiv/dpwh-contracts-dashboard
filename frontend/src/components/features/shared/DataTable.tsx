import React, { useCallback } from 'react'
import { getThemeVars } from '../../../design-system/theme'
import { typography, spacing } from '../../../design-system'
import { UnifiedPagination } from './UnifiedPagination'

export interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: any, item: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string | number
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  error?: any
  totalCount?: number
  pageSize?: number
  currentPage?: number
  totalPages?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void
  onRowClick?: (item: T, index: number) => void
  emptyMessage?: string
  isDark?: boolean
  className?: string
  showPagination?: boolean
  showPageSizeControl?: boolean
  pageSizeOptions?: number[]
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  totalCount = 0,
  pageSize = 20,
  currentPage = 1,
  totalPages = 1,
  sortBy = '',
  sortDirection = 'desc',
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onRowClick,
  emptyMessage = 'No data available',
  isDark = false,
  className = '',
  showPagination = true,
  showPageSizeControl = true,
  pageSizeOptions = [10, 20, 50, 100]
}: DataTableProps<T>) => {
  const vars = getThemeVars(isDark)

  const handleSort = useCallback((field: string) => {
    if (!onSortChange) return
    
    const newDirection = sortBy === field && sortDirection === 'desc' ? 'asc' : 'desc'
    onSortChange(field, newDirection)
  }, [sortBy, sortDirection, onSortChange])

  const getSortIcon = useCallback((field: string) => {
    if (sortBy !== field) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
  }, [sortBy, sortDirection])

  const renderCell = useCallback((column: Column<T>, item: T, index: number) => {
    const value = typeof column.key === 'string' && column.key.includes('.') 
      ? column.key.split('.').reduce((obj: any, key: string) => obj?.[key], item)
      : item[column.key as keyof T]

    if (column.render) {
      return column.render(value, item, index)
    }

    return value?.toString() || ''
  }, [])

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: typography.fontSize.sm,
    color: vars.text.primary
  }

  const thStyle = {
    padding: spacing[3],
    textAlign: 'left' as const,
    fontWeight: typography.fontWeight.semibold,
    color: vars.text.primary,
    backgroundColor: vars.background.secondary,
    borderBottom: `2px solid ${vars.border.medium}`,
    cursor: 'pointer',
    userSelect: 'none' as const,
    position: 'sticky' as const,
    top: 0,
    zIndex: 1
  }

  const getTdStyle = (column: Column<T>) => ({
    padding: spacing[3],
    borderBottom: `1px solid ${vars.border.light}`,
    color: vars.text.primary,
    wordWrap: 'break-word' as const,
    wordBreak: 'break-word' as const,
    whiteSpace: 'normal' as const,
    maxWidth: column.align === 'right' ? '150px' : '300px', // Smaller max width for right-aligned columns (usually currency)
    backgroundColor: 'inherit' // Ensure background color is inherited from row
  })

  const rowStyle = (index: number) => ({
    backgroundColor: index % 2 === 0 
      ? vars.background.primary 
      : vars.background.secondary,
    cursor: onRowClick ? 'pointer' : 'default',
    transition: 'background-color 0.2s ease'
  })

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
    color: vars.text.secondary
  }

  const emptyStyle = {
    textAlign: 'center' as const,
    padding: spacing[8],
    color: vars.text.secondary,
    fontStyle: 'italic' as const
  }


  if (loading) {
    return (
      <div className={className}>
        <div style={loadingStyle}>
          <div>Loading data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <div style={emptyStyle}>
          Error: {error.message || 'Failed to load data'}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Table */}
      <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  style={{
                    ...thStyle,
                    textAlign: column.align || 'left',
                    width: column.width
                  }}
                  onClick={() => column.sortable && onSortChange ? handleSort(column.key as string) : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                    {column.label}
                    {column.sortable && (
                      <span style={{ fontSize: '12px' }}>
                        {getSortIcon(column.key as string)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={emptyStyle}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  style={rowStyle(index)}
                  onClick={() => onRowClick?.(item, index)}
                  onMouseEnter={(e) => {
                    if (onRowClick) {
                      e.currentTarget.style.backgroundColor = vars.background.tertiary
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 
                        ? vars.background.primary 
                        : vars.background.secondary
                    }
                  }}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      style={{
                        ...getTdStyle(column),
                        textAlign: column.align || 'left'
                      }}
                    >
                      {renderCell(column, item, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      {showPagination && totalPages > 1 && (
        <UnifiedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={onPageChange || (() => {})}
          onPageSizeChange={onPageSizeChange || (() => {})}
          isDark={isDark}
          showPageSizeSelector={showPageSizeControl}
          enableCustomPageInput={true}
          variant="default"
        />
      )}
    </div>
  )
}
