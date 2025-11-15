import React, { useState, useCallback, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeVars } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import { useContractsData, useContractFilters } from '../../../hooks/useContractsData'
import { Contract, ContractFilters, ContractSortConfig } from '../../../types/contracts'
import { ContractsTable } from './ContractsTable'
import { ContractsFilters } from './ContractsFilters'
import { ContractsSummary } from './ContractsSummary'
import { ContractsActions } from './ContractsActions'
import { ContractsAnalyticsModal } from './ContractsAnalyticsModal'
import { ContractDetailsModal } from './ContractDetailsModal'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { ErrorDisplay } from '../shared/ErrorDisplay'
import { downloadContractsCSV } from '../../../utils/contractsExport'
import { useContractsAnalytics } from '../../../hooks/useContractsAnalytics'
import {
  PageContainer,
  ContentContainer,
  Card,
  SectionTitle,
  BodyText
} from '../../styled/Common.styled'

export const ContractsExplorer: React.FC = () => {
  const { isDark } = useTheme()
  const vars = getThemeVars(isDark)

  // Load contracts data
  const { contracts, loading, loadingStage, error, filterOptions, reload } = useContractsData()

  // Filter state
  const [filters, setFilters] = useState<ContractFilters>({
    regions: [],
    implementing_offices: [],
    contractors: [],
    statuses: [],
    years: [],
    source_of_funds: [],
    keywords: []
  })

  // Sort state
  const [sortConfig, setSortConfig] = useState<ContractSortConfig>({
    field: 'cost_php',
    direction: 'desc'
  })

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50
  })

  // Analytics modal state
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  
  // Contract details modal state
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  // Hash routing for modals
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      
      if (hash === '#analytics') {
        if (!analyticsOpen) setAnalyticsOpen(true)
        if (selectedContract) setSelectedContract(null)
      } else if (hash.startsWith('#analytics/') && hash.includes('/contract/')) {
        // Nested route: analytics drill-down with contract details
        if (!analyticsOpen) setAnalyticsOpen(true)
        const contractIdWithYear = hash.split('/contract/')[1]
        const selectedId = selectedContract?.year && selectedContract?.contract_id ? `${selectedContract.year}-${selectedContract.contract_id}` : selectedContract?.contract_id
        if (selectedId !== contractIdWithYear) {
          const contract = contracts.find(c => {
            const fullId = c.year && c.contract_id ? `${c.year}-${c.contract_id}` : c.contract_id
            return fullId === contractIdWithYear
          })
          if (contract) {
            setSelectedContract(contract)
          }
        }
      } else if (hash.startsWith('#analytics/')) {
        if (!analyticsOpen) setAnalyticsOpen(true)
        if (selectedContract) setSelectedContract(null)
      } else if (hash.startsWith('#contract/')) {
        const contractIdWithYear = hash.replace('#contract/', '')
        const selectedId = selectedContract?.year && selectedContract?.contract_id ? `${selectedContract.year}-${selectedContract.contract_id}` : selectedContract?.contract_id
        if (selectedId !== contractIdWithYear) {
          const contract = contracts.find(c => {
            const fullId = c.year && c.contract_id ? `${c.year}-${c.contract_id}` : c.contract_id
            return fullId === contractIdWithYear
          })
          if (contract) {
            setSelectedContract(contract)
            if (analyticsOpen) setAnalyticsOpen(false)
          }
        }
      } else if (!hash) {
        if (analyticsOpen) setAnalyticsOpen(false)
        if (selectedContract) setSelectedContract(null)
      }
    }

    handleHashChange() // Check on mount
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [contracts, analyticsOpen, selectedContract])

  // Apply filters and sorting
  const filteredContracts = useContractFilters(contracts, filters, sortConfig)

  // Get aggregates for analytics (using first dimension as default)
  const { aggregates } = useContractsAnalytics(
    contracts,
    filters,
    'by_contractor',
    'amount',
    'all'
  )

  // Paginated contracts
  const paginatedContracts = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredContracts.slice(start, end)
  }, [filteredContracts, pagination.page, pagination.pageSize])

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalContracts = filteredContracts.length
    const totalValue = filteredContracts.reduce((sum, c) => sum + (c.cost_php || 0), 0)
    const averageValue = totalContracts > 0 ? totalValue / totalContracts : 0
    const completedCount = filteredContracts.filter(c => c.status === 'Completed').length
    const onGoingCount = filteredContracts.filter(c => c.status === 'On-Going').length

    return {
      totalContracts,
      totalValue,
      averageValue,
      completedCount,
      onGoingCount
    }
  }, [filteredContracts])

  // Filter handlers
  const handleAddFilter = useCallback((type: keyof ContractFilters, value: string | number) => {
    setFilters(prev => {
      const current = prev[type] as (string | number)[]
      if (Array.isArray(current) && !current.includes(value)) {
        return {
          ...prev,
          [type]: [...current, value]
        }
      }
      return prev
    })
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }, [])

  const handleRemoveFilter = useCallback((type: keyof ContractFilters, index: number) => {
    setFilters(prev => {
      const current = prev[type] as (string | number)[]
      if (Array.isArray(current)) {
        return {
          ...prev,
          [type]: current.filter((_, i) => i !== index)
        }
      }
      return prev
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({
      regions: [],
      implementing_offices: [],
      contractors: [],
      statuses: [],
      years: [],
      source_of_funds: [],
      keywords: [],
      dateRange: { type: 'all_time' },
      valueRange: {}
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const handleDateRangeChange = useCallback((dateRange: ContractFilters['dateRange']) => {
    setFilters(prev => ({ ...prev, dateRange }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const handleValueRangeChange = useCallback((valueRange: ContractFilters['valueRange']) => {
    setFilters(prev => ({ ...prev, valueRange }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const handleSort = useCallback((field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }))
  }, [])

  // Export handler
  const handleExport = useCallback(() => {
    const filename = `contracts_export_${new Date().toISOString().slice(0, 10)}.csv`
    downloadContractsCSV(filteredContracts, filename)
  }, [filteredContracts])

  // Analytics handler
  const handleShowAnalytics = useCallback(() => {
    console.log('📊 [ContractsExplorer] Opening analytics modal', { aggregates, hasData: aggregates !== null })
    window.location.hash = '#analytics'
  }, [aggregates])

  const handleCloseAnalytics = useCallback(() => {
    console.log('📊 [ContractsExplorer] Closing analytics modal')
    window.history.back()
  }, [])

  // Contract details handler
  const handleViewContractDetails = useCallback((contract: Contract) => {
    const contractId = contract.year && contract.contract_id ? `${contract.year}-${contract.contract_id}` : contract.contract_id
    window.location.hash = `#contract/${contractId}`
  }, [])

  const handleCloseContractDetails = useCallback(() => {
    const hash = window.location.hash
    if (hash.includes('/contract/')) {
      // Remove the contract part from the hash
      const baseHash = hash.split('/contract/')[0]
      window.location.hash = baseHash
    } else {
      window.history.back()
    }
  }, [])

  return (
    <PageContainer $isDark={isDark}>
      <ContentContainer $isDark={isDark}>
        {/* Header */}
        <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
          <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
            📋 DPWH Contracts Explorer
          </SectionTitle>
          <BodyText $isDark={isDark}>
            Explore DPWH contracts from all years and offices. Filter by region, office, contractor, 
            status, year, and more. Click on any contract to view details.
          </BodyText>
        </Card>

        {/* Error State */}
        {error && (
          <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
            <ErrorDisplay
              error={error}
              onRetry={reload}
              retryText="Retry loading contracts"
            />
          </Card>
        )}

        {/* Summary Statistics */}
        {!loading && !error && (
          <ContractsSummary
            stats={summaryStats}
            isDark={isDark}
          />
        )}

        {/* Filters */}
        {!loading && !error && (
          <ContractsFilters
            filters={filters}
            filterOptions={filterOptions}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            onClearFilters={handleClearFilters}
            onDateRangeChange={handleDateRangeChange}
            onValueRangeChange={handleValueRangeChange}
            isDark={isDark}
          />
        )}

        {/* Actions (Export, Analytics) */}
        {!loading && !error && filteredContracts.length > 0 && (
          <ContractsActions
            hasResults={filteredContracts.length > 0}
            hasAggregates={aggregates !== null}
            onExport={handleExport}
            onShowAnalytics={handleShowAnalytics}
          />
        )}

        {/* Loading State */}
        {loading && (
          <Card $isDark={isDark} style={{ textAlign: 'center', padding: spacing[8] }}>
            <LoadingSpinner size="large" />
            <BodyText $isDark={isDark} style={{ marginTop: spacing[4], fontSize: typography.fontSize.lg, fontWeight: 600 }}>
              {loadingStage}
            </BodyText>
            <BodyText $isDark={isDark} style={{ marginTop: spacing[2], fontSize: typography.fontSize.sm, opacity: 0.7 }}>
              Please wait while we prepare your data
            </BodyText>
          </Card>
        )}

        {/* Contracts Table */}
        {!loading && !error && (
          <ContractsTable
            contracts={paginatedContracts}
            totalCount={filteredContracts.length}
            pageSize={pagination.pageSize}
            currentPage={pagination.page}
            totalPages={Math.ceil(filteredContracts.length / pagination.pageSize)}
            sortBy={sortConfig.field}
            sortDirection={sortConfig.direction}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSortChange={handleSort}
            onViewContractDetails={handleViewContractDetails}
            isDark={isDark}
          />
        )}

        {/* Analytics Modal */}
        {analyticsOpen && (
          <ContractsAnalyticsModal
            open={analyticsOpen}
            onClose={handleCloseAnalytics}
            contracts={contracts}
            filters={filters}
            isDark={isDark}
          />
        )}
        
        {/* Contract Details Modal */}
        {selectedContract && (
          <ContractDetailsModal
            contract={selectedContract}
            open={!!selectedContract}
            onClose={handleCloseContractDetails}
            isDark={isDark}
            zIndex={window.location.hash.includes('analytics') ? 10002 : 10000}
          />
        )}
        
        {/* Debug Analytics State */}
        {console.log('📊 [ContractsExplorer] Analytics state:', { analyticsOpen, contractsCount: contracts.length, filtersActive: Object.values(filters).some(f => Array.isArray(f) && f.length > 0) })}
      </ContentContainer>
    </PageContainer>
  )
}

