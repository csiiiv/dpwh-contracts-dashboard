import React from 'react'
import { getThemeVars } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import { Card } from '../../styled/Common.styled'

interface ContractsSummaryProps {
  stats: {
    totalContracts: number
    totalValue: number
    averageValue: number
    completedCount: number
    onGoingCount: number
  }
  isDark?: boolean
}

export const ContractsSummary: React.FC<ContractsSummaryProps> = ({
  stats,
  isDark = false
}) => {
  const vars = getThemeVars(isDark)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const statCards = [
    {
      label: 'Total Contracts',
      value: stats.totalContracts.toLocaleString(),
      icon: '📋'
    },
    {
      label: 'Total Value',
      value: formatCurrency(stats.totalValue),
      icon: '💰'
    },
    {
      label: 'Average Value',
      value: formatCurrency(stats.averageValue),
      icon: '📊'
    },
    {
      label: 'Completed',
      value: stats.completedCount.toLocaleString(),
      icon: '✅'
    },
    {
      label: 'On-Going',
      value: stats.onGoingCount.toLocaleString(),
      icon: '🚧'
    }
  ]

  return (
    <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: spacing[3],
        overflowX: 'auto',
        padding: spacing[2]
      }}>
        {statCards.map((stat, index) => (
          <div
            key={index}
            style={{
              padding: spacing[3],
              backgroundColor: vars.background.secondary,
              borderRadius: spacing[2],
              textAlign: 'center',
              minWidth: '140px',
              flex: '1 1 0',
              maxWidth: '200px'
            }}
          >
            <div style={{
              fontSize: '1.5em',
              marginBottom: spacing[1]
            }}>
              {stat.icon}
            </div>
            <div style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              color: vars.text.primary,
              marginBottom: spacing[1],
              wordBreak: 'break-word'
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: vars.text.secondary
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

