import React, { useState, useEffect, useMemo } from 'react'
import { getThemeVars } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import { advancedSearchService } from '../../../services/AdvancedSearchService'
import { ContractsTable } from '../shared/ContractsTable'
import { EntitiesTable } from '../shared/EntitiesTable'
import { ExportCSVModal } from '../shared/ExportCSVModal'
import { AccessibleButton } from '../shared/AccessibleButton'
import { useUnifiedExport } from '../../../hooks/useUnifiedExport'
import { createEntityDrillDownContractsConfig, createEntityDrillDownAggregatesConfig } from '../../../hooks/useUnifiedExportConfigs'
import { QuarterlyTrendsChart } from '../../charts/QuarterlyTrendsChart'

export interface SearchResult {
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

interface EntityDrillDownModalProps {
  open: boolean
  onClose: () => void
  entityName: string
  entityType: 'contractor' | 'organization' | 'area' | 'category'
  currentFilters: {
    contractors: string[]
    areas: string[]
    organizations: string[]
    businessCategories: string[]
    keywords: string[]
    time_ranges: any[]
    includeFloodControl?: boolean
  }
  isDark?: boolean
}

const EntityDrillDownModal: React.FC<EntityDrillDownModalProps> = ({
  open,
  onClose,
  entityName,
  entityType,
  currentFilters,
  isDark = false
}) => {
  const vars = getThemeVars(isDark)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  })
  const [sortConfig, setSortConfig] = useState({
    key: 'contract_amount' as keyof SearchResult,
    direction: 'desc' as 'asc' | 'desc'
  })

  // Drill-down tabs: contracts + related entities
  type DrillTab = 'contracts' | 'contractors' | 'organizations' | 'areas' | 'categories'
  const allTabs: DrillTab[] = ['contracts', 'contractors', 'organizations', 'areas', 'categories']
  const visibleTabs: DrillTab[] = useMemo(() => {
    // Hide the tab corresponding to the selected entityType except for contracts
    const hide: DrillTab | null = entityType === 'contractor' ? 'contractors'
      : entityType === 'organization' ? 'organizations'
      : entityType === 'area' ? 'areas'
      : 'categories'
    return allTabs.filter(t => t === 'contracts' || t !== hide)
  }, [entityType])
  const [activeTab, setActiveTab] = useState<DrillTab>('contracts')

  // State for trend chart data (all filtered contracts, not just paginated)
  const [trendData, setTrendData] = useState<SearchResult[]>([])
  const [trendDataLoading, setTrendDataLoading] = useState(false)

  // Fetch aggregated data for trend chart using chip-aggregates endpoint
  const fetchAllContractsForTrends = async () => {
    if (!open) return

    setTrendDataLoading(true)
    try {
      // Create filters for the specific entity
      const entityFilters = {
        ...currentFilters,
        [entityType === 'contractor' ? 'contractors' : 
         entityType === 'organization' ? 'organizations' :
         entityType === 'area' ? 'areas' : 'businessCategories']: [entityName]
      }

      const searchParams = {
        ...entityFilters,
        topN: 20,
        includeFloodControl: currentFilters.includeFloodControl || false
      }

      const response = await advancedSearchService.chipAggregates(searchParams)
      
      if (response.data) {
        // Convert aggregated data to trend format
        const trendData = []
        
        // Add yearly data
        if (response.data.by_year) {
          response.data.by_year.forEach((item: any) => {
            trendData.push({
              award_date: `${item.year}-01-01`,
              contract_amount: item.total_value.toString(),
              count: item.count
            })
          })
        }
        
        // Add monthly data
        if (response.data.by_month) {
          response.data.by_month.forEach((item: any) => {
            trendData.push({
              award_date: `${item.month}-01`,
              contract_amount: item.total_value.toString(),
              count: item.count
            })
          })
        }
        
        setTrendData(trendData)
      }
    } catch (error) {
      console.error('Error fetching aggregated data for trends:', error)
    } finally {
      setTrendDataLoading(false)
    }
  }

  // Process contract data for trend charts using all filtered data
  const processContractDataForTrends = useMemo(() => {
    if (!trendData || trendData.length === 0) {
      return { quarterlyData: [], yearlyData: [] }
    }

    // Group contracts by year and quarter
    const quarterlyMap = new Map<string, { year: number, quarter: number, total_value: number, contract_count: number }>()
    const yearlyMap = new Map<number, { year: number, total_value: number, contract_count: number }>()

    let validContracts = 0
    let invalidDates = 0
    let missingAmounts = 0

    trendData.forEach(contract => {
      // Convert contract_amount to number
      const amount = parseFloat(contract.contract_amount)
      if (!amount || isNaN(amount)) {
        missingAmounts++
        return
      }

      if (!contract.award_date) {
        invalidDates++
        return
      }

      try {
        const date = new Date(contract.award_date)
        if (isNaN(date.getTime())) {
          invalidDates++
          return
        }

        validContracts++
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const quarter = month <= 3 ? 1 : month <= 6 ? 2 : month <= 9 ? 3 : 4

        // Quarterly data
        const quarterlyKey = `${year}-${quarter}`
        if (quarterlyMap.has(quarterlyKey)) {
          const existing = quarterlyMap.get(quarterlyKey)!
          existing.total_value += amount
          existing.contract_count += 1
        } else {
          quarterlyMap.set(quarterlyKey, {
            year,
            quarter,
            total_value: amount,
            contract_count: 1
          })
        }

        // Yearly data
        if (yearlyMap.has(year)) {
          const existing = yearlyMap.get(year)!
          existing.total_value += amount
          existing.contract_count += 1
        } else {
          yearlyMap.set(year, {
            year,
            total_value: amount,
            contract_count: 1
          })
        }
      } catch (error) {
        invalidDates++
      }
    })


    return {
      quarterlyData: Array.from(quarterlyMap.values()),
      yearlyData: Array.from(yearlyMap.values())
    }
  }, [trendData])

  // Aggregates for related entities (scoped by the chosen entity)
  const [relatedAggregates, setRelatedAggregates] = useState<null | {
    by_contractor?: Array<{ label: string; total_value: number; count: number }>
    by_organization?: Array<{ label: string; total_value: number; count: number }>
    by_area?: Array<{ label: string; total_value: number; count: number }>
    by_category?: Array<{ label: string; total_value: number; count: number }>
  }>(null)
  const [aggLoading, setAggLoading] = useState(false)
  
  // Pagination for related entities
  const [entityPageSize, setEntityPageSize] = useState(50)
  const [entityPageIndex, setEntityPageIndex] = useState(0)
  const [entitySortBy, setEntitySortBy] = useState('total_contract_value')
  const [entitySortDirection, setEntitySortDirection] = useState<'asc' | 'desc'>('desc')
  const [entityTotalCounts, setEntityTotalCounts] = useState<{
    contractors: number
    organizations: number
    areas: number
    categories: number
  }>({
    contractors: 0,
    organizations: 0,
    areas: 0,
    categories: 0
  })

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

  const handleSort = (key: keyof SearchResult) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const getSortIcon = (key: keyof SearchResult) => {
    if (sortConfig.key !== key) return '↕️'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const fetchContracts = async (page: number = 1) => {
    if (!open) return

    setLoading(true)
    try {
      // Create filters for the specific entity
      const entityFilters = {
        ...currentFilters,
        [entityType === 'contractor' ? 'contractors' : 
         entityType === 'organization' ? 'organizations' :
         entityType === 'area' ? 'areas' : 'businessCategories']: [entityName]
      }

      const searchParams = {
        ...entityFilters,
        page,
        pageSize: pagination.pageSize,
        sortBy: sortConfig.key,
        sortDirection: sortConfig.direction,
        includeFloodControl: currentFilters.includeFloodControl || false
      }

      const response = await advancedSearchService.searchContractsWithChips(searchParams)
      
      console.log('API Response for contracts:', response)
      console.log('Sample contract from API:', response.data?.[0])
      
      if (response.data) {
        setResults(response.data || [])
        setPagination({
          page: response.pagination?.page || 1,
          pageSize: response.pagination?.page_size || 20,
          totalCount: response.pagination?.total_count || 0,
          totalPages: response.pagination?.total_pages || 0
        })
      }
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedAggregates = async (pageIndex: number = 0, pageSize: number = 50, sortBy: string = 'total_contract_value', sortDirection: 'asc' | 'desc' = 'desc') => {
    if (!open) return
    setAggLoading(true)
    try {
      const entityFilters = {
        ...currentFilters,
        [entityType === 'contractor' ? 'contractors' : 
         entityType === 'organization' ? 'organizations' :
         entityType === 'area' ? 'areas' : 'businessCategories']: [entityName]
      }
      
      // First, get total counts with a very large topN to get accurate totals
      const totalCountParams = {
        contractors: entityFilters.contractors || [],
        areas: entityFilters.areas || [],
        organizations: entityFilters.organizations || [],
        businessCategories: entityFilters.businessCategories || [],
        keywords: entityFilters.keywords || [],
        timeRanges: entityFilters.time_ranges || [],
        topN: 999999, // Very large number to get all counts
        includeFloodControl: currentFilters.includeFloodControl || false
      }
      
      const totalRes = await advancedSearchService.chipAggregates(totalCountParams as any)
      if (totalRes?.data) {
        const totalData = totalRes.data
        setEntityTotalCounts({
          contractors: (totalData?.by_contractor || []).length,
          organizations: (totalData?.by_organization || []).length,
          areas: (totalData?.by_area || []).length,
          categories: (totalData?.by_category || []).length
        })
      }
      
      // Then get paginated data
      const params = {
        contractors: entityFilters.contractors || [],
        areas: entityFilters.areas || [],
        organizations: entityFilters.organizations || [],
        businessCategories: entityFilters.businessCategories || [],
        keywords: entityFilters.keywords || [],
        timeRanges: entityFilters.time_ranges || [],
        topN: pageSize,
        includeFloodControl: currentFilters.includeFloodControl || false
      }
      
      const res = await advancedSearchService.chipAggregates(params as any)
      if (res?.data) {
        const data = res.data || null
        if (data) {
          // Apply client-side sorting
          const sortData = (entities: Array<{ label: string; total_value: number; count: number }>) => {
            return entities.sort((a, b) => {
              let aValue: any, bValue: any
              
              switch (sortBy) {
                case 'name':
                  aValue = a.label.toLowerCase()
                  bValue = b.label.toLowerCase()
                  break
                case 'total_contract_value':
                  aValue = a.total_value
                  bValue = b.total_value
                  break
                case 'contract_count':
                  aValue = a.count
                  bValue = b.count
                  break
                case 'average_contract_value':
                  aValue = a.total_value / Math.max(1, a.count)
                  bValue = b.total_value / Math.max(1, b.count)
                  break
                default:
                  aValue = a.total_value
                  bValue = b.total_value
              }
              
              if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
              } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
              }
            })
          }
          
          // Sort each entity type
          const sortedData = {
            ...data,
            by_contractor: data.by_contractor ? sortData(data.by_contractor) : [],
            by_organization: data.by_organization ? sortData(data.by_organization) : [],
            by_area: data.by_area ? sortData(data.by_area) : [],
            by_category: data.by_category ? sortData(data.by_category) : []
          }
          
          setRelatedAggregates(sortedData)
        } else {
          setRelatedAggregates(null)
        }
      } else {
        setRelatedAggregates(null)
      }
    } catch (e) {
      setRelatedAggregates(null)
    } finally {
      setAggLoading(false)
    }
  }

  // Nested drill-down: open another contracts modal combining parent + clicked entity
  const [nestedModal, setNestedModal] = useState<{ open: boolean, entityName: string, entityType: 'contractor' | 'organization' | 'area' | 'category' } | null>(null)
  
  // Export modal state
  // Unified export
  const unifiedExport = useUnifiedExport()
  const [currentExportConfig, setCurrentExportConfig] = useState<any>(null)

  const activeTabEntityType: 'contractor' | 'organization' | 'area' | 'category' | null = useMemo(() => {
    if (activeTab === 'contractors') return 'contractor'
    if (activeTab === 'organizations') return 'organization'
    if (activeTab === 'areas') return 'area'
    if (activeTab === 'categories') return 'category'
    return null
  }, [activeTab])

  const handleNestedOpen = (clickedLabel: string) => {
    if (!activeTabEntityType) return
    setNestedModal({ open: true, entityName: clickedLabel, entityType: activeTabEntityType })
  }

  useEffect(() => {
    if (open) {
      fetchContracts(1)
      fetchAllContractsForTrends() // Fetch all contracts for trend chart
      fetchRelatedAggregates(0, entityPageSize, entitySortBy, entitySortDirection)
      setActiveTab('contracts')
      setEntityPageIndex(0) // Reset pagination when opening modal
    }
  }, [open, entityName, entityType])

  useEffect(() => {
    if (open) {
      fetchContracts(1)
    }
  }, [sortConfig])

  // Refetch related aggregates when page size changes
  useEffect(() => {
    if (open && activeTab !== 'contracts') {
      fetchRelatedAggregates(entityPageIndex, entityPageSize, entitySortBy, entitySortDirection)
    }
  }, [entityPageSize])

  // Refetch related aggregates when sorting changes
  useEffect(() => {
    if (open && activeTab !== 'contracts') {
      fetchRelatedAggregates(0, entityPageSize, entitySortBy, entitySortDirection)
      setEntityPageIndex(0) // Reset to first page when sorting changes
    }
  }, [entitySortBy, entitySortDirection])

  const handlePageChange = (page: number) => {
    fetchContracts(page)
  }

  // Handle export initialization
  const handleExportClick = async () => {
    console.log('📊 EntityDrillDownModal - export clicked for:', entityName, activeTab)
    
    let exportConfig: any
    
    if (activeTab === 'contracts') {
      // Use streaming export for contracts
      exportConfig = createEntityDrillDownContractsConfig(entityName, entityType)
      
      // Add entity-specific filters to get contracts for this entity
      const entityFilter = {
        contractors: entityType === 'contractor' ? [entityName] : [],
        areas: entityType === 'area' ? [entityName] : [],
        organizations: entityType === 'organization' ? [entityName] : [],
        business_categories: entityType === 'category' ? [entityName] : [],
        keywords: [],
        time_ranges: currentFilters.time_ranges || [],
        include_flood_control: false
      }
      
      exportConfig = {
        ...exportConfig,
        filters: entityFilter
      }
    } else {
      // Use streaming export for aggregates (by dimension)
      const dimensionMap: Record<string, string> = {
        'contractors': 'by_contractor',
        'organizations': 'by_organization', 
        'areas': 'by_area',
        'categories': 'by_category'
      }
      
      const dimension = dimensionMap[activeTab] || 'by_contractor'
      exportConfig = createEntityDrillDownAggregatesConfig(entityName, dimension)
      
      // Add filters for this specific drill-down context
      const aggregateFilter = {
        contractors: currentFilters.contractors || [],
        areas: currentFilters.areas || [],
        organizations: currentFilters.organizations || [],
        business_categories: currentFilters.businessCategories || [],
        keywords: currentFilters.keywords || [],
        time_ranges: currentFilters.time_ranges || [],
        dimension: dimension,
        include_flood_control: false
      }
      
      exportConfig = {
        ...exportConfig,
        filters: aggregateFilter
      }
    }
    
    console.log('📤 EntityDrillDownModal - streaming export config:', exportConfig)
    setCurrentExportConfig(exportConfig)
    await unifiedExport.initiateExport(exportConfig)
  }
  
  // Handle export download
  const handleExportDownload = async (startRank: number, endRank: number) => {
    console.log('📥 EntityDrillDownModal - export download requested for ranks', startRank, 'to', endRank)
    if (currentExportConfig) {
      await unifiedExport.downloadExport(currentExportConfig)
    }
  }

  if (!open) return null

  const modalStyle = {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000
  }

  const panelStyle = {
    // Use theme CSS variables so the modal updates when the ThemeProvider changes CSS vars
    backgroundColor: vars.background.primary,
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '1200px',
    display: 'flex',
    flexDirection: 'column' as const
  }

  const headerStyle = {
    padding: spacing[4],
    borderBottom: `1px solid ${vars.border.light}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const titleStyle = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: vars.text.primary
  }

  const closeBtnStyle = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: vars.text.secondary,
    padding: spacing[1]
  }

  const contentStyle = {
    flex: 1,
    overflow: 'auto',
    padding: spacing[4]
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: typography.fontSize.sm
  }

  const thStyle = {
    padding: spacing[3],
    textAlign: 'left' as const,
    fontWeight: typography.fontWeight.semibold,
    color: vars.text.primary,
    backgroundColor: vars.background.secondary,
    borderBottom: `2px solid ${vars.border.medium}`,
    cursor: 'pointer',
    userSelect: 'none' as const
  }

  const tdStyle = {
    padding: spacing[3],
    borderBottom: `1px solid ${vars.border.light}`,
    color: vars.text.primary
  }

  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
    color: vars.text.secondary
  }

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
    padding: spacing[4],
    borderTop: `1px solid ${vars.border.light}`
  }

  const pageBtnStyle = {
    padding: `${spacing[2]} ${spacing[3]}`,
    border: `1px solid ${vars.border.medium}`,
    borderRadius: spacing[1],
    background: 'none',
    color: vars.text.primary,
    cursor: 'pointer',
    fontSize: typography.fontSize.sm
  }

  const activePageBtnStyle = {
    ...pageBtnStyle,
    backgroundColor: vars.primary[500],
    color: '#ffffff',
    borderColor: vars.primary[500]
  }

  const tabsBarStyle = {
    display: 'flex',
    gap: spacing[2],
    borderBottom: `1px solid ${vars.border.light}`,
    marginBottom: spacing[4]
  }
  const tabBtnStyle = (tab: DrillTab) => ({
    padding: `${spacing[2]} ${spacing[3]}`,
    border: 'none',
    borderBottom: `2px solid ${activeTab === tab ? vars.primary[500] : 'transparent'}`,
    background: 'none',
    color: activeTab === tab ? vars.primary[600] : vars.text.secondary,
    cursor: 'pointer',
    fontSize: typography.fontSize.sm
  })

  const getTabCount = (tab: DrillTab): number => {
    if (tab === 'contracts') return pagination.totalCount || 0
    if (tab === 'contractors') return entityTotalCounts.contractors
    if (tab === 'organizations') return entityTotalCounts.organizations
    if (tab === 'areas') return entityTotalCounts.areas
    if (tab === 'categories') return entityTotalCounts.categories
    return 0
  }

  const renderEntityAggTable = (rows: Array<{ label: string; total_value: number; count: number }>, labelHeader: string, totalCount: number) => {
    const totalPages = Math.ceil(totalCount / entityPageSize)
    const currentPage = entityPageIndex + 1
    
    return (
      <div>
        {/* Pagination controls */}
          <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: spacing[3],
          padding: `${spacing[2]} ${spacing[3]}`,
          backgroundColor: vars.background.secondary,
          borderRadius: spacing[1]
        }}>
          <div style={{ color: vars.text.secondary, fontSize: typography.fontSize.sm }}>
            Showing {entityPageIndex * entityPageSize + 1} to {Math.min((entityPageIndex + 1) * entityPageSize, totalCount)} of {totalCount.toLocaleString()} {labelHeader.toLowerCase()}s
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <label style={{ color: vars.text.secondary, fontSize: typography.fontSize.sm }}>
              Per page:
            </label>
            <select
              value={entityPageSize}
              onChange={(e) => {
                const newPageSize = parseInt(e.target.value)
                setEntityPageSize(newPageSize)
                setEntityPageIndex(0)
                fetchRelatedAggregates(0, newPageSize, entitySortBy, entitySortDirection)
              }}
                style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                border: `1px solid ${vars.border.medium}`,
                borderRadius: spacing[1],
                backgroundColor: vars.background.primary,
                color: vars.text.primary,
                fontSize: typography.fontSize.sm
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
        
        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Label</th>
                <th style={{ ...thStyle, textAlign: 'right' as const }}>Total Amount</th>
                <th style={{ ...thStyle, textAlign: 'right' as const }}>Count</th>
                <th style={{ ...thStyle, textAlign: 'right' as const }}>Avg Amount</th>
              </tr>
            </thead>
            <tbody>
              {(rows || []).map((r, i) => (
                <tr key={`${r.label}-${i}`}>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleNestedOpen(r.label)}
                      style={{ background: 'none', border: 'none', color: vars.primary[500], cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                      title={`View contracts for ${r.label}`}
                    >
                      {r.label}
                    </button>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' as const, fontFamily: 'monospace' }}>{
                    new Intl.NumberFormat('en-PH', { 
                      style: 'currency', 
                      currency: 'PHP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(r.total_value || 0)
                  }</td>
                  <td style={{ ...tdStyle, textAlign: 'right' as const }}>{(r.count || 0).toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' as const, fontFamily: 'monospace' }}>{
                    new Intl.NumberFormat('en-PH', { 
                      style: 'currency', 
                      currency: 'PHP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format((r.total_value || 0) / Math.max(1, r.count || 0))
                  }</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Page navigation */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing[2],
            marginTop: spacing[3],
            padding: `${spacing[2]} ${spacing[3]}`,
            borderTop: `1px solid ${vars.border.light}`
          }}>
            <button
              onClick={() => {
                const newPageIndex = Math.max(0, entityPageIndex - 1)
                setEntityPageIndex(newPageIndex)
                fetchRelatedAggregates(newPageIndex, entityPageSize, entitySortBy, entitySortDirection)
              }}
              disabled={entityPageIndex <= 0}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${vars.border.primary}`,
                borderRadius: spacing[1],
                background: entityPageIndex <= 0 ? vars.background.secondary : 'none',
                color: entityPageIndex <= 0 ? vars.text.secondary : vars.text.primary,
                cursor: entityPageIndex <= 0 ? 'not-allowed' : 'pointer',
                fontSize: typography.fontSize.sm
              }}
            >
              Previous
            </button>
            
            <span style={{ color: vars.text.secondary, fontSize: typography.fontSize.sm }}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => {
                const newPageIndex = Math.min(totalPages - 1, entityPageIndex + 1)
                setEntityPageIndex(newPageIndex)
                fetchRelatedAggregates(newPageIndex, entityPageSize, entitySortBy, entitySortDirection)
              }}
              disabled={entityPageIndex >= totalPages - 1}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${vars.border.primary}`,
                borderRadius: spacing[1],
                background: entityPageIndex >= totalPages - 1 ? vars.background.secondary : 'none',
                color: entityPageIndex >= totalPages - 1 ? vars.text.secondary : vars.text.primary,
                cursor: entityPageIndex >= totalPages - 1 ? 'not-allowed' : 'pointer',
                fontSize: typography.fontSize.sm
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    )
  }

  

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={titleStyle}>
            Contracts for {entityName} ({entityType})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <AccessibleButton
              variant="secondary"
              onClick={handleExportClick}
              announceOnClick
              announceText="Open export dialog"
              style={{
                padding: `${spacing[1]} ${spacing[3]}`,
                fontSize: typography.fontSize.sm,
                whiteSpace: 'nowrap'
              }}
            >
              Export CSV
            </AccessibleButton>
            <button style={closeBtnStyle} onClick={onClose}>×</button>
          </div>
        </div>

        <div style={contentStyle}>
          <div style={tabsBarStyle}>
            {visibleTabs.map(tab => (
              <button key={tab} style={tabBtnStyle(tab)} onClick={() => setActiveTab(tab)}>
                {tab === 'contracts' ? 'Contracts' : tab.charAt(0).toUpperCase() + tab.slice(1)} ({getTabCount(tab).toLocaleString()})
              </button>
            ))}
          </div>

          {(activeTab === 'contracts') && (
            <div>
              {/* Year/Quarter Trend Chart */}
              <div style={{ marginBottom: spacing[4] }}>
                <div style={{ 
                  marginBottom: spacing[2], 
                  color: vars.text.secondary, 
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium
                }}>
                  Contract Value Trends
                </div>
                <div style={{ 
                  padding: spacing[4], 
                  backgroundColor: vars.background.primary, 
                  borderRadius: spacing[2], 
                  border: `1px solid ${vars.border.light}` 
                }}>
                  {trendDataLoading ? (
                    <div style={{
                      height: 300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: vars.background.secondary,
                      borderRadius: spacing[2],
                      color: vars.text.secondary,
                      fontSize: typography.fontSize.sm,
                    }}>
                      Loading trend data...
                    </div>
                  ) : (
                    <QuarterlyTrendsChart 
                      quarterlyData={processContractDataForTrends.quarterlyData}
                      yearlyData={processContractDataForTrends.yearlyData}
                      title={`${entityName} Contract Trends`}
                      height={300}
                    />
                  )}
                </div>
              </div>

              {/* Contracts Table */}
              <ContractsTable
                contracts={results}
                loading={loading}
                totalCount={pagination.totalCount}
                pageSize={pagination.pageSize}
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                sortBy={sortConfig.key}
                sortDirection={sortConfig.direction}
                onPageChange={handlePageChange}
                onSortChange={(field, direction) => {
                  setSortConfig({ key: field as keyof SearchResult, direction })
                }}
                isDark={isDark}
              />
            </div>
          )}

          {(activeTab !== 'contracts') && (
            <EntitiesTable
              entities={(activeTab === 'contractors' ? relatedAggregates?.by_contractor || [] :
                       activeTab === 'organizations' ? relatedAggregates?.by_organization || [] :
                       activeTab === 'areas' ? relatedAggregates?.by_area || [] :
                       relatedAggregates?.by_category || []).map(entity => ({
                name: entity.label,
                total_contract_value: entity.total_value,
                contract_count: entity.count,
                average_contract_value: entity.total_value / Math.max(1, entity.count)
              }))}
              loading={aggLoading}
              totalCount={activeTab === 'contractors' ? entityTotalCounts.contractors :
                         activeTab === 'organizations' ? entityTotalCounts.organizations :
                         activeTab === 'areas' ? entityTotalCounts.areas :
                         entityTotalCounts.categories}
              pageSize={entityPageSize}
              currentPage={entityPageIndex + 1}
              totalPages={Math.ceil((activeTab === 'contractors' ? entityTotalCounts.contractors :
                                   activeTab === 'organizations' ? entityTotalCounts.organizations :
                                   activeTab === 'areas' ? entityTotalCounts.areas :
                                   entityTotalCounts.categories) / entityPageSize)}
              onPageChange={(page) => {
                const newPageIndex = page - 1
                setEntityPageIndex(newPageIndex)
                fetchRelatedAggregates(newPageIndex, entityPageSize, entitySortBy, entitySortDirection)
              }}
              onPageSizeChange={(newPageSize) => {
                setEntityPageSize(newPageSize)
                setEntityPageIndex(0)
                fetchRelatedAggregates(0, newPageSize, entitySortBy, entitySortDirection)
              }}
              onSortChange={(field, direction) => {
                setEntitySortBy(field)
                setEntitySortDirection(direction)
                setEntityPageIndex(0)
                fetchRelatedAggregates(0, entityPageSize, field, direction)
              }}
              sortBy={entitySortBy}
              sortDirection={entitySortDirection}
              onEntityClick={(entity) => handleNestedOpen(entity.name)}
              entityType={activeTab}
              isDark={isDark}
            />
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportCSVModal
        open={unifiedExport.showExportModal}
        onClose={unifiedExport.closeExportModal}
        onExport={handleExportDownload}
        onCancel={unifiedExport.cancelExport}
        totalCount={getTabCount(activeTab)}
        dataType={`${entityName} ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        isDark={isDark}
        loading={unifiedExport.isExporting}
        progress={unifiedExport.exportProgress}
        estimatedSize={unifiedExport.exportEstimate?.bytes}
        showProgress={true}
        showFileSize={true}
      />

      {/* Nested modal renders another contracts table with combined filters */}
      {nestedModal?.open && (
        <NestedContractsModal
          isDark={isDark}
          parentFilters={currentFilters}
          parentEntity={{ entityName, entityType }}
          nested={nestedModal}
          onClose={() => setNestedModal(prev => prev ? { ...prev, open: false } : null)}
        />
      )}
    </div>
  )
}

