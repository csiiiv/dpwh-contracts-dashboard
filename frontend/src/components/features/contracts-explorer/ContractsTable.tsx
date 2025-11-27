import React, { useCallback, useState, useEffect } from 'react'
import { Contract } from '../../../types/contracts'
import { spacing, typography } from '../../../design-system'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { ContractRow } from './ContractRow'
import { DEFAULT_ROW_CONFIG, type ContractRowConfig } from './contracts-table-config'

interface ContractsTableProps {
  contracts: Contract[]
  totalCount: number
  pageSize: number
  currentPage: number
  totalPages: number
  sortBy: string
  sortDirection: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSortChange: (field: string, direction: 'asc' | 'desc') => void
  onContractClick?: (contract: Contract) => void
  onViewContractDetails?: (contract: Contract) => void
  isDark?: boolean
  rowConfig?: ContractRowConfig  // Optional configuration for row layout
}

export const ContractsTable: React.FC<ContractsTableProps> = ({
  contracts,
  totalCount,
  pageSize,
  currentPage,
  totalPages,
  sortBy,
  sortDirection,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onContractClick,
  onViewContractDetails,
  isDark = false,
  rowConfig = DEFAULT_ROW_CONFIG  // Use default config if not provided
}) => {
  const [isUpdating, setIsUpdating] = useState(false)

  // Show loading overlay when data is being filtered/sorted
  useEffect(() => {
    setIsUpdating(true)
    const timer = setTimeout(() => setIsUpdating(false), 300)
    return () => clearTimeout(timer)
  }, [sortBy, sortDirection, currentPage, pageSize])
  const formatCurrency = useCallback((amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A'
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }, [])

  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }, [])

  const formatPercentage = useCallback((value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return `${value.toFixed(1)}%`
  }, [])

  const getStatusColor = (status: string | null): string => {
    if (!status) return '#6b7280'
    const s = status.toLowerCase()
    if (s.includes('completed')) return '#10b981'
    if (s.includes('ongoing') || s.includes('on-going')) return '#3b82f6'
    if (s.includes('terminated') || s.includes('cancelled')) return '#ef4444'
    return '#6b7280'
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      onSortChange(field, 'desc')
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <span style={{ opacity: 0.3 }}>⇅</span>
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>
  }

  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const hoverBg = isDark ? '#1f2937' : '#f9fafb'
  const textPrimary = isDark ? '#f3f4f6' : '#111827'
  const textSecondary = isDark ? '#9ca3af' : '#6b7280'

  return (
    <div style={{ position: 'relative' }}>
      {/* Loading Overlay */}
      {isUpdating && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          backdropFilter: 'blur(2px)'
        }}>
          <LoadingSpinner size="large" />
        </div>
      )}

      {/* Compact Two-Row Table */}
      <div style={{ 
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch' as any,
        msOverflowStyle: '-ms-autohiding-scrollbar'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'separate', 
          borderSpacing: 0,
          minWidth: '900px' // Prevent table from squeezing too much on mobile
        }}>
          <thead>
            {/* Header Row 1 */}
            <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
              <th rowSpan={2} style={{ padding: spacing[2], width: '40px', textAlign: 'center', borderBottom: `2px solid ${borderColor}` }}></th>
              <th 
                rowSpan={2}
                style={{ padding: spacing[2], textAlign: 'left', cursor: 'pointer', fontSize: typography.fontSize.xs, fontWeight: 600, color: textSecondary, borderBottom: `2px solid ${borderColor}` }}
                onClick={() => handleSort('contract_id')}
              >
                Contract ID <SortIcon field="contract_id" />
              </th>
              <th 
                style={{ padding: `${spacing[2]} ${spacing[2]} ${spacing[1]} ${spacing[2]}`, textAlign: 'left', cursor: 'pointer', fontSize: typography.fontSize.xs, fontWeight: 600, color: textSecondary }}
                onClick={() => handleSort('contractor_name_1')}
              >
                Contractors <SortIcon field="contractor_name_1" />
              </th>
              <th 
                style={{ padding: `${spacing[2]} ${spacing[2]} ${spacing[1]} ${spacing[2]}`, textAlign: 'left', cursor: 'pointer', fontSize: typography.fontSize.xs, fontWeight: 600, color: textSecondary }}
                onClick={() => handleSort('region')}
              >
                Region <SortIcon field="region" />
              </th>
              <th 
                rowSpan={2}
                style={{ padding: spacing[2], textAlign: 'left', cursor: 'pointer', fontSize: typography.fontSize.xs, fontWeight: 600, color: textSecondary, borderBottom: `2px solid ${borderColor}` }}
                onClick={() => handleSort('status')}
              >
                Status <SortIcon field="status" />
              </th>
              <th 
                style={{ padding: `${spacing[2]} ${spacing[2]} ${spacing[1]} ${spacing[2]}`, textAlign: 'left', cursor: 'pointer', fontSize: typography.fontSize.xs, fontWeight: 600, color: textSecondary }}
                onClick={() => handleSort('effectivity_date')}
              >
                Effectivity Date <SortIcon field="effectivity_date" />
              </th>
              <th 
                rowSpan={2}
                style={{ padding: spacing[2], textAlign: 'right', cursor: 'pointer', fontSize: typography.fontSize.xs, fontWeight: 600, color: textSecondary, borderBottom: `2px solid ${borderColor}` }}
                onClick={() => handleSort('cost_php')}
              >
                Contract Price <SortIcon field="cost_php" />
              </th>
            </tr>
            {/* Header Row 2 */}
            <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
              <th 
                style={{ padding: `${spacing[1]} ${spacing[2]} ${spacing[2]} ${spacing[2]}`, textAlign: 'left', cursor: 'pointer', fontSize: typography.fontSize.xs, fontWeight: 600, color: textSecondary }}
                onClick={() => handleSort('description')}
              >
                Description <SortIcon field="description" />
              </th>
              <th 
                style={{ padding: `${spacing[1]} ${spacing[2]} ${spacing[2]} ${spacing[2]}`, textAlign: 'left', cursor: 'pointer', fontSize: typography.fontSize.xs, fontWeight: 600, color: textSecondary }}
                onClick={() => handleSort('implementing_office')}
              >
                Implementing Office <SortIcon field="implementing_office" />
              </th>
              <th 
                style={{ padding: `${spacing[1]} ${spacing[2]} ${spacing[2]} ${spacing[2]}`, textAlign: 'left', cursor: 'pointer', fontSize: typography.fontSize.xs, fontWeight: 600, color: textSecondary }}
                onClick={() => handleSort('expiry_date')}
              >
                Expiry Date <SortIcon field="expiry_date" />
              </th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract, idx) => {
              const uniqueKey = contract.year && contract.contract_id 
                ? `${contract.year}-${contract.contract_id}` 
                : contract.contract_id || `idx-${idx}`
              
              return (
                <ContractRow
                  key={uniqueKey}
                  contract={contract}
                  index={idx}
                  isDark={isDark}
                  config={rowConfig}
                  onContractClick={onContractClick}
                  onViewContractDetails={onViewContractDetails}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing[3],
        marginTop: spacing[4],
        padding: spacing[3],
        borderTop: `1px solid ${borderColor}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], fontSize: typography.fontSize.sm, color: textSecondary, flexWrap: 'wrap' }}>
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: `${spacing[1]} ${spacing[2]}`,
              borderRadius: '4px',
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              color: textPrimary,
              cursor: 'pointer'
            }}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <span>
            Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
          </span>
        </div>

        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: `${spacing[2]} ${spacing[3]}`,
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: currentPage === 1 ? (isDark ? '#111827' : '#f3f4f6') : (isDark ? '#1f2937' : '#ffffff'),
              color: currentPage === 1 ? textSecondary : textPrimary,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: typography.fontSize.sm,
              fontWeight: 600
            }}
          >
            Previous
          </button>
          
          <span style={{ fontSize: typography.fontSize.sm, color: textSecondary }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: `${spacing[2]} ${spacing[3]}`,
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: currentPage === totalPages ? (isDark ? '#111827' : '#f3f4f6') : (isDark ? '#1f2937' : '#ffffff'),
              color: currentPage === totalPages ? textSecondary : textPrimary,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: typography.fontSize.sm,
              fontWeight: 600
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

