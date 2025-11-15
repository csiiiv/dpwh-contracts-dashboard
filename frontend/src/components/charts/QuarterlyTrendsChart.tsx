import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { colors, typography, spacing } from '../../design-system'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface QuarterlyData {
  year: number
  quarter: number
  total_value: number
  contract_count: number
}

interface YearlyData {
  year: number
  total_value: number
  contract_count: number
}

interface QuarterlyTrendsChartProps {
  quarterlyData: QuarterlyData[]
  yearlyData: YearlyData[]
  title?: string
  height?: number
}

export const QuarterlyTrendsChart: React.FC<QuarterlyTrendsChartProps> = ({ 
  quarterlyData, 
  yearlyData,
  title = "Quarterly Contract Value Trends",
  height = 200 
}) => {
  const [showQuarterly, setShowQuarterly] = React.useState(true)
  const [showYearly, setShowYearly] = React.useState(true)
  const [showContractCount, setShowContractCount] = React.useState(false)

  if (!quarterlyData || quarterlyData.length === 0) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: spacing[2],
        border: `1px solid ${colors.border.light}`,
        color: colors.text.secondary,
        fontSize: typography.fontSize.sm,
      }}>
        No quarterly data available
      </div>
    )
  }

  // Sort quarterly data by year and quarter
  const sortedQuarterlyData = [...quarterlyData].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.quarter - b.quarter
  })

  // Sort yearly data by year
  const sortedYearlyData = [...yearlyData].sort((a, b) => a.year - b.year)

  // Create a complete dataset based on actual data range
  const generateCompleteQuarterlyData = () => {
    const completeData = []
    const dataMap = new Map()
    
    // Create a map of existing data
    sortedQuarterlyData.forEach(d => {
      dataMap.set(`${d.year}_${d.quarter}`, d)
    })
    
    // Always start from 2013, limit to 2027
    const minYear = 2013
    const maxYear = Math.min(2027, Math.max(...sortedQuarterlyData.map(d => d.year)))
    
    // Generate all quarters from 2013 Q1 to maxYear Q4
    for (let year = minYear; year <= maxYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const key = `${year}_${quarter}`
        const existingData = dataMap.get(key)
        
        completeData.push(existingData || {
          year,
          quarter,
          total_value: 0,
          contract_count: 0
        })
      }
    }
    
    return completeData
  }

  // Create a complete yearly dataset based on actual data range
  const generateCompleteYearlyData = () => {
    const completeData = []
    const dataMap = new Map()
    
    // Create a map of existing data
    sortedYearlyData.forEach(d => {
      dataMap.set(d.year, d)
    })
    
    // Find the actual data range from the yearly data, limit to 2027
    const minYear = 2013
    const maxYear = Math.min(2027, Math.max(...sortedYearlyData.map(d => d.year)))
    
    // Generate all years from minYear to maxYear
    for (let year = minYear; year <= maxYear; year++) {
      const existingData = dataMap.get(year)
      
      completeData.push(existingData || {
        year,
        total_value: 0,
        contract_count: 0
      })
    }
    
    return completeData
  }

  const completeQuarterlyData = generateCompleteQuarterlyData()
  const completeYearlyData = generateCompleteYearlyData()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatQuarter = (year: number, quarter: number) => {
    return `Q${quarter} ${year}`
  }

  // Create yearly data positioned at Q1 of each year
  const createYearlyDataForChart = () => {
    const yearlyChartData = new Array(completeQuarterlyData.length).fill(null)
    
    completeYearlyData.forEach((yearData) => {
      // Find the Q1 position for this year in the quarterly data
      const q1Index = completeQuarterlyData.findIndex(d => d.year === yearData.year && d.quarter === 1)
      if (q1Index !== -1) {
        yearlyChartData[q1Index] = yearData.total_value
      }
    })
    
    return yearlyChartData
  }

  // Create yearly contract count data positioned at Q1 of each year
  const createYearlyCountDataForChart = () => {
    const yearlyCountChartData = new Array(completeQuarterlyData.length).fill(null)
    
    completeYearlyData.forEach((yearData) => {
      // Find the Q1 position for this year in the quarterly data
      const q1Index = completeQuarterlyData.findIndex(d => d.year === yearData.year && d.quarter === 1)
      if (q1Index !== -1) {
        yearlyCountChartData[q1Index] = yearData.contract_count
      }
    })
    
    return yearlyCountChartData
  }

  const yearlyChartData = createYearlyDataForChart()
  const yearlyCountChartData = createYearlyCountDataForChart()

  // Prepare chart data
  const datasets = []
  
  // Add quarterly contract value line
  if (showQuarterly) {
    datasets.push({
      label: 'Quarterly Contract Value',
      data: completeQuarterlyData.map(d => d.total_value),
      borderColor: colors.primary[600],
      backgroundColor: colors.primary[100],
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      pointBackgroundColor: colors.primary[600],
      pointBorderColor: colors.background.primary,
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
    })
  }
  
  // Add yearly contract value line
  if (showYearly) {
    datasets.push({
      label: 'Yearly Contract Value',
      data: yearlyChartData,
      borderColor: colors.secondary[600],
      backgroundColor: colors.secondary[100],
      borderWidth: 3,
      fill: false,
      tension: 0.1,
      pointBackgroundColor: colors.secondary[600],
      pointBorderColor: colors.background.primary,
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointStyle: 'circle',
      spanGaps: true, // Connect points across null values
    })
  }
  
  // Add contract count lines if enabled
  if (showContractCount) {
    if (showQuarterly) {
      datasets.push({
        label: 'Quarterly Contract Count',
        data: completeQuarterlyData.map(d => d.contract_count),
        borderColor: colors.warning[600],
        backgroundColor: colors.warning[100],
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: colors.warning[600],
        pointBorderColor: colors.background.primary,
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y1',
      })
    }
    
    if (showYearly) {
      datasets.push({
        label: 'Yearly Contract Count',
        data: yearlyCountChartData,
        borderColor: colors.gray[600],
        backgroundColor: colors.gray[100],
        borderWidth: 3,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: colors.gray[600],
        pointBorderColor: colors.background.primary,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointStyle: 'circle',
        spanGaps: true, // Connect points across null values
        yAxisID: 'y1',
      })
    }
  }

  const chartData = {
    labels: completeQuarterlyData.map(d => formatQuarter(d.year, d.quarter)),
    datasets,
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
          color: colors.text.primary,
        },
      },
      title: {
        display: true,
        text: `${title} (2013 Q1 - ${completeQuarterlyData[completeQuarterlyData.length - 1]?.year || 'N/A'} Q${completeQuarterlyData[completeQuarterlyData.length - 1]?.quarter || 4})`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: colors.text.primary,
      },
      tooltip: {
        backgroundColor: colors.background.primary,
        titleColor: colors.text.primary,
        bodyColor: colors.text.primary,
        borderColor: colors.border.light,
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex
            const quarterData = completeQuarterlyData[dataIndex]
            const datasetLabel = context.dataset.label || 'Data'
            
            if (datasetLabel.includes('Count')) {
              return `${datasetLabel}: ${context.parsed.y?.toLocaleString() || 'N/A'}`
            } else {
              return `${datasetLabel}: ${formatCurrency(context.parsed.y || 0)}`
            }
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Quarter',
          color: colors.text.secondary,
        },
        ticks: {
          color: colors.text.secondary,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: colors.border.light,
          drawBorder: false,
        },
      },
      y: {
        display: true,
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Contract Value (PHP)',
          color: colors.text.secondary,
        },
        ticks: {
          color: colors.text.secondary,
          callback: function(value: any) {
            return formatCurrency(value)
          }
        },
        grid: {
          color: colors.border.light,
          drawBorder: false,
        },
      },
      y1: {
        display: showContractCount,
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Contract Count',
          color: colors.text.secondary,
        },
        ticks: {
          color: colors.text.secondary,
          callback: function(value: any) {
            return value.toLocaleString()
          }
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  // Calculate summary statistics
  const totalValue = completeQuarterlyData.reduce((sum, d) => sum + d.total_value, 0)
  const totalContracts = completeQuarterlyData.reduce((sum, d) => sum + d.contract_count, 0)
  const avgPerQuarter = totalValue / completeQuarterlyData.length
  const peakQuarter = completeQuarterlyData.reduce((max, d) => d.total_value > max.total_value ? d : max, completeQuarterlyData[0])
  
  // Yearly statistics
  const yearlyTotalValue = completeYearlyData.reduce((sum, d) => sum + d.total_value, 0)
  const yearlyTotalContracts = completeYearlyData.reduce((sum, d) => sum + d.contract_count, 0)
  const avgPerYear = yearlyTotalValue / completeYearlyData.length
  const peakYear = completeYearlyData.reduce((max, d) => d.total_value > max.total_value ? d : max, completeYearlyData[0])

  return (
    <div style={{
      backgroundColor: colors.background.primary,
      padding: spacing[4],
      borderRadius: spacing[2],
      border: `1px solid ${colors.border.light}`,
    }}>
      {/* Toggle Controls */}
      <div style={{
        display: 'flex',
        gap: spacing[4],
        marginBottom: spacing[4],
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: spacing[1], cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showQuarterly}
              onChange={(e) => setShowQuarterly(e.target.checked)}
              style={{ margin: 0 }}
            />
            <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
              Quarterly Value
            </span>
          </label>
        </div>
        
        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: spacing[1], cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showYearly}
              onChange={(e) => setShowYearly(e.target.checked)}
              style={{ margin: 0 }}
            />
            <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
              Yearly Value
            </span>
          </label>
        </div>
        
        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: spacing[1], cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showContractCount}
              onChange={(e) => setShowContractCount(e.target.checked)}
              style={{ margin: 0 }}
            />
            <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
              Contract Count
            </span>
          </label>
        </div>
      </div>

      <div style={{ height: height, marginBottom: spacing[4] }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Summary stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: spacing[3],
        fontSize: typography.fontSize.sm,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: colors.text.secondary, fontSize: typography.fontSize.xs }}>
            Total Value
          </div>
          <div style={{ 
            color: colors.text.primary, 
            fontWeight: typography.fontWeight.semibold,
            marginTop: spacing[1],
          }}>
            {formatCurrency(totalValue)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: colors.text.secondary, fontSize: typography.fontSize.xs }}>
            Total Contracts
          </div>
          <div style={{ 
            color: colors.text.primary, 
            fontWeight: typography.fontWeight.semibold,
            marginTop: spacing[1],
          }}>
            {totalContracts.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: colors.text.secondary, fontSize: typography.fontSize.xs }}>
            Avg per Quarter
          </div>
          <div style={{ 
            color: colors.text.primary, 
            fontWeight: typography.fontWeight.semibold,
            marginTop: spacing[1],
          }}>
            {formatCurrency(avgPerQuarter)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: colors.text.secondary, fontSize: typography.fontSize.xs }}>
            Peak Quarter
          </div>
          <div style={{ 
            color: colors.text.primary, 
            fontWeight: typography.fontWeight.semibold,
            marginTop: spacing[1],
          }}>
            {formatQuarter(peakQuarter.year, peakQuarter.quarter)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: colors.text.secondary, fontSize: typography.fontSize.xs }}>
            Avg per Year
          </div>
          <div style={{ 
            color: colors.text.primary, 
            fontWeight: typography.fontWeight.semibold,
            marginTop: spacing[1],
          }}>
            {formatCurrency(avgPerYear)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: colors.text.secondary, fontSize: typography.fontSize.xs }}>
            Peak Year
          </div>
          <div style={{ 
            color: colors.text.primary, 
            fontWeight: typography.fontWeight.semibold,
            marginTop: spacing[1],
          }}>
            {peakYear.year}
          </div>
        </div>
      </div>
    </div>
  )
}
