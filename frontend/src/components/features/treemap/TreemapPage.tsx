import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeColors } from '../../../design-system/theme'
import { spacing, typography } from '../../../design-system'
import {
  PageContainer,
  ContentContainer,
  Card,
  SectionTitle,
  BodyText
} from '../../styled/Common.styled'
import { D3TreemapChart as TreemapChart, type TreemapData } from '../../charts/D3TreemapChart'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import { ErrorDisplay } from '../shared/ErrorDisplay'
import { ContractDetailsModal } from '../contracts-explorer/ContractDetailsModal'
import { useContractsData } from '../../../hooks/useContractsData'
import { Contract } from '../../../types/contracts'

// Types
interface HierarchyConfig {
  id: string
  label: string
  description: string
  levels: string[]
}

interface DrillDownState {
  level: number
  path: Array<{ id: string; name: string; type: string }>
  filters: Record<string, string[]>
}

export const TreemapPage: React.FC = () => {
  const { isDark } = useTheme()
  const themeColors = getThemeColors(isDark)
  const { contracts, loading: dataLoading, error: dataError } = useContractsData()
  
  // Prevent modals from opening while data is loading
  const canOpenModals = !dataLoading
  
  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>('region-office-contractor')
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [drillDownState, setDrillDownState] = useState<DrillDownState>({
    level: 0,
    path: [],
    filters: {}
  })
  const [treemapData, setTreemapData] = useState<TreemapData>({
    level: 'grouping',
    entities: []
  })

  // Hash routing for contract details
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      
      // Don't open modals while data is loading
      if (!canOpenModals) {
        return
      }
      
      if (hash.startsWith('#contract/')) {
        const contractId = hash.replace('#contract/', '')
        const contract = contracts.find(c => c.contract_id === contractId)
        if (contract) setSelectedContract(contract)
      } else if (!hash || hash === '#treemap') {
        setSelectedContract(null)
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [contracts, canOpenModals])

  // Hierarchy configurations for DPWH data (memoized to prevent infinite loops)
  const hierarchies = useMemo<HierarchyConfig[]>(() => [
    {
      id: 'region-office-contractor',
      label: 'Region → Office → Contractor → Contracts',
      description: 'Start with region, see implementing offices, then contractors, then individual contracts',
      levels: ['region', 'office', 'contractor', 'contracts']
    },
    {
      id: 'region-contractor-contracts',
      label: 'Region → Contractor → Contracts',
      description: 'Start with region, see contractors, then their individual contracts',
      levels: ['region', 'contractor', 'contracts']
    },
    {
      id: 'office-contractor-contracts',
      label: 'Office → Contractor → Contracts',
      description: 'Start with implementing office, see contractors, then individual contracts',
      levels: ['office', 'contractor', 'contracts']
    },
    {
      id: 'contractor-region-contracts',
      label: 'Contractor → Region → Contracts',
      description: 'Start with contractor, see their regions, then specific contracts',
      levels: ['contractor', 'region', 'contracts']
    },
    {
      id: 'year-region-contractor',
      label: 'Year → Region → Contractor → Contracts',
      description: 'Start with year, see regions, then contractors, then contracts',
      levels: ['year', 'region', 'contractor', 'contracts']
    }
  ], [])

  // Helper: Aggregate contracts by field
  const aggregateByField = useCallback((contractsList: Contract[], field: 'region' | 'implementing_office' | 'year' | 'contractor_name_1', limit: number = 20) => {
    const aggregates = contractsList.reduce((acc, contract) => {
      let key = ''
      if (field === 'region') key = contract.region || 'Unknown'
      else if (field === 'implementing_office') key = contract.implementing_office || 'Unknown'
      else if (field === 'year') key = String(contract.year || 'Unknown')
      else if (field === 'contractor_name_1') {
        // Get all contractors for this contract
        const contractors = [
          contract.contractor_name_1,
          contract.contractor_name_2,
          contract.contractor_name_3,
          contract.contractor_name_4
        ].filter(Boolean)
        // Create entry for each contractor
        contractors.forEach(contractor => {
          if (!acc[contractor!]) {
            acc[contractor!] = { value: 0, count: 0, contracts: [] }
          }
          acc[contractor!].value += contract.cost_php || 0
          acc[contractor!].count += 1
          acc[contractor!].contracts.push(contract)
        })
        return acc
      }
      
      if (!acc[key]) {
        acc[key] = { value: 0, count: 0, contracts: [] }
      }
      acc[key].value += contract.cost_php || 0
      acc[key].count += 1
      acc[key].contracts.push(contract)
      return acc
    }, {} as Record<string, { value: number; count: number; contracts: Contract[] }>)

    return Object.entries(aggregates)
      .map(([name, data]) => ({
        id: `${field}_${name}`,
        name,
        value: data.value,
        count: data.count,
        contracts: data.contracts,
        type: field === 'region' ? 'region' : field === 'implementing_office' ? 'office' : field === 'year' ? 'year' : 'contractor'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
  }, [])

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const hierarchy = hierarchies.find(h => h.id === selectedHierarchy)
      if (!hierarchy) return

      const currentLevelType = hierarchy.levels[0]
      const fieldMap: Record<string, 'region' | 'implementing_office' | 'year' | 'contractor_name_1'> = {
        'region': 'region',
        'office': 'implementing_office',
        'year': 'year',
        'contractor': 'contractor_name_1'
      }
      
      const field = fieldMap[currentLevelType]
      const entities = aggregateByField(contracts, field, 20)

      setTreemapData({
        level: 'grouping',
        entities
      })

      setDrillDownState({
        level: 0,
        path: [],
        filters: {}
      })
    } catch (err) {
      console.error('Error loading treemap data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [selectedHierarchy, contracts, aggregateByField, hierarchies])

  // Load drill-down data
  const loadDrillDownData = useCallback(async (entity: { id: string; name: string; type: string; contracts?: Contract[] }) => {
    setLoading(true)
    setError(null)
    
    try {
      const hierarchy = hierarchies.find(h => h.id === selectedHierarchy)
      if (!hierarchy) return

      const currentLevel = drillDownState.level + 1
      const currentLevelType = hierarchy.levels[currentLevel]
      
      // Filter contracts based on current path
      let filteredContracts = entity.contracts || contracts
      drillDownState.path.forEach(pathItem => {
        filteredContracts = filteredContracts.filter(c => {
          if (pathItem.type === 'region') return c.region === pathItem.name
          if (pathItem.type === 'office') return c.implementing_office === pathItem.name
          if (pathItem.type === 'year') return String(c.year) === pathItem.name
          if (pathItem.type === 'contractor') {
            return [c.contractor_name_1, c.contractor_name_2, c.contractor_name_3, c.contractor_name_4]
              .filter(Boolean)
              .includes(pathItem.name)
          }
          return true
        })
      })

      // Apply current entity filter
      filteredContracts = filteredContracts.filter(c => {
        if (entity.type === 'region') return c.region === entity.name
        if (entity.type === 'office') return c.implementing_office === entity.name
        if (entity.type === 'year') return String(c.year) === entity.name
        if (entity.type === 'contractor') {
          return [c.contractor_name_1, c.contractor_name_2, c.contractor_name_3, c.contractor_name_4]
            .filter(Boolean)
            .includes(entity.name)
        }
        return true
      })
      
      if (currentLevelType === 'contracts') {
        // Show individual contracts
        const contractEntities = filteredContracts.slice(0, 50).map((contract, index) => ({
          id: `contract_${contract.contract_id || index}`,
          name: contract.description || contract.contract_id || `Contract ${index + 1}`,
          value: contract.cost_php || 0,
          count: 1,
          contractDetails: [contract]
        }))

        setTreemapData({
          level: 'contracts',
          entities: contractEntities
        })
      } else {
        // Aggregate to next level
        const fieldMap: Record<string, 'region' | 'implementing_office' | 'year' | 'contractor_name_1'> = {
          'region': 'region',
          'office': 'implementing_office',
          'year': 'year',
          'contractor': 'contractor_name_1'
        }
        
        const field = fieldMap[currentLevelType]
        const entities = aggregateByField(filteredContracts, field, 20)

        setTreemapData({
          level: currentLevel === hierarchy.levels.length - 1 ? 'contracts' : 'sub-grouping',
          entities
        })
      }

      // Update drill-down state
      setDrillDownState(prev => ({
        level: currentLevel,
        path: [...prev.path, entity],
        filters: {
          ...prev.filters,
          [entity.type]: [entity.name]
        }
      }))
    } catch (err) {
      console.error('Error loading drill-down data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [selectedHierarchy, drillDownState, contracts, aggregateByField, hierarchies])

  // Load data for a specific level with filters
  const loadDataForLevel = useCallback(async (level: number, filters: Record<string, string[]>) => {
    setLoading(true)
    setError(null)
    
    try {
      const hierarchy = hierarchies.find(h => h.id === selectedHierarchy)
      if (!hierarchy) return

      const currentLevelType = hierarchy.levels[level]
      
      // Filter contracts based on filters
      let filteredContracts = contracts
      Object.entries(filters).forEach(([key, values]) => {
        filteredContracts = filteredContracts.filter(c => {
          if (key === 'region') return values.includes(c.region || '')
          if (key === 'office') return values.includes(c.implementing_office || '')
          if (key === 'year') return values.includes(String(c.year || ''))
          if (key === 'contractor') {
            return [c.contractor_name_1, c.contractor_name_2, c.contractor_name_3, c.contractor_name_4]
              .filter(Boolean)
              .some(contractor => values.includes(contractor!))
          }
          return true
        })
      })
      
      if (currentLevelType === 'contracts') {
        // Show individual contracts
        const contractEntities = filteredContracts.slice(0, 50).map((contract, index) => ({
          id: `contract_${contract.contract_id || index}`,
          name: contract.description || contract.contract_id || `Contract ${index + 1}`,
          value: contract.cost_php || 0,
          count: 1,
          contractDetails: [contract]
        }))

        setTreemapData({
          level: 'contracts',
          entities: contractEntities
        })
      } else {
        // Aggregate to level
        const fieldMap: Record<string, 'region' | 'implementing_office' | 'year' | 'contractor_name_1'> = {
          'region': 'region',
          'office': 'implementing_office',
          'year': 'year',
          'contractor': 'contractor_name_1'
        }
        
        const field = fieldMap[currentLevelType]
        const entities = aggregateByField(filteredContracts, field, 20)

        setTreemapData({
          level: level === hierarchy.levels.length - 1 ? 'contracts' : 'sub-grouping',
          entities
        })
      }
    } catch (err) {
      console.error('Error loading data for level:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [selectedHierarchy, hierarchies, contracts, aggregateByField])

  // Event handlers
  const handleDrillDown = useCallback((entity: { id: string; name: string; type: string; contracts?: Contract[] }) => {
    loadDrillDownData(entity)
  }, [loadDrillDownData])

  const handleDrillUp = useCallback(() => {
    if (drillDownState.level === 0) {
      loadInitialData()
    } else {
      const newPath = drillDownState.path.slice(0, -1)
      const newLevel = drillDownState.level - 1
      
      // Reconstruct filters for the previous level
      const newFilters: Record<string, string[]> = {}
      newPath.forEach(item => {
        newFilters[item.type] = [item.name]
      })

      setDrillDownState({
        level: newLevel,
        path: newPath,
        filters: newFilters
      })

      // Load data for the previous level
      if (newLevel === 0) {
        loadInitialData()
      } else {
        loadDataForLevel(newLevel, newFilters)
      }
    }
  }, [drillDownState, loadInitialData, loadDataForLevel])

  const handleContractClick = useCallback((contract: any) => {
    console.log('Contract clicked:', contract)
    if (contract && contract.contractDetails && contract.contractDetails.length > 0) {
      const contractToShow = contract.contractDetails[0]
      window.location.hash = `#contract/${contractToShow.contract_id}`
    } else if (contract && contract.contract_id) {
      window.location.hash = `#contract/${contract.contract_id}`
    }
  }, [])

  const handleHierarchyChange = useCallback((hierarchyId: string) => {
    setSelectedHierarchy(hierarchyId)
  }, [])

  // Load initial data on mount and when hierarchy or contracts changes
  useEffect(() => {
    if (contracts.length > 0 && !dataLoading) {
      loadInitialData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contracts.length, dataLoading, selectedHierarchy])

  const currentHierarchy = hierarchies.find(h => h.id === selectedHierarchy)

  return (
    <PageContainer $isDark={isDark}>
      <ContentContainer $isDark={isDark}>
        {/* Header */}
        <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
          <SectionTitle $isDark={isDark} style={{ marginBottom: spacing[4] }}>
            👁 DPWH Contracts Treemap
          </SectionTitle>
          
          <BodyText $isDark={isDark} style={{ marginBottom: spacing[4] }}>
            Interactive treemap visualization with drill-down capabilities. Explore DPWH contracts data 
            through different hierarchical views. Click on rectangles to drill down into more detailed data.
          </BodyText>
        </Card>

        {/* Hierarchy Selection */}
        <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
          <h3 style={{
            ...typography.textStyles.h3,
            color: themeColors.text.primary,
            marginBottom: spacing[4]
          }}>
            Select Exploration Path
          </h3>
          
          <div style={{ marginBottom: spacing[4] }}>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: themeColors.text.secondary,
              marginBottom: spacing[2]
            }}>
              Choose how you want to explore the data:
            </label>
            <select
              value={selectedHierarchy}
              onChange={(e) => handleHierarchyChange(e.target.value)}
              style={{
                width: '100%',
                padding: `${spacing[3]} ${spacing[4]}`,
                backgroundColor: themeColors.background.secondary,
                color: themeColors.text.primary,
                border: `1px solid ${themeColors.border.medium}`,
                borderRadius: spacing[1],
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = themeColors.primary[500]
                e.target.style.boxShadow = `0 0 0 2px ${themeColors.primary[100]}`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = themeColors.border.medium
                e.target.style.boxShadow = 'none'
              }}
            >
              {hierarchies.map(hierarchy => (
                <option key={hierarchy.id} value={hierarchy.id}>
                  {hierarchy.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Selected Hierarchy Description */}
          <div style={{
            padding: spacing[3],
            backgroundColor: themeColors.background.tertiary,
            borderRadius: spacing[1],
            border: `1px solid ${themeColors.border.light}`
          }}>
            <div style={{
              fontSize: typography.fontSize.sm,
              color: themeColors.text.secondary,
              lineHeight: '1.5'
            }}>
              {hierarchies.find(h => h.id === selectedHierarchy)?.description}
            </div>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
            <ErrorDisplay
              error={error}
              onRetry={loadInitialData}
            />
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card $isDark={isDark} style={{ marginBottom: spacing[6] }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: spacing[8]
            }}>
              <LoadingSpinner size="large" />
            </div>
          </Card>
        )}

        {/* Treemap Visualization */}
        {!loading && !error && currentHierarchy && (
          <Card $isDark={isDark}>
            {/* Dynamic Path Information */}
            {drillDownState.level > 0 && (
              <div style={{
                marginBottom: spacing[4],
                padding: spacing[3],
                backgroundColor: themeColors.background.tertiary,
                borderRadius: spacing[1],
                border: `1px solid ${themeColors.border.light}`
              }}>
                <div style={{
                  fontSize: typography.fontSize.base,
                  color: themeColors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing[1]
                }}>
                  📍 Current View: {drillDownState.path.map(item => item.name).join(' → ')}
                </div>
                <div style={{
                  fontSize: typography.fontSize.sm,
                  color: themeColors.text.secondary
                }}>
                  {currentHierarchy.levels[drillDownState.level] === 'contracts' 
                    ? 'Showing individual contracts' 
                    : `Showing ${currentHierarchy.levels[drillDownState.level]}s`}
                </div>
              </div>
            )}
            
            <TreemapChart
              data={treemapData}
              hierarchy={currentHierarchy.levels}
              currentLevel={drillDownState.level}
              onDrillDown={handleDrillDown}
              onDrillUp={handleDrillUp}
              onContractClick={handleContractClick}
              title={`${currentHierarchy.label} - Level ${drillDownState.level + 1}`}
              height={800}
            />
          </Card>
        )}
      </ContentContainer>
      
      {/* Contract Details Modal */}
      <ContractDetailsModal
        open={selectedContract !== null}
        onClose={() => window.history.back()}
        contract={selectedContract}
        isDark={isDark}
        zIndex={10002}
      />
    </PageContainer>
  )
}