export { EntityDrillDownModal }

// Renders a second-level drill contracts table combining parent + nested entity
const NestedContractsModal: React.FC<{
  isDark?: boolean,
  parentFilters: EntityDrillDownModalProps['currentFilters'],
  parentEntity: { entityName: string, entityType: 'contractor' | 'organization' | 'area' | 'category' },
  nested: { open: boolean, entityName: string, entityType: 'contractor' | 'organization' | 'area' | 'category' },
  onClose: () => void
}> = ({ isDark = false, parentFilters, parentEntity, nested, onClose }) => {
  const vars = getThemeVars(isDark)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, totalCount: 0, totalPages: 0 })
  const [sortConfig, setSortConfig] = useState({ key: 'contract_amount' as keyof SearchResult, direction: 'desc' as 'asc' | 'desc' })

  const modalStyle = { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000 }
  const panelStyle = { backgroundColor: isDark ? '#0b1220' : '#ffffff', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '90vw', maxHeight: '90vh', width: '1200px', display: 'flex', flexDirection: 'column' as const }
  const headerStyle = { padding: spacing[4], borderBottom: `1px solid ${vars.border.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
  const titleStyle = { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: vars.text.primary }
  const closeBtnStyle = { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: vars.text.secondary, padding: spacing[1] }
  const contentStyle = { flex: 1, overflow: 'auto', padding: spacing[4] }
  const tableStyle = { width: '100%', borderCollapse: 'collapse' as const, fontSize: typography.fontSize.sm }
  const thStyle = { padding: spacing[3], textAlign: 'left' as const, fontWeight: typography.fontWeight.semibold, color: vars.text.primary, backgroundColor: vars.background.secondary, borderBottom: `2px solid ${vars.border.medium}`, cursor: 'pointer', userSelect: 'none' as const }
  const tdStyle = { padding: spacing[3], borderBottom: `1px solid ${vars.border.light}`, color: vars.text.primary }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0)
  const formatDate = (dateString: string) => { try { return new Date(dateString).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return String(dateString) } }

  const handlePageChange = (page: number) => {
    fetchContracts(page)
  }

  const fetchContracts = async (page: number = 1) => {
    setLoading(true)
    try {
      const combined = { ...parentFilters }
      const apply = (filters: any, type: 'contractor' | 'organization' | 'area' | 'category', name: string) => {
        const key = type === 'contractor' ? 'contractors' : type === 'organization' ? 'organizations' : type === 'area' ? 'areas' : 'businessCategories'
        const prev = Array.isArray(filters[key]) ? filters[key] : []
        filters[key] = [...prev, name]
      }
      apply(combined, parentEntity.entityType, parentEntity.entityName)
      apply(combined, nested.entityType, nested.entityName)

      const params = { 
        ...combined, 
        page, 
        pageSize: pagination.pageSize, 
        sortBy: sortConfig.key, 
        sortDirection: sortConfig.direction,
        includeFloodControl: parentFilters.includeFloodControl || false
      }
      const response = await advancedSearchService.searchContractsWithChips(params as any)
      if ((response as any)?.success) {
        setResults((response as any).data || [])
        setPagination({
          page: (response as any).pagination?.page || 1,
          pageSize: (response as any).pagination?.page_size || 20,
          totalCount: (response as any).pagination?.total_count || 0,
          totalPages: (response as any).pagination?.total_pages || 0
        })
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { if (nested.open) fetchContracts(1) }, [nested.open, nested.entityName, nested.entityType])
  useEffect(() => { if (nested.open) fetchContracts(1) }, [sortConfig])

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={titleStyle}>
            Contracts for {nested.entityName} ({nested.entityType}) within {parentEntity.entityName} ({parentEntity.entityType})
          </div>
          <button style={closeBtnStyle} onClick={onClose}>×</button>
        </div>
        <div style={contentStyle}>
          <ContractsTable
            contracts={results}
            loading={loading}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  )
}
