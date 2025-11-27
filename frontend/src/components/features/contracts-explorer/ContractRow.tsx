import React from 'react'
import { Contract } from '../../../types/contracts'
import { getContractorNames } from '../../../types/contracts'
import { spacing } from '../../../design-system'
import type { ContractRowConfig } from './contracts-table-config'
import { getLayoutValues } from './contracts-table-config'

interface ContractRowProps {
  contract: Contract
  index: number
  isDark: boolean
  config: ContractRowConfig
  onContractClick?: (contract: Contract) => void
  onViewContractDetails?: (contract: Contract) => void
  formatCurrency: (amount: number | null) => string
  formatDate: (dateString: string | null) => string
  getStatusColor: (status: string | null) => string
}

/**
 * ContractRow - Renders a single contract as two stacked table rows
 * 
 * Layout:
 * - Row 1: Action button, ID, Contractors, Region, Status, Effectivity Date, Price
 * - Row 2: Description, Implementing Office, Expiry Date
 * - Cells with rowSpan=2: Action button, ID, Status, Price
 */
export const ContractRow: React.FC<ContractRowProps> = ({
  contract,
  index,
  isDark,
  config,
  onContractClick,
  onViewContractDetails,
  formatCurrency,
  formatDate,
  getStatusColor
}) => {
  // Calculate derived values from config
  const layout = getLayoutValues(config)
  
  // Theme colors
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const hoverBg = isDark ? '#1f2937' : '#f9fafb'
  const textPrimary = isDark ? '#f3f4f6' : '#111827'
  const textSecondary = isDark ? '#9ca3af' : '#6b7280'
  
  // Alternating row background
  const isEven = index % 2 === 0
  const rowBg = isEven 
    ? 'transparent' 
    : (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)')

  // Hover handlers - synchronize both rows
  const handleRow1Enter = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const nextRow = e.currentTarget.nextElementSibling as HTMLElement
    e.currentTarget.style.backgroundColor = hoverBg
    if (nextRow) nextRow.style.backgroundColor = hoverBg
  }

  const handleRow1Leave = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const nextRow = e.currentTarget.nextElementSibling as HTMLElement
    e.currentTarget.style.backgroundColor = rowBg
    if (nextRow) nextRow.style.backgroundColor = rowBg
  }

  const handleRow2Enter = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const prevRow = e.currentTarget.previousElementSibling as HTMLElement
    e.currentTarget.style.backgroundColor = hoverBg
    if (prevRow) prevRow.style.backgroundColor = hoverBg
  }

  const handleRow2Leave = (e: React.MouseEvent<HTMLTableRowElement>) => {
    const prevRow = e.currentTarget.previousElementSibling as HTMLElement
    e.currentTarget.style.backgroundColor = rowBg
    if (prevRow) prevRow.style.backgroundColor = rowBg
  }

  return (
    <React.Fragment>
      {/* Row 1: Primary Information */}
      <tr
        style={{
          borderBottom: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          backgroundColor: rowBg
        }}
        onMouseEnter={handleRow1Enter}
        onMouseLeave={handleRow1Leave}
        onClick={() => onContractClick?.(contract)}
      >
        {/* Action Button (rowSpan) */}
        <td
          rowSpan={2}
          style={{
            padding: spacing[2],
            textAlign: 'center',
            verticalAlign: 'middle',
            borderBottom: `1px solid ${borderColor}`
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewContractDetails?.(contract)
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7' }}
            title="View details"
            aria-label="View contract details"
          >
            🔍
          </button>
        </td>

        {/* Contract ID (rowSpan) */}
        <td
          rowSpan={2}
          style={{
            padding: spacing[2],
            fontSize: config.fontSize.primary,
            color: textPrimary,
            fontWeight: 600,
            verticalAlign: 'middle',
            borderBottom: `1px solid ${borderColor}`
          }}
        >
          {contract.contract_id || 'N/A'}
        </td>

        {/* Contractors */}
        <td
          style={{
            padding: spacing[2],
            fontSize: config.fontSize.primary,
            color: textPrimary,
            maxWidth: '400px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: layout.contractorsLines,
            WebkitBoxOrient: 'vertical' as any,
            lineHeight: `${layout.lineHeight}`,
            wordBreak: 'break-word',
            verticalAlign: 'top'
          }}
        >
          {getContractorNames(contract).join(' | ') || 'N/A'}
        </td>

        {/* Region */}
        <td
          style={{
            padding: spacing[2],
            fontSize: config.fontSize.primary,
            color: textPrimary
          }}
        >
          {contract.region || 'N/A'}
        </td>

        {/* Status (rowSpan) */}
        <td
          rowSpan={2}
          style={{
            padding: spacing[2],
            fontSize: config.fontSize.secondary,
            verticalAlign: 'middle',
            borderBottom: `1px solid ${borderColor}`
          }}
        >
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              backgroundColor: `${getStatusColor(contract.status)}20`,
              color: getStatusColor(contract.status),
              border: `1px solid ${getStatusColor(contract.status)}40`,
              fontWeight: 600
            }}
          >
            {contract.status || 'N/A'}
          </span>
        </td>

        {/* Effectivity Date */}
        <td
          style={{
            padding: spacing[2],
            fontSize: config.fontSize.primary,
            color: textPrimary
          }}
        >
          {formatDate(contract.effectivity_date)}
        </td>

        {/* Contract Price (rowSpan) */}
        <td
          rowSpan={2}
          style={{
            padding: spacing[2],
            fontSize: config.fontSize.primary,
            color: textPrimary,
            textAlign: 'right',
            fontFamily: 'monospace',
            fontWeight: 600,
            verticalAlign: 'middle',
            borderBottom: `1px solid ${borderColor}`
          }}
        >
          {formatCurrency(contract.cost_php)}
        </td>
      </tr>

      {/* Row 2: Secondary Information */}
      <tr
        style={{
          borderBottom: `1px solid ${borderColor}`,
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          backgroundColor: rowBg
        }}
        onMouseEnter={handleRow2Enter}
        onMouseLeave={handleRow2Leave}
        onClick={() => onContractClick?.(contract)}
      >
        {/* Description */}
        <td
          style={{
            padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}`,
            fontSize: config.fontSize.secondary,
            color: textSecondary,
            maxWidth: '400px',
            height: layout.row2Height,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: layout.descriptionLines,
            WebkitBoxOrient: 'vertical' as any,
            lineHeight: `${layout.lineHeight}`,
            wordBreak: 'break-word',
            verticalAlign: 'top'
          }}
        >
          {contract.description || 'N/A'}
        </td>

        {/* Implementing Office */}
        <td
          style={{
            padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}`,
            fontSize: config.fontSize.secondary,
            color: textSecondary,
            height: layout.row2Height
          }}
        >
          {contract.implementing_office || 'N/A'}
        </td>

        {/* Expiry Date */}
        <td
          style={{
            padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}`,
            fontSize: config.fontSize.secondary,
            color: textSecondary,
            height: layout.row2Height
          }}
        >
          {formatDate(contract.expiry_date)}
        </td>
      </tr>
    </React.Fragment>
  )
}


