import React from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeVars } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import { 
  SummaryContainer,
  SummaryCard,
  SummaryValue,
  SummaryLabel
} from '../../styled/Common.styled'

interface AnalyticsSummaryProps {
  totalContracts: number
  totalValue: number
  averageValue: number
  isDark?: boolean
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  totalContracts,
  totalValue,
  averageValue,
  isDark = false
}) => {
  const { isDark: themeIsDark } = useTheme()
  const darkMode = isDark !== undefined ? isDark : themeIsDark
  const vars = getThemeVars(darkMode)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-PH').format(value)
  }

  return (
    <SummaryContainer $isDark={darkMode}>
      <SummaryCard $isDark={darkMode}>
        <SummaryValue $isDark={darkMode}>
          {formatNumber(totalContracts)}
        </SummaryValue>
        <SummaryLabel $isDark={darkMode}>Total Contracts</SummaryLabel>
      </SummaryCard>
      
      <SummaryCard $isDark={darkMode}>
        <SummaryValue $isDark={darkMode}>
          {formatCurrency(totalValue)}
        </SummaryValue>
        <SummaryLabel $isDark={darkMode}>Total Value</SummaryLabel>
      </SummaryCard>
      
      <SummaryCard $isDark={darkMode}>
        <SummaryValue $isDark={darkMode}>
          {formatCurrency(averageValue)}
        </SummaryValue>
        <SummaryLabel $isDark={darkMode}>Average Value</SummaryLabel>
      </SummaryCard>
    </SummaryContainer>
  )
}
