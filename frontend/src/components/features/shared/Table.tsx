import React from 'react'
import { createTableStyles, TableConfigs, TableUtils, TableStyles } from './ModalStyles'
import { spacing } from '../../../design-system'
import { getThemeVars } from '../../../design-system/theme'

interface Column {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string | number
  type?: 'text' | 'amount' | 'number' | 'date' | 'center'
  clickable?: boolean
}

interface TableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
  isDark?: boolean
  config?: keyof typeof TableConfigs | Partial<typeof TableConfigs.default>
  onSort?: (key: string) => void
  sortConfig?: { key: string; direction: 'asc' | 'desc' }
  onRowClick?: (row: any, index: number) => void
  className?: string
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  isDark = false,
  config = 'default',
  onSort,
  sortConfig,
  onRowClick,
  className
}) => {
  const vars = getThemeVars(isDark)
  const tableConfig = typeof config === 'string' ? TableConfigs[config] : { ...TableConfigs.default, ...config }
  const styles: TableStyles = createTableStyles(isDark, tableConfig)

  const handleSort = (key: string) => {
    if (onSort && tableConfig.sortable) {
      onSort(key)
    }
  }

  const getCellStyle = (column: Column) => {
    switch (column.type) {
      case 'amount':
        return styles.cellAmount
      case 'number':
        return styles.cellNumber
      case 'center':
        return styles.cellCenter
      default:
        return styles.cell
    }
  }

  const formatCellValue = (value: any, column: Column) => {
    switch (column.type) {
      case 'amount':
        return TableUtils.formatCurrency(value)
      case 'number':
        return TableUtils.formatNumber(value)
      case 'date':
        return TableUtils.formatDate(value)
      default:
        return value || 'N/A'
    }
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || !tableConfig.sortable) return null
    return TableUtils.getSortIcon(key, sortConfig.key, sortConfig.direction)
  }

  if (loading) {
    return (
      <div style={styles.container} className={className}>
        <div style={styles.loading}>
          Loading...
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div style={styles.container} className={className}>
        <div style={styles.empty}>
          {emptyMessage}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container} className={className}>
      <table style={styles.table}>
        <thead style={styles.header}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  ...styles.headerCell,
                  textAlign: column.align || 'left',
                  width: column.width,
                  cursor: column.sortable && tableConfig.sortable ? 'pointer' : 'default'
                }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={styles.body}>
          {data.map((row, index) => (
            <tr
              key={index}
              style={{
                ...styles.row,
                cursor: onRowClick ? 'pointer' : 'default'
              }}
              onClick={() => onRowClick?.(row, index)}
              onMouseEnter={(e) => {
                if (tableConfig.hoverable) {
                  Object.assign(e.currentTarget.style, styles.hover)
                }
              }}
              onMouseLeave={(e) => {
                if (tableConfig.hoverable) {
                  Object.assign(e.currentTarget.style, { backgroundColor: 'transparent' })
                }
              }}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    ...getCellStyle(column),
                    textAlign: column.align || 'left'
                  }}
                >
                  {column.clickable && onRowClick ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRowClick(row, index)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: vars.primary[600],
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: 'inherit',
                        fontFamily: 'inherit',
                        textAlign: column.align || 'left',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = vars.primary[700]
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = vars.primary[600]
                      }}
                    >
                      {formatCellValue(row[column.key], column)}
                    </button>
                  ) : (
                    formatCellValue(row[column.key], column)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Hook for easy table creation
 */
export const useTable = (isDark: boolean = false, config: keyof typeof TableConfigs = 'default') => {
  const styles = createTableStyles(isDark, TableConfigs[config])
  const utils = TableUtils

  return {
    styles,
    utils,
    createTable: (props: Omit<TableProps, 'isDark' | 'config'>) => (
      <Table {...props} isDark={isDark} config={config} />
    )
  }
}

/**
 * Higher-order component for easy table creation
 */
export const withTable = <P extends object>(
  Component: React.ComponentType<P>,
  defaultConfig: keyof typeof TableConfigs = 'default'
) => {
  return React.forwardRef<HTMLDivElement, P & Omit<TableProps, 'isDark' | 'config'>>((props, ref) => (
    <Table {...props} ref={ref} config={defaultConfig} />
  ))
}
