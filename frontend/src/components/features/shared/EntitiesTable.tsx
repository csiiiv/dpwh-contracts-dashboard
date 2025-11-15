import React from 'react'
import { DataTable, Column } from './DataTable'
import { getThemeVars } from '../../../design-system/theme'

export interface EntitySummary {
  name: string
  total_contract_value: number
  contract_count: number
  average_contract_value: number
  first_contract_date?: string
  last_contract_date?: string
}

export interface EntitiesTableProps {
  entities: EntitySummary[]
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
  onEntityClick?: (entity: EntitySummary) => void
  entityType?: string
  isDark?: boolean
  className?: string
  showPagination?: boolean
  showPageSizeControl?: boolean
}

export const EntitiesTable: React.FC<EntitiesTableProps> = ({
  entities,
  loading = false,
  error = null,
  totalCount = 0,
  pageSize = 50,
  currentPage = 1,
  totalPages = 1,
  sortBy = 'total_contract_value',
  sortDirection = 'desc',
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onEntityClick,
  entityType = 'entity',
  isDark = false,
  className = '',
  showPagination = true,
  showPageSizeControl = true
}) => {
  const vars = getThemeVars(isDark)
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-PH').format(value || 0)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const columns: Column<EntitySummary>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, item) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEntityClick?.(item)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: vars.primary[600],
            textDecoration: 'underline',
            cursor: 'pointer',
            textAlign: 'left',
            padding: 0,
            fontSize: 'inherit',
            fontWeight: 'inherit',
            wordWrap: 'break-word',
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            display: 'block',
            transition: 'color 0.2s ease'
          }}
          title={`Click to explore ${value}`}
        >
          {value || 'Unknown'}
        </button>
      )
    },
    {
      key: 'total_contract_value',
      label: 'Total Value',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span style={{ 
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          display: 'block'
        }}>
          {formatCurrency(value)}
        </span>
      ),
      width: '150px'
    },
    {
      key: 'contract_count',
      label: 'Contracts',
      sortable: true,
      align: 'right',
      render: (value) => formatNumber(value),
      width: '100px'
    },
    {
      key: 'average_contract_value',
      label: 'Avg Value',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span style={{ 
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          display: 'block'
        }}>
          {formatCurrency(value)}
        </span>
      ),
      width: '150px'
    }
  ]

  // Add date columns for contractors
  if (entityType === 'contractor' || entityType === 'contractors') {
    columns.push(
      {
        key: 'first_contract_date',
        label: 'First Contract',
        sortable: true,
        render: (value) => value ? formatDate(value) : 'N/A',
        width: '120px'
      },
      {
        key: 'last_contract_date',
        label: 'Last Contract',
        sortable: true,
        render: (value) => value ? formatDate(value) : 'N/A',
        width: '120px'
      }
    )
  }

  return (
    <DataTable
      data={entities}
      columns={columns}
      loading={loading}
      error={error}
      totalCount={totalCount}
      pageSize={pageSize}
      currentPage={currentPage}
      totalPages={totalPages}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onSortChange={onSortChange}
      onRowClick={onEntityClick}
      emptyMessage={`No ${entityType}s found matching your criteria`}
      isDark={isDark}
      className={className}
      showPagination={showPagination}
      showPageSizeControl={showPageSizeControl}
      pageSizeOptions={[25, 50, 100, 200]}
    />
  )
}
