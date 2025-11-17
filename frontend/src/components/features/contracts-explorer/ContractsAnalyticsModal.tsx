import React, { useState, useMemo, useCallback } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeVars } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import { useContractsAnalytics, useContractsAnalyticsControls } from '../../../hooks/useContractsAnalytics'
import { Contract, ContractFilters, getContractorNames } from '../../../types/contracts'
import { Modal } from '../shared/Modal'
import { Card, BodyText } from '../../styled/Common.styled'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { QuarterlyTrendsChart } from '../../charts/QuarterlyTrendsChart'
import { downloadContractsCSV } from '../../../utils/contractsExport'

// Utility function to format currency
const formatCurrency = (value: number): string => {
  if (value >= 1e12) return `₱${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `₱${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `₱${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `₱${(value / 1e3).toFixed(2)}K`
  return `₱${value.toFixed(2)}`
}

interface ContractsAnalyticsModalProps {
  open: boolean
  onClose: () => void
  contracts: Contract[]
  filters: ContractFilters
  isDark?: boolean
}

interface DrillDownState {
  open: boolean
  breadcrumbs: Array<{
    entityName: string // Display name
    entityId: string // For contractors: contractor_id_1, for others: same as entityName
    entityType: 'contractor' | 'region' | 'implementing_office' | 'status' | 'source_of_funds'
  }>
}

type DrillDownTab = 'contracts' | 'contractors' | 'regions' | 'offices' | 'statuses' | 'funds'

export const ContractsAnalyticsModal: React.FC<ContractsAnalyticsModalProps> = ({
  open,
  onClose,
  contracts,
  filters,
  isDark = false
}) => {
  console.log('📊 [ContractsAnalyticsModal] Render:', { open, contractsCount: contracts.length, filters })
  
  const { isDark: themeDark } = useTheme()
  const vars = getThemeVars(isDark ?? themeDark)
  
  // Analytics controls
  const controls = useContractsAnalyticsControls()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  
  // Drill-down state
  const [drillDown, setDrillDown] = useState<DrillDownState>({
    open: false,
    breadcrumbs: []
  })

  // Drill-down active tab
  const [drillDownActiveTab, setDrillDownActiveTab] = useState<DrillDownTab>('contracts')
  
  // Entity pagination state
  const [entityPage, setEntityPage] = useState(1)
  const entityPageSize = 20

  // Sorting state for drill-down tables
  const [sortField, setSortField] = useState<'name' | 'total_value' | 'count' | 'avg_value'>('total_value')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [contractsSortField, setContractsSortField] = useState<'contract_id' | 'cost_php' | 'year' | 'status'>('cost_php')
  const [contractsSortDirection, setContractsSortDirection] = useState<'asc' | 'desc'>('desc')

  // Helper function to navigate with tab preservation (hash-only, no reload)
  const navigateWithTab = useCallback((hash: string, tabParam?: string) => {
    const currentTab = tabParam || drillDownActiveTab
    // Put tab parameter AFTER hash to avoid page reload
    const hashWithTab = currentTab !== 'contracts' ? `${hash}?tab=${currentTab}` : hash
    window.location.hash = hashWithTab
  }, [drillDownActiveTab])

  // Hash routing for drill-down with tab parameter support
  React.useEffect(() => {
    const handleHashChange = () => {
      if (!open) return // Don't process if modal is closed
      
      // Parse hash and query parameters correctly
      // URL format: /path#analytics/contractor/17267?tab=regions
      const hash = window.location.hash
      
      // Split hash and query params (after hash)
      const [hashPath, hashQuery] = hash.split('?')
      const tabParam = hashQuery ? new URLSearchParams(hashQuery).get('tab') as DrillDownTab | null : null
      
      if (hashPath.startsWith('#analytics/')) {
        // Remove contract details part if present to get the drill-down path
        const analyticsPath = hashPath.split('/contract/')[0]
        const parts = analyticsPath.replace('#analytics/', '').split('/')
        
        // Parse breadcrumbs from hash path (type/id/type/id/...)
        const newBreadcrumbs: DrillDownState['breadcrumbs'] = []
        for (let i = 0; i < parts.length; i += 2) {
          if (parts[i] && parts[i + 1]) {
            const entityType = parts[i] as 'contractor' | 'region' | 'implementing_office' | 'status' | 'source_of_funds'
            const entityId = decodeURIComponent(parts[i + 1])
            
            // For contractors, find the name from the ID
            let entityName = entityId
            if (entityType === 'contractor') {
              const contract = contracts.find(c => c.contractor_id_1 === entityId)
              if (contract) {
                entityName = contract.contractor_name_1 || entityId
              }
            }
            
            newBreadcrumbs.push({ entityType, entityId, entityName })
          }
        }
        
        if (newBreadcrumbs.length > 0) {
          // Compare breadcrumbs to prevent loops
          const isDifferent = newBreadcrumbs.length !== drillDown.breadcrumbs.length ||
            newBreadcrumbs.some((bc, i) => 
              !drillDown.breadcrumbs[i] || 
              bc.entityType !== drillDown.breadcrumbs[i].entityType ||
              bc.entityId !== drillDown.breadcrumbs[i].entityId
            )
          
          if (!drillDown.open || isDifferent) {
            setDrillDown({ open: true, breadcrumbs: newBreadcrumbs })
          }
          
          // Set active tab from URL parameter
          if (tabParam && ['contracts', 'contractors', 'regions', 'offices', 'statuses', 'funds'].includes(tabParam)) {
            setDrillDownActiveTab(tabParam)
          } else if (!tabParam) {
            // No tab param means default to contracts
            setDrillDownActiveTab('contracts')
          }
        } else {
          // Just #analytics with no drill-down
          if (drillDown.open) {
            setDrillDown({ open: false, breadcrumbs: [] })
          }
        }
      } else if (hashPath === '#analytics') {
        // Just #analytics with no drill-down
        if (drillDown.open) {
          setDrillDown({ open: false, breadcrumbs: [] })
        }
      } else {
        // No hash or non-analytics hash - close drill-down if open
        if (drillDown.open) {
          setDrillDown({ open: false, breadcrumbs: [] })
        }
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('popstate', handleHashChange)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('popstate', handleHashChange)
    }
  }, [open, contracts]) // Removed drillDown dependencies to prevent loops
  
  // Get analytics data
  const { processedData, summaryStats, aggregates, loading } = useContractsAnalytics(
    contracts,
    filters,
    controls.dimension,
    controls.metric,
    controls.yearFilter
  )

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return processedData.slice(start, end)
  }, [processedData, currentPage])

  const totalPages = Math.ceil(processedData.length / pageSize)

  // Handle entity click for drill-down
  const handleEntityClick = useCallback((entityName: string) => {
    const entityTypeMap = {
      'by_contractor': 'contractor' as const,
      'by_region': 'region' as const,
      'by_implementing_office': 'implementing_office' as const,
      'by_status': 'status' as const,
    }
    const entityType = entityTypeMap[controls.dimension] || 'contractor'
    
    // For contractors, use contractor_id_1 instead of name
    let entityId = entityName
    if (entityType === 'contractor') {
      const contract = contracts.find(c => c.contractor_name_1 === entityName)
      if (contract?.contractor_id_1) {
        entityId = contract.contractor_id_1
      }
    }
    
    window.location.hash = `#analytics/${entityType}/${encodeURIComponent(entityId)}`
  }, [controls.dimension, contracts])

  // Get filtered contracts for drill-down (filter by all breadcrumbs)
  const drillDownContracts = useMemo(() => {
    if (!drillDown.open || drillDown.breadcrumbs.length === 0) return []
    
    return contracts.filter(contract => {
      // Must match ALL breadcrumb filters
      return drillDown.breadcrumbs.every(bc => {
        switch (bc.entityType) {
          case 'contractor':
            // Use contractor_id_1 for matching
            return contract.contractor_id_1 === bc.entityId
          case 'region':
            return contract.region === bc.entityId
          case 'implementing_office':
            return contract.implementing_office === bc.entityId
          case 'status':
            return contract.status === bc.entityId
          case 'source_of_funds':
            return contract.source_of_funds === bc.entityId
          default:
            return false
        }
      })
    })
  }, [contracts, drillDown.open, drillDown.breadcrumbs])  // Get related entities aggregates for drill-down
  const drillDownRelatedAggregates = useMemo(() => {
    if (!drillDown.open || drillDownContracts.length === 0) {
      return {
        by_contractor: [],
        by_region: [],
        by_implementing_office: [],
        by_status: [],
        by_source_of_funds: []
      }
    }

    const contractorMap = new Map<string, { total_value: number; count: number }>()
    const regionMap = new Map<string, { total_value: number; count: number }>()
    const officeMap = new Map<string, { total_value: number; count: number }>()
    const statusMap = new Map<string, { total_value: number; count: number }>()

    drillDownContracts.forEach(contract => {
      const cost = contract.cost_php || 0

      // Contractors
      ;[contract.contractor_name_1, contract.contractor_name_2, contract.contractor_name_3, contract.contractor_name_4]
        .filter(Boolean)
        .forEach(name => {
          const existing = contractorMap.get(name!) || { total_value: 0, count: 0 }
          contractorMap.set(name!, {
            total_value: existing.total_value + cost,
            count: existing.count + 1
          })
        })

      // Regions
      if (contract.region) {
        const existing = regionMap.get(contract.region) || { total_value: 0, count: 0 }
        regionMap.set(contract.region, {
          total_value: existing.total_value + cost,
          count: existing.count + 1
        })
      }

      // Offices
      if (contract.implementing_office) {
        const existing = officeMap.get(contract.implementing_office) || { total_value: 0, count: 0 }
        officeMap.set(contract.implementing_office, {
          total_value: existing.total_value + cost,
          count: existing.count + 1
        })
      }

      // Status
      if (contract.status) {
        const existing = statusMap.get(contract.status) || { total_value: 0, count: 0 }
        statusMap.set(contract.status, {
          total_value: existing.total_value + cost,
          count: existing.count + 1
        })
      }
    })

    return {
      by_contractor: Array.from(contractorMap.entries()).map(([name, data]) => ({
        name,
        ...data,
        avg_value: data.total_value / Math.max(1, data.count)
      })).sort((a, b) => b.total_value - a.total_value),
      by_region: Array.from(regionMap.entries()).map(([name, data]) => ({
        name,
        ...data,
        avg_value: data.total_value / Math.max(1, data.count)
      })).sort((a, b) => b.total_value - a.total_value),
      by_implementing_office: Array.from(officeMap.entries()).map(([name, data]) => ({
        name,
        ...data,
        avg_value: data.total_value / Math.max(1, data.count)
      })).sort((a, b) => b.total_value - a.total_value),
      by_status: Array.from(statusMap.entries()).map(([name, data]) => ({
        name,
        ...data,
        avg_value: data.total_value / Math.max(1, data.count)
      })).sort((a, b) => b.total_value - a.total_value),
      by_source_of_funds: Array.from(
        drillDownContracts.reduce((acc, contract) => {
          const fund = contract.source_of_funds || 'Unknown'
          const existing = acc.get(fund) || { total_value: 0, count: 0 }
          acc.set(fund, {
            total_value: existing.total_value + (contract.cost_php || 0),
            count: existing.count + 1
          })
          return acc
        }, new Map<string, { total_value: number; count: number }>())
      .entries()).map(([name, data]) => ({
        name,
        ...data,
        avg_value: data.total_value / Math.max(1, data.count)
      })).sort((a, b) => b.total_value - a.total_value)
    }
  }, [drillDown.open, drillDownContracts])

  // Drill-down pagination
  const [drillDownPage, setDrillDownPage] = useState(1)
  const drillDownPageSize = 20

  // Get drill-down aggregates by year
  const drillDownYearlyData = useMemo(() => {
    if (!drillDown.open || drillDownContracts.length === 0) return []
    
    const yearMap = new Map<number, { total_value: number; count: number }>()
    
    drillDownContracts.forEach(contract => {
      const year = contract.year
      if (!year) return
      
      const existing = yearMap.get(year) || { total_value: 0, count: 0 }
      yearMap.set(year, {
        total_value: existing.total_value + (contract.cost_php || 0),
        count: existing.count + 1
      })
    })
    
    return Array.from(yearMap.entries())
      .map(([year, data]) => ({
        year,
        total_value: data.total_value,
        count: data.count
      }))
      .sort((a, b) => a.year - b.year)
  }, [drillDown.open, drillDownContracts])

  // Paginated drill-down contracts with sorting
  const paginatedDrillDownContracts = useMemo(() => {
    // Apply sorting
    const sorted = [...drillDownContracts].sort((a, b) => {
      let aVal: any, bVal: any
      
      switch (contractsSortField) {
        case 'contract_id':
          aVal = String(a.contract_id || '').toLowerCase()
          bVal = String(b.contract_id || '').toLowerCase()
          return contractsSortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        case 'cost_php':
          aVal = a.cost_php || 0
          bVal = b.cost_php || 0
          return contractsSortDirection === 'asc' ? aVal - bVal : bVal - aVal
        case 'year':
          aVal = a.year || 0
          bVal = b.year || 0
          return contractsSortDirection === 'asc' ? aVal - bVal : bVal - aVal
        case 'status':
          aVal = String(a.status || '').toLowerCase()
          bVal = String(b.status || '').toLowerCase()
          return contractsSortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        default:
          return 0
      }
    })
    
    const start = (drillDownPage - 1) * drillDownPageSize
    const end = start + drillDownPageSize
    return sorted.slice(start, end)
  }, [drillDownContracts, drillDownPage, contractsSortField, contractsSortDirection])

  const drillDownTotalPages = Math.ceil(drillDownContracts.length / drillDownPageSize)

  // Reset drill-down page when breadcrumbs change (but preserve tab if in URL)
  React.useEffect(() => {
    setDrillDownPage(1)
    setEntityPage(1)
  }, [drillDown.breadcrumbs])

  // Determine visible tabs (hide all dimensions in the breadcrumb trail)
  const visibleTabs = useMemo((): DrillDownTab[] => {
    const allTabs: DrillDownTab[] = ['contracts', 'contractors', 'regions', 'offices', 'statuses', 'funds']
    const hiddenTabs = new Set<DrillDownTab>()
    
    drillDown.breadcrumbs.forEach(bc => {
      if (bc.entityType === 'contractor') hiddenTabs.add('contractors')
      else if (bc.entityType === 'region') hiddenTabs.add('regions')
      else if (bc.entityType === 'implementing_office') hiddenTabs.add('offices')
      else if (bc.entityType === 'status') hiddenTabs.add('statuses')
      else if (bc.entityType === 'source_of_funds') hiddenTabs.add('funds')
    })
    
    return allTabs.filter(tab => !hiddenTabs.has(tab))
  }, [drillDown.breadcrumbs])

  // Get entity data for current tab
  const currentEntityData = useMemo(() => {
    let data = []
    if (drillDownActiveTab === 'contractors') data = drillDownRelatedAggregates.by_contractor
    else if (drillDownActiveTab === 'regions') data = drillDownRelatedAggregates.by_region
    else if (drillDownActiveTab === 'offices') data = drillDownRelatedAggregates.by_implementing_office
    else if (drillDownActiveTab === 'statuses') data = drillDownRelatedAggregates.by_status
    else if (drillDownActiveTab === 'funds') data = drillDownRelatedAggregates.by_source_of_funds
    
    // Apply sorting
    const sorted = [...data].sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]
      
      if (sortField === 'name') {
        aVal = String(aVal || '').toLowerCase()
        bVal = String(bVal || '').toLowerCase()
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })
    
    return sorted
  }, [drillDownActiveTab, drillDownRelatedAggregates, sortField, sortDirection])

  // Paginated entity data
  const paginatedEntityData = useMemo(() => {
    const start = (entityPage - 1) * entityPageSize
    const end = start + entityPageSize
    return currentEntityData.slice(start, end)
  }, [currentEntityData, entityPage])

  const entityTotalPages = Math.ceil(currentEntityData.length / entityPageSize)

  // Get tab counts
  const getTabCount = (tab: DrillDownTab): number => {
    if (tab === 'contracts') return drillDownContracts.length
    if (tab === 'contractors') return drillDownRelatedAggregates.by_contractor.length
    if (tab === 'regions') return drillDownRelatedAggregates.by_region.length
    if (tab === 'offices') return drillDownRelatedAggregates.by_implementing_office.length
    if (tab === 'statuses') return drillDownRelatedAggregates.by_status.length
    if (tab === 'funds') return drillDownRelatedAggregates.by_source_of_funds.length
    return 0
  }

  // Get display name for tabs
  const getTabDisplayName = (tab: DrillDownTab): string => {
    if (tab === 'funds') return 'Source of Funds'
    return tab.charAt(0).toUpperCase() + tab.slice(1)
  }

  // CSV Export handlers
  const exportEntitiesCSV = useCallback((entities: any[], dimension: string) => {
    const csvRows = [['Rank', 'Name', 'Total Value (PHP)', 'Contract Count', 'Average Value (PHP)']]
    entities.forEach((entity, index) => {
      csvRows.push([
        String(index + 1),
        entity.name || 'Unknown',
        String(entity.total_value || 0),
        String(entity.count || 0),
        String(entity.avg_value || 0)
      ])
    })
    const csvContent = csvRows.map(row => row.map(cell => {
      const escaped = String(cell).replace(/"/g, '""')
      return escaped.includes(',') || escaped.includes('\n') ? `"${escaped}"` : escaped
    }).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics_${dimension}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  const exportDrillDownContracts = useCallback(() => {
    const filename = `contracts_${drillDown.breadcrumbs.map(bc => bc.entityName).join('_')}_${new Date().toISOString().slice(0, 10)}.csv`
    downloadContractsCSV(drillDownContracts, filename)
  }, [drillDownContracts, drillDown.breadcrumbs])

  const exportCurrentEntityData = useCallback(() => {
    const dimension = drillDownActiveTab === 'contractors' ? 'contractors'
      : drillDownActiveTab === 'regions' ? 'regions'
      : drillDownActiveTab === 'offices' ? 'offices'
      : drillDownActiveTab === 'statuses' ? 'statuses'
      : drillDownActiveTab === 'funds' ? 'funds'
      : 'entities'
    exportEntitiesCSV(currentEntityData, dimension)
  }, [currentEntityData, drillDownActiveTab, exportEntitiesCSV])

  const getRank = (index: number) => {
    return (currentPage - 1) * pageSize + index + 1
  }

  const getValueLabel = () => {
    switch (controls.metric) {
      case 'amount': return 'Total Value'
      case 'count': return 'Contract Count'
      case 'avg': return 'Average Value'
      default: return 'Value'
    }
  }

  const getValue = (item: any) => {
    switch (controls.metric) {
      case 'amount': return formatCurrency(item.total_value)
      case 'count': return item.count.toLocaleString()
      case 'avg': return formatCurrency(item.avg_value || (item.total_value / Math.max(1, item.count)))
      default: return formatCurrency(item.total_value)
    }
  }

  if (!open) {
    console.log('📊 [ContractsAnalyticsModal] Not rendering - open is false')
    return null
  }

  console.log('📊 [ContractsAnalyticsModal] Rendering modal content')

  return (
    <>
      <Modal
        open={open && !drillDown.open}
        onClose={() => {
          // Clear hash - this will trigger parent's hashchange to close modal
          window.location.hash = ''
        }}
        title="📊 Analytics Overview"
        size="xlarge"
        isDark={isDark ?? themeDark}
      >
        <div style={{ padding: spacing[6] }}>
          {/* Summary Stats */}
          <Card $isDark={isDark ?? themeDark} style={{ marginBottom: spacing[6], padding: spacing[4] }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing[4] 
            }}>
              <div>
                <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm, opacity: 0.7 }}>
                  Total Contracts
                </BodyText>
                <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.xl, fontWeight: 700 }}>
                  {summaryStats.totalContracts.toLocaleString()}
                </BodyText>
              </div>
              <div>
                <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm, opacity: 0.7 }}>
                  Total Value
                </BodyText>
                <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.xl, fontWeight: 700 }}>
                  {formatCurrency(summaryStats.totalValue)}
                </BodyText>
              </div>
              <div>
                <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm, opacity: 0.7 }}>
                  Average Value
                </BodyText>
                <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.xl, fontWeight: 700 }}>
                  {formatCurrency(summaryStats.averageValue)}
                </BodyText>
              </div>
            </div>
          </Card>

          {/* Controls */}
          <Card $isDark={isDark ?? themeDark} style={{ marginBottom: spacing[6], padding: spacing[4] }}>
            <div style={{ display: 'flex', gap: spacing[4], flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Dimension */}
              <div>
                <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm, marginBottom: spacing[2], fontWeight: 600 }}>
                  View By:
                </BodyText>
                <select
                  value={controls.dimension}
                  onChange={(e) => {
                    controls.setDimension(e.target.value as any)
                    setCurrentPage(1)
                  }}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    borderRadius: '6px',
                    border: `1px solid ${vars.border}`,
                    backgroundColor: vars.card,
                    color: vars.text,
                    fontSize: typography.fontSize.sm,
                    cursor: 'pointer'
                  }}
                >
                  <option value="by_contractor">Contractor</option>
                  <option value="by_region">Region</option>
                  <option value="by_implementing_office">Implementing Office</option>
                  <option value="by_status">Status</option>
                </select>
              </div>

              {/* Metric */}
              <div>
                <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm, marginBottom: spacing[2], fontWeight: 600 }}>
                  Metric:
                </BodyText>
                <select
                  value={controls.metric}
                  onChange={(e) => {
                    controls.setMetric(e.target.value as any)
                    setCurrentPage(1)
                  }}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    borderRadius: '6px',
                    border: `1px solid ${vars.border}`,
                    backgroundColor: vars.card,
                    color: vars.text,
                    fontSize: typography.fontSize.sm,
                    cursor: 'pointer'
                  }}
                >
                  <option value="amount">Total Amount</option>
                  <option value="count">Contract Count</option>
                  <option value="avg">Average Amount</option>
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm, marginBottom: spacing[2], fontWeight: 600 }}>
                  Year:
                </BodyText>
                <select
                  value={controls.yearFilter}
                  onChange={(e) => {
                    controls.setYearFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
                    setCurrentPage(1)
                  }}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    borderRadius: '6px',
                    border: `1px solid ${vars.border}`,
                    backgroundColor: vars.card,
                    color: vars.text,
                    fontSize: typography.fontSize.sm,
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Years</option>
                  {aggregates?.by_year.map(yearData => (
                    <option key={yearData.year} value={yearData.year}>
                      {yearData.year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card $isDark={isDark ?? themeDark} style={{ padding: spacing[4] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
              <div>
                <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.lg, fontWeight: 600 }}>
                  Top {controls.dimension.replace('by_', '').replace('_', ' ')} (Page {currentPage} of {totalPages})
                </BodyText>
                <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm, color: vars.textSecondary, marginTop: spacing[1] }}>
                  Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, processedData.length)} of {processedData.length}
                </BodyText>
              </div>
              <button
                onClick={() => exportEntitiesCSV(processedData, controls.dimension)}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--color-primary-600)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2]
                }}
              >
                📥 Export CSV
              </button>
            </div>
            
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: spacing[8] }}>
                <LoadingSpinner size="large" />
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${vars.border}` }}>
                        <th style={{ padding: spacing[3], textAlign: 'center', color: vars.textSecondary, fontSize: typography.fontSize.sm, width: '60px' }}>
                          Rank
                        </th>
                        <th style={{ padding: spacing[3], textAlign: 'left', color: vars.textSecondary, fontSize: typography.fontSize.sm }}>
                          Entity
                        </th>
                        <th style={{ padding: spacing[3], textAlign: 'right', color: vars.textSecondary, fontSize: typography.fontSize.sm }}>
                          {getValueLabel()}
                        </th>
                        <th style={{ padding: spacing[3], textAlign: 'right', color: vars.textSecondary, fontSize: typography.fontSize.sm }}>
                          Count
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((entity, index) => (
                        <tr 
                          key={index} 
                          style={{ 
                            borderBottom: `1px solid ${vars.border}`,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onClick={() => handleEntityClick(entity.name)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = vars.backgroundSecondary
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <td style={{ padding: spacing[3], textAlign: 'center', fontSize: typography.fontSize.sm, color: vars.text }}>
                            #{getRank(index)}
                          </td>
                          <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEntityClick(entity.name)
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: isDark ?? themeDark ? '#60a5fa' : '#2563eb',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: 'inherit',
                                fontFamily: 'inherit',
                                textAlign: 'left',
                                maxWidth: '400px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = isDark ?? themeDark ? '#93c5fd' : '#1d4ed8'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = isDark ?? themeDark ? '#60a5fa' : '#2563eb'
                              }}
                              title={entity.name}
                            >
                              {entity.name}
                            </button>
                          </td>
                          <td style={{ padding: spacing[3], textAlign: 'right', fontSize: typography.fontSize.sm, color: vars.text }}>
                            {getValue(entity)}
                          </td>
                          <td style={{ padding: spacing[3], textAlign: 'right', fontSize: typography.fontSize.sm, color: vars.text }}>
                            {entity.count.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: spacing[2], 
                    marginTop: spacing[4],
                    padding: spacing[3]
                  }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: `${spacing[2]} ${spacing[4]}`,
                        borderRadius: '6px',
                        border: `1px solid ${vars.border}`,
                        backgroundColor: currentPage === 1 ? vars.backgroundSecondary : vars.card,
                        color: currentPage === 1 ? vars.textSecondary : vars.text,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: typography.fontSize.sm,
                        fontWeight: 600
                      }}
                    >
                      Previous
                    </button>
                    
                    <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm }}>
                      Page {currentPage} of {totalPages}
                    </BodyText>
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: `${spacing[2]} ${spacing[4]}`,
                        borderRadius: '6px',
                        border: `1px solid ${vars.border}`,
                        backgroundColor: currentPage === totalPages ? vars.backgroundSecondary : vars.card,
                        color: currentPage === totalPages ? vars.textSecondary : vars.text,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: typography.fontSize.sm,
                        fontWeight: 600
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </Modal>

      {/* Drill-Down Modal */}
      {drillDown.open && (
        <Modal
          open={drillDown.open}
          onClose={() => {
            // Clear hash - this will trigger parent's hashchange to close all modals
            window.location.hash = ''
          }}
          title={
            <div>
              <div style={{ fontSize: typography.fontSize.xl, fontWeight: 700, marginBottom: spacing[2] }}>
                📊 {drillDown.breadcrumbs.map(bc => bc.entityName).join(' → ')} - {getTabDisplayName(drillDownActiveTab)} View
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                gap: spacing[2],
                fontSize: typography.fontSize.sm,
                opacity: 0.8
              }}>
                {drillDown.breadcrumbs.map((bc, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <span style={{ fontWeight: 500 }}>→</span>
                    )}
                    <button
                      onClick={() => {
                        // Navigate to this breadcrumb level, preserving tab parameter
                        const newBreadcrumbs = drillDown.breadcrumbs.slice(0, index + 1)
                        const newHash = '#analytics/' + newBreadcrumbs.map(b => `${b.entityType}/${encodeURIComponent(b.entityId)}`).join('/')
                        navigateWithTab(newHash)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        fontWeight: index === drillDown.breadcrumbs.length - 1 ? 700 : 500,
                        cursor: index === drillDown.breadcrumbs.length - 1 ? 'default' : 'pointer',
                        textDecoration: 'none',
                        padding: `${spacing[1]} ${spacing[2]}`,
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                        fontSize: 'inherit'
                      }}
                      onMouseEnter={(e) => {
                        if (index !== drillDown.breadcrumbs.length - 1) {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
                          e.currentTarget.style.textDecoration = 'underline'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.textDecoration = 'none'
                      }}
                      disabled={index === drillDown.breadcrumbs.length - 1}
                    >
                      {bc.entityName}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          }
          size="xlarge"
          isDark={isDark ?? themeDark}
          zIndex={10001}
        >
          <div style={{ padding: spacing[6], maxHeight: '75vh', overflowY: 'auto' }}>
            {/* Drill-down Summary */}
            <Card $isDark={isDark ?? themeDark} style={{ marginBottom: spacing[6], padding: spacing[4] }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: spacing[4] 
              }}>
                <div>
                  <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm, opacity: 0.7 }}>
                    Total Contracts
                  </BodyText>
                  <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.xl, fontWeight: 700 }}>
                    {drillDownContracts.length.toLocaleString()}
                  </BodyText>
                </div>
                <div>
                  <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm, opacity: 0.7 }}>
                    Total Value
                  </BodyText>
                  <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.xl, fontWeight: 700 }}>
                    {formatCurrency(drillDownContracts.reduce((sum, c) => sum + (c.cost_php || 0), 0))}
                  </BodyText>
                </div>
                <div>
                  <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm, opacity: 0.7 }}>
                    Average Value
                  </BodyText>
                  <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.xl, fontWeight: 700 }}>
                    {formatCurrency(drillDownContracts.reduce((sum, c) => sum + (c.cost_php || 0), 0) / Math.max(1, drillDownContracts.length))}
                  </BodyText>
                </div>
              </div>
            </Card>

            {/* Yearly Trends Chart removed from view */}

            {/* Tabs */}
            <div style={{ 
              display: 'flex', 
              gap: spacing[2], 
              borderBottom: `2px solid var(--color-border-light)`, 
              marginBottom: spacing[4] 
            }}>
              {visibleTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setDrillDownActiveTab(tab)
                    setEntityPage(1)
                    if (tab !== 'contracts') setDrillDownPage(1)
                    
                    // Update hash query parameter to persist tab selection (no page reload)
                    // Format: #analytics/path?tab=tabname
                    const currentHash = window.location.hash
                    const [hashPath] = currentHash.split('?')
                    const newHash = tab !== 'contracts' ? `${hashPath}?tab=${tab}` : hashPath
                    window.location.hash = newHash
                  }}
                  style={{
                    padding: `${spacing[2]} ${spacing[4]}`,
                    border: 'none',
                    borderBottom: `3px solid ${drillDownActiveTab === tab ? 'var(--color-primary-500)' : 'transparent'}`,
                    background: 'none',
                    color: drillDownActiveTab === tab ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: typography.fontSize.sm,
                    fontWeight: drillDownActiveTab === tab ? 700 : 400,
                    transition: 'all 0.2s'
                  }}
                >
                  {getTabDisplayName(tab)} ({getTabCount(tab).toLocaleString()})
                </button>
              ))}
            </div>

            {/* Contracts Tab */}
            {drillDownActiveTab === 'contracts' && (
              <Card $isDark={isDark ?? themeDark} style={{ padding: spacing[4] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
                  <div>
                    <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.lg, fontWeight: 600 }}>
                      {getTabDisplayName(drillDownActiveTab)} View (Page {drillDownPage} of {drillDownTotalPages})
                    </BodyText>
                    <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm, color: 'var(--color-text-secondary)', marginTop: spacing[1] }}>
                      Showing {((drillDownPage - 1) * drillDownPageSize) + 1}-{Math.min(drillDownPage * drillDownPageSize, drillDownContracts.length)} of {drillDownContracts.length}
                    </BodyText>
                  </div>
                  <button
                    onClick={exportDrillDownContracts}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'var(--color-primary-600)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: typography.fontSize.sm,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2]
                    }}
                  >
                    📥 Export All Contracts CSV
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid var(--color-border-light)` }}>
                        <th style={{ padding: spacing[3], textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: typography.fontSize.sm, width: '40px' }}></th>
                        <th 
                          style={{ padding: spacing[3], textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: typography.fontSize.sm, cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => {
                            if (contractsSortField === 'contract_id') {
                              setContractsSortDirection(contractsSortDirection === 'asc' ? 'desc' : 'asc')
                            } else {
                              setContractsSortField('contract_id')
                              setContractsSortDirection('asc')
                            }
                          }}
                        >
                          Contract ID {contractsSortField === 'contract_id' && (contractsSortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{ padding: spacing[3], textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: typography.fontSize.sm }}>
                          Description
                        </th>
                        <th 
                          style={{ padding: spacing[3], textAlign: 'right', color: 'var(--color-text-secondary)', fontSize: typography.fontSize.sm, cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => {
                            if (contractsSortField === 'cost_php') {
                              setContractsSortDirection(contractsSortDirection === 'asc' ? 'desc' : 'asc')
                            } else {
                              setContractsSortField('cost_php')
                              setContractsSortDirection('desc')
                            }
                          }}
                        >
                          Cost {contractsSortField === 'cost_php' && (contractsSortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          style={{ padding: spacing[3], textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: typography.fontSize.sm, cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => {
                            if (contractsSortField === 'status') {
                              setContractsSortDirection(contractsSortDirection === 'asc' ? 'desc' : 'asc')
                            } else {
                              setContractsSortField('status')
                              setContractsSortDirection('asc')
                            }
                          }}
                        >
                          Status {contractsSortField === 'status' && (contractsSortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          style={{ padding: spacing[3], textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: typography.fontSize.sm, cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => {
                            if (contractsSortField === 'year') {
                              setContractsSortDirection(contractsSortDirection === 'asc' ? 'desc' : 'asc')
                            } else {
                              setContractsSortField('year')
                              setContractsSortDirection('desc')
                            }
                          }}
                        >
                          Year {contractsSortField === 'year' && (contractsSortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDrillDownContracts.map((contract, index) => (
                        <tr 
                          key={index}
                          style={{ 
                            borderBottom: `1px solid var(--color-border-light)`,
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <td style={{ padding: spacing[3], textAlign: 'center' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const currentHash = window.location.hash
                                const baseHash = currentHash.split('/').slice(0, 3).join('/')
                                const contractId = contract.year && contract.contract_id ? `${contract.year}-${contract.contract_id}` : contract.contract_id
                                window.location.hash = `${baseHash}/contract/${contractId}`
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                opacity: 0.7,
                                transition: 'opacity 0.2s',
                                padding: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '1'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '0.7'
                              }}
                              title="View contract details"
                            >
                              🔍
                            </button>
                          </td>
                          <td 
                            style={{ padding: spacing[3], fontSize: typography.fontSize.sm, color: 'var(--color-text-primary)', cursor: 'pointer' }}
                            onClick={() => {
                              const currentHash = window.location.hash
                              const baseHash = currentHash.split('/').slice(0, 3).join('/')
                              const contractId = contract.year && contract.contract_id ? `${contract.year}-${contract.contract_id}` : contract.contract_id
                              window.location.hash = `${baseHash}/contract/${contractId}`
                            }}
                          >
                            {contract.contract_id || 'N/A'}
                        </td>
                        <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm, color: 'var(--color-text-primary)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {contract.description || 'N/A'}
                        </td>
                        <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm, color: 'var(--color-text-primary)', textAlign: 'right', fontFamily: 'monospace' }}>
                          {formatCurrency(contract.cost_php || 0)}
                        </td>
                        <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm, textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: contract.status === 'Completed' ? '#10b981' : contract.status === 'On-Going' ? '#3b82f6' : '#6b7280',
                            color: '#ffffff'
                          }}>
                            {contract.status || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm, color: 'var(--color-text-primary)', textAlign: 'center' }}>
                          {contract.year || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {drillDownTotalPages > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: spacing[2], 
                  marginTop: spacing[4],
                  padding: spacing[3]
                }}>
                  <button
                    onClick={() => setDrillDownPage(p => Math.max(1, p - 1))}
                    disabled={drillDownPage === 1}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      borderRadius: '6px',
                      border: `1px solid var(--color-border-light)`,
                      backgroundColor: drillDownPage === 1 ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
                      color: drillDownPage === 1 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                      cursor: drillDownPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: typography.fontSize.sm,
                      fontWeight: 600
                    }}
                  >
                    Previous
                  </button>
                  
                  <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm }}>
                    Page {drillDownPage} of {drillDownTotalPages}
                  </BodyText>
                  
                  <button
                    onClick={() => setDrillDownPage(p => Math.min(drillDownTotalPages, p + 1))}
                    disabled={drillDownPage === drillDownTotalPages}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      borderRadius: '6px',
                      border: `1px solid var(--color-border-light)`,
                      backgroundColor: drillDownPage === drillDownTotalPages ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
                      color: drillDownPage === drillDownTotalPages ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                      cursor: drillDownPage === drillDownTotalPages ? 'not-allowed' : 'pointer',
                      fontSize: typography.fontSize.sm,
                      fontWeight: 600
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </Card>
            )}

            {/* Entity Tables (Contractors, Regions, Offices, Statuses) */}
            {drillDownActiveTab !== 'contracts' && (
              <Card $isDark={isDark ?? themeDark} style={{ padding: spacing[4] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
                  <div>
                    <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.lg, fontWeight: 600 }}>
                      {getTabDisplayName(drillDownActiveTab)} (Page {entityPage} of {entityTotalPages})
                    </BodyText>
                    <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm, color: 'var(--color-text-secondary)', marginTop: spacing[1] }}>
                      Showing {((entityPage - 1) * entityPageSize) + 1}-{Math.min(entityPage * entityPageSize, currentEntityData.length)} of {currentEntityData.length}
                    </BodyText>
                  </div>
                  <button
                    onClick={exportCurrentEntityData}
                    style={{
                      padding: `${spacing[2]} ${spacing[4]}`,
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'var(--color-primary-600)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: typography.fontSize.sm,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2]
                    }}
                  >
                    📥 Export CSV
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid var(--color-border-light)` }}>
                        {/* Rank column removed for entity data tabs */}
                        <th 
                          style={{ padding: spacing[3], textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: typography.fontSize.sm, cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => {
                            if (sortField === 'name') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortField('name')
                              setSortDirection('asc')
                            }
                            setEntityPage(1)
                          }}
                        >
                          Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          style={{ padding: spacing[3], textAlign: 'right', color: 'var(--color-text-secondary)', fontSize: typography.fontSize.sm, cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => {
                            if (sortField === 'total_value') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortField('total_value')
                              setSortDirection('desc')
                            }
                            setEntityPage(1)
                          }}
                        >
                          Total Value {sortField === 'total_value' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          style={{ padding: spacing[3], textAlign: 'right', color: 'var(--color-text-secondary)', fontSize: typography.fontSize.sm, cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => {
                            if (sortField === 'count') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortField('count')
                              setSortDirection('desc')
                            }
                            setEntityPage(1)
                          }}
                        >
                          Count {sortField === 'count' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          style={{ padding: spacing[3], textAlign: 'right', color: 'var(--color-text-secondary)', fontSize: typography.fontSize.sm, cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => {
                            if (sortField === 'avg_value') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                            } else {
                              setSortField('avg_value')
                              setSortDirection('desc')
                            }
                            setEntityPage(1)
                          }}
                        >
                          Avg Value {sortField === 'avg_value' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEntityData.map((entity, index) => (
                        <tr 
                          key={index}
                          style={{ 
                            borderBottom: `1px solid var(--color-border-light)`,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onClick={() => {
                            // Append to breadcrumb trail (explicitly set contracts tab)
                            const entityTypeMap = {
                              'contractors': 'contractor',
                              'regions': 'region',
                              'offices': 'implementing_office',
                              'statuses': 'status',
                              'funds': 'source_of_funds'
                            }
                            const newEntityType = entityTypeMap[drillDownActiveTab as keyof typeof entityTypeMap]
                            if (newEntityType && entity.name) {
                              // For contractors, we need to find the contractor_id_1
                              let entityId = entity.name
                              if (newEntityType === 'contractor') {
                                const contract = drillDownContracts.find(c => c.contractor_name_1 === entity.name)
                                if (contract?.contractor_id_1) {
                                  entityId = contract.contractor_id_1
                                }
                              }
                              const currentPath = drillDown.breadcrumbs.map(bc => `${bc.entityType}/${encodeURIComponent(bc.entityId)}`).join('/')
                              // Navigate with explicit contracts tab
                              window.location.hash = `#analytics/${currentPath}/${newEntityType}/${encodeURIComponent(entityId)}?tab=contracts`
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          {/* Rank column removed for entity data tabs */}
                          <td style={{ display: 'none' }}></td>
                          <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const entityTypeMap = {
                                  'contractors': 'contractor',
                                  'regions': 'region',
                                  'offices': 'implementing_office',
                                  'statuses': 'status',
                                  'funds': 'source_of_funds'
                                }
                                const newEntityType = entityTypeMap[drillDownActiveTab as keyof typeof entityTypeMap]
                                if (newEntityType && entity.name) {
                                  // For contractors, we need to find the contractor_id_1
                                  let entityId = entity.name
                                  if (newEntityType === 'contractor') {
                                    const contract = drillDownContracts.find(c => c.contractor_name_1 === entity.name)
                                    if (contract?.contractor_id_1) {
                                      entityId = contract.contractor_id_1
                                    }
                                  }
                                  
                                  const currentPath = drillDown.breadcrumbs.map(bc => `${bc.entityType}/${encodeURIComponent(bc.entityId)}`).join('/')
                                  // Navigate with explicit contracts tab
                                  window.location.hash = `#analytics/${currentPath}/${newEntityType}/${encodeURIComponent(entityId)}?tab=contracts`
                                }
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: isDark ?? themeDark ? '#60a5fa' : '#2563eb',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: 'inherit',
                                fontFamily: 'inherit',
                                textAlign: 'left',
                                maxWidth: '400px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = isDark ?? themeDark ? '#93c5fd' : '#1d4ed8'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = isDark ?? themeDark ? '#60a5fa' : '#2563eb'
                              }}
                              title={entity.name}
                            >
                              {entity.name}
                            </button>
                          </td>
                          <td style={{ padding: spacing[3], textAlign: 'right', fontSize: typography.fontSize.sm, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                            {formatCurrency(entity.total_value)}
                          </td>
                          <td style={{ padding: spacing[3], textAlign: 'right', fontSize: typography.fontSize.sm, color: 'var(--color-text-primary)' }}>
                            {entity.count.toLocaleString()}
                          </td>
                          <td style={{ padding: spacing[3], textAlign: 'right', fontSize: typography.fontSize.sm, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                            {formatCurrency(entity.avg_value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Entity Pagination */}
                {entityTotalPages > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: spacing[2], 
                    marginTop: spacing[4],
                    padding: spacing[3]
                  }}>
                    <button
                      onClick={() => setEntityPage(p => Math.max(1, p - 1))}
                      disabled={entityPage === 1}
                      style={{
                        padding: `${spacing[2]} ${spacing[4]}`,
                        borderRadius: '6px',
                        border: `1px solid var(--color-border-light)`,
                        backgroundColor: entityPage === 1 ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
                        color: entityPage === 1 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                        cursor: entityPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: typography.fontSize.sm,
                        fontWeight: 600
                      }}
                    >
                      Previous
                    </button>
                    
                    <BodyText $isDark={isDark ?? themeDark} style={{ fontSize: typography.fontSize.sm }}>
                      Page {entityPage} of {entityTotalPages}
                    </BodyText>
                    
                    <button
                      onClick={() => setEntityPage(p => Math.min(entityTotalPages, p + 1))}
                      disabled={entityPage === entityTotalPages}
                      style={{
                        padding: `${spacing[2]} ${spacing[4]}`,
                        borderRadius: '6px',
                        border: `1px solid var(--color-border-light)`,
                        backgroundColor: entityPage === entityTotalPages ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
                        color: entityPage === entityTotalPages ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                        cursor: entityPage === entityTotalPages ? 'not-allowed' : 'pointer',
                        fontSize: typography.fontSize.sm,
                        fontWeight: 600
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </Card>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
