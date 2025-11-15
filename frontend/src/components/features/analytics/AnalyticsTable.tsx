import React from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { createTableStyles, TableConfigs, TableUtils } from '../shared/ModalStyles'
import { spacing, typography } from '../../../design-system'

interface AnalyticsTableProps {
  data: Array<{ label: string; total_value: number; count: number }>
  metric: 'amount' | 'count' | 'avg'
  onEntityClick?: (entityName: string) => void
  isDark?: boolean
  loading?: boolean
  currentPage?: number
  pageSize?: number
}

export const AnalyticsTable: React.FC<AnalyticsTableProps> = ({
  data,
  metric,
  onEntityClick,
  isDark = false,
  loading = false,
  currentPage = 1,
  pageSize = 20
}) => {
  const { isDark: themeIsDark } = useTheme()
  const darkMode = isDark !== undefined ? isDark : themeIsDark
  const styles = createTableStyles(darkMode, TableConfigs.analytics)

  const getValue = (item: { label: string; total_value: number; count: number }) => {
    switch (metric) {
      case 'amount':
        return TableUtils.formatCurrency(item.total_value)
      case 'count':
        return TableUtils.formatNumber(item.count)
      case 'avg':
        const avg = item.total_value / Math.max(1, item.count)
        return TableUtils.formatCurrency(avg)
      default:
        return TableUtils.formatCurrency(item.total_value)
    }
  }

  const getValueLabel = () => {
    switch (metric) {
      case 'amount':
        return 'Total Value'
      case 'count':
        return 'Count'
      case 'avg':
        return 'Average Value'
      default:
        return 'Value'
    }
  }

  // Calculate rank based on current page and page size
  const getRank = (index: number) => {
    return (currentPage - 1) * pageSize + index + 1
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          Loading...
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          No data available
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead style={styles.header}>
          <tr>
            <th style={{ ...styles.headerCell, textAlign: 'center', width: '60px' }}>
              Rank
            </th>
            <th style={{ ...styles.headerCell, textAlign: 'left' }}>
              Entity
            </th>
            <th style={{ ...styles.headerCell, textAlign: 'right' }}>
              {getValueLabel()}
            </th>
            <th style={{ ...styles.headerCell, textAlign: 'right' }}>
              Count
            </th>
          </tr>
        </thead>
        <tbody style={styles.body}>
          {data.map((item, index) => (
            <tr 
              key={`${item.label}-${index}`}
              style={{
                ...styles.row,
                cursor: onEntityClick ? 'pointer' : 'default'
              }}
              onClick={() => onEntityClick?.(item.label)}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.hover)
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, { backgroundColor: 'transparent' })
              }}
            >
              <td style={{ ...styles.cellCenter, width: '60px' }}>
                #{getRank(index)}
              </td>
              <td style={{ ...styles.cell, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {onEntityClick ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEntityClick(item.label)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: darkMode ? '#60a5fa' : '#2563eb',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 'inherit',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      ':hover': {
                        color: darkMode ? '#93c5fd' : '#1d4ed8',
                        textDecoration: 'underline'
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = darkMode ? '#93c5fd' : '#1d4ed8'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = darkMode ? '#60a5fa' : '#2563eb'
                    }}
                  >
                    {item.label}
                  </button>
                ) : (
                  item.label
                )}
              </td>
              <td style={{ ...styles.cellAmount }}>
                {getValue(item)}
              </td>
              <td style={{ ...styles.cellNumber }}>
                {TableUtils.formatNumber(item.count)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
