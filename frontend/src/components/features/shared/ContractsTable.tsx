import React from 'react'
import { DataTable, Column } from './DataTable'

export interface Contract {
  id: number
  reference_id: string
  notice_title: string
  award_title: string
  organization_name: string
  awardee_name: string
  business_category: string
  area_of_delivery: string
  contract_amount: number
  award_amount: number
  award_status: string
  contract_no: string
  award_date: string
  created_at: string
}

export interface ContractsTableProps {
  contracts: Contract[]
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
  onContractClick?: (contract: Contract) => void
  isDark?: boolean
  className?: string
  showPagination?: boolean
  showPageSizeControl?: boolean
}

export const ContractsTable: React.FC<ContractsTableProps> = ({
  contracts,
  loading = false,
  error = null,
  totalCount = 0,
  pageSize = 20,
  currentPage = 1,
  totalPages = 1,
  sortBy = 'contract_amount',
  sortDirection = 'desc',
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onContractClick,
  isDark = false,
  className = '',
  showPagination = true,
  showPageSizeControl = true
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
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

  const columns: Column<Contract>[] = [
    {
      key: 'award_date',
      label: 'Award Date',
      sortable: true,
      render: (value) => formatDate(value),
      width: '120px'
    },
    {
      key: 'award_title',
      label: 'Award Title',
      sortable: true,
      render: (value) => value || 'N/A'
    },
    {
      key: 'notice_title',
      label: 'Notice Title',
      sortable: true,
      render: (value) => value || 'N/A'
    },
    {
      key: 'contract_amount',
      label: 'Amount',
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
      key: 'awardee_name',
      label: 'Contractor',
      sortable: true,
      render: (value) => value || 'N/A'
    },
    {
      key: 'organization_name',
      label: 'Organization',
      sortable: true,
      render: (value) => value || 'N/A'
    },
    {
      key: 'business_category',
      label: 'Category',
      sortable: true,
      render: (value) => value || 'N/A'
    },
    {
      key: 'area_of_delivery',
      label: 'Area',
      sortable: true,
      render: (value) => value || 'N/A'
    }
  ]

  return (
    <DataTable
      data={contracts}
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
      onRowClick={onContractClick}
      emptyMessage="No contracts found matching your criteria"
      isDark={isDark}
      className={className}
      showPagination={showPagination}
      showPageSizeControl={showPageSizeControl}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  )
}
