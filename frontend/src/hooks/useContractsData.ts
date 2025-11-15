/**
 * Hook for managing contracts data from CSV
 */

import { useMemo } from 'react'
import { Contract, ContractFilters, ContractSortConfig } from '../types/contracts'
import { useContractsData as useContractsDataContext } from '../contexts/ContractsDataContext'
import { getContractorNames } from '../types/contracts'

export interface UseContractsDataReturn {
  contracts: Contract[]
  filteredContracts: Contract[]
  loading: boolean
  loadingStage: string
  error: Error | null
  filterOptions: {
    regions: string[]
    implementing_offices: string[]
    contractors: string[]
    statuses: string[]
    years: number[]
    source_of_funds: string[]
  }
  reload: () => Promise<void>
}

export const useContractsData = (): UseContractsDataReturn => {
  const { contracts, aggregates, loading, loadingStage, error, reload } = useContractsDataContext()
  // Map aggregates to filterOptions shape expected by UI
  const filterOptions = {
    regions: aggregates?.regions || [],
    implementing_offices: aggregates?.implementingOffices || [],
    contractors: aggregates?.contractors || [],
    statuses: aggregates?.statuses || [],
    years: aggregates?.years || [],
    source_of_funds: aggregates?.sourcesOfFunds || [],
  }
  // Filtered contracts (no filtering applied yet - will be done in component)
  const filteredContracts = useMemo(() => contracts, [contracts])
  return {
    contracts,
    filteredContracts,
    loading,
    loadingStage,
    error: error ? new Error(error) : null,
    filterOptions,
    reload,
  }
}

/**
 * Hook for filtering contracts
 */
export const useContractFilters = (
  contracts: Contract[],
  filters: ContractFilters,
  sortConfig: ContractSortConfig
) => {
  return useMemo(() => {
    let filtered = [...contracts]

    // Apply filters
    if (filters.regions.length > 0) {
      filtered = filtered.filter(c => 
        filters.regions.some(filterRegion => 
          c.region.toLowerCase().includes(filterRegion.toLowerCase())
        )
      )
    }

    if (filters.implementing_offices.length > 0) {
      filtered = filtered.filter(c => 
        filters.implementing_offices.some(filterOffice => 
          c.implementing_office.toLowerCase().includes(filterOffice.toLowerCase())
        )
      )
    }

    if (filters.contractors.length > 0) {
      filtered = filtered.filter(c => {
        const contractorNames = getContractorNames(c)
        return filters.contractors.some(filterContractor => 
          contractorNames.some(name => 
            name.toLowerCase().includes(filterContractor.toLowerCase())
          )
        )
      })
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter(c => filters.statuses.includes(c.status))
    }

    if (filters.years.length > 0) {
      filtered = filtered.filter(c => c.year && filters.years.includes(c.year))
    }

    if (filters.source_of_funds.length > 0) {
      filtered = filtered.filter(c => 
        filters.source_of_funds.some(filterSource => 
          c.source_of_funds.toLowerCase().includes(filterSource.toLowerCase())
        )
      )
    }

    if (filters.keywords.length > 0) {
      filtered = filtered.filter(c => {
        const searchText = [
          c.description,
          c.contract_id
        ].join(' ').toLowerCase()
        
        return filters.keywords.every(keyword =>
          searchText.includes(keyword.toLowerCase())
        )
      })
    }

    if (filters.minCost !== undefined) {
      filtered = filtered.filter(c => c.cost_php !== null && c.cost_php >= filters.minCost!)
    }

    if (filters.maxCost !== undefined) {
      filtered = filtered.filter(c => c.cost_php !== null && c.cost_php <= filters.maxCost!)
    }

    // Apply value range filter
    if (filters.valueRange) {
      if (filters.valueRange.min !== undefined) {
        filtered = filtered.filter(c => c.cost_php !== null && c.cost_php >= filters.valueRange!.min!)
      }
      if (filters.valueRange.max !== undefined) {
        filtered = filtered.filter(c => c.cost_php !== null && c.cost_php <= filters.valueRange!.max!)
      }
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange.type !== 'all_time') {
      filtered = filtered.filter(c => {
        if (!c.effectivity_date) return false
        
        try {
          const contractDate = new Date(c.effectivity_date)
          if (isNaN(contractDate.getTime())) return false

          if (filters.dateRange!.type === 'yearly' && filters.dateRange!.year) {
            return contractDate.getFullYear() === filters.dateRange!.year
          }
          
          if (filters.dateRange!.type === 'quarterly' && filters.dateRange!.year && filters.dateRange!.quarter) {
            const year = contractDate.getFullYear()
            const month = contractDate.getMonth() + 1
            const quarter = Math.ceil(month / 3)
            return year === filters.dateRange!.year && quarter === filters.dateRange!.quarter
          }
          
          if (filters.dateRange!.type === 'custom' && filters.dateRange!.startDate && filters.dateRange!.endDate) {
            const startDate = new Date(filters.dateRange!.startDate)
            const endDate = new Date(filters.dateRange!.endDate)
            return contractDate >= startDate && contractDate <= endDate
          }
        } catch {
          return false
        }
        
        return true
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.field as keyof Contract]
      let bValue: any = b[sortConfig.field as keyof Contract]

      // Handle null values
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Handle numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue
      }

      // Handle string comparison
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })

    return filtered
  }, [contracts, filters, sortConfig])
}

