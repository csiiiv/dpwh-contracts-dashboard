/**
 * Hook for managing contracts analytics
 */

import React, { useMemo } from 'react'
import { Contract, ContractFilters, getContractorNames } from '../types/contracts'
import { getContractsAggregates, sortAggregatedEntities, AggregatedEntity } from '../utils/contractsAnalytics'

export interface UseContractsAnalyticsReturn {
  aggregates: {
    summary: Array<{ count: number; total_value: number; avg_value: number }>
    by_contractor: AggregatedEntity[]
    by_region: AggregatedEntity[]
    by_implementing_office: AggregatedEntity[]
    by_status: AggregatedEntity[]
    by_source_of_funds: AggregatedEntity[]
    by_year: Array<{ year: number; total_value: number; count: number }>
    by_month: Array<{ month: string; total_value: number; count: number }>
    by_quarter: Array<{ year: number; quarter: number; total_value: number; count: number }>
  } | null
  processedData: AggregatedEntity[]
  summaryStats: {
    totalContracts: number
    totalValue: number
    averageValue: number
  }
  loading: boolean
}

export interface AnalyticsControls {
  dimension: 'by_contractor' | 'by_region' | 'by_implementing_office' | 'by_status' | 'by_source_of_funds'
  metric: 'amount' | 'count' | 'avg'
  yearFilter: number | 'all'
  setDimension: (dimension: 'by_contractor' | 'by_region' | 'by_implementing_office' | 'by_status' | 'by_source_of_funds') => void
  setMetric: (metric: 'amount' | 'count' | 'avg') => void
  setYearFilter: (year: number | 'all') => void
  reset: () => void
}

export const useContractsAnalytics = (
  contracts: Contract[],
  filters: ContractFilters,
  dimension: 'by_contractor' | 'by_region' | 'by_implementing_office' | 'by_status' | 'by_source_of_funds' = 'by_contractor',
  metric: 'amount' | 'count' | 'avg' = 'amount',
  yearFilter: number | 'all' = 'all'
): UseContractsAnalyticsReturn => {
  // Apply filters manually (useContractFilters is a hook, not a function)
  const filteredContracts = useMemo(() => {
    let filtered = [...contracts]

    // Apply all filters (similar to useContractFilters logic)
    if (filters.regions.length > 0) {
      filtered = filtered.filter(c => filters.regions.includes(c.region))
    }
    if (filters.implementing_offices.length > 0) {
      filtered = filtered.filter(c => filters.implementing_offices.includes(c.implementing_office))
    }
    if (filters.contractors.length > 0) {
      filtered = filtered.filter(c => {
        const contractorNames = getContractorNames(c)
        return filters.contractors.some(filterContractor => 
          contractorNames.some(name => name.includes(filterContractor))
        )
      })
    }
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(c => filters.statuses.includes(c.status))
    }
    if (filters.years.length > 0) {
      filtered = filtered.filter(c => filters.years.includes(c.year))
    }
    if (filters.keywords.length > 0) {
      filtered = filtered.filter(c => {
        const searchText = `${c.description} ${c.contractor_name_1} ${c.region} ${c.implementing_office}`.toLowerCase()
        return filters.keywords.some(keyword => searchText.includes(keyword.toLowerCase()))
      })
    }
    if (filters.valueRange) {
      if (filters.valueRange.min !== undefined) {
        filtered = filtered.filter(c => c.cost_php !== null && c.cost_php >= filters.valueRange!.min!)
      }
      if (filters.valueRange.max !== undefined) {
        filtered = filtered.filter(c => c.cost_php !== null && c.cost_php <= filters.valueRange!.max!)
      }
    }
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

    return filtered
  }, [contracts, filters])

  // Apply year filter if specified
  const yearFilteredContracts = useMemo(() => {
    if (yearFilter === 'all') return filteredContracts
    return filteredContracts.filter(c => c.year === yearFilter)
  }, [filteredContracts, yearFilter])

  // Get aggregates
  const aggregates = useMemo(() => {
    if (yearFilteredContracts.length === 0) return null
    return getContractsAggregates(yearFilteredContracts)
  }, [yearFilteredContracts])

  // Process data based on dimension and metric
  const processedData = useMemo(() => {
    if (!aggregates) return []

    let entities: AggregatedEntity[] = []
    switch (dimension) {
      case 'by_contractor':
        entities = aggregates.by_contractor
        break
      case 'by_region':
        entities = aggregates.by_region
        break
      case 'by_implementing_office':
        entities = aggregates.by_implementing_office
        break
      case 'by_status':
        entities = aggregates.by_status
        break
    }

    return sortAggregatedEntities(entities, metric)
  }, [aggregates, dimension, metric])

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!aggregates || !aggregates.summary[0]) {
      return {
        totalContracts: 0,
        totalValue: 0,
        averageValue: 0
      }
    }

    const summary = aggregates.summary[0]
    return {
      totalContracts: summary.count,
      totalValue: summary.total_value,
      averageValue: summary.avg_value
    }
  }, [aggregates])

  return {
    aggregates,
    processedData,
    summaryStats,
    loading: false
  }
}

/**
 * Hook for analytics controls state
 */
export const useContractsAnalyticsControls = (): AnalyticsControls => {
  const [dimension, setDimension] = React.useState<'by_contractor' | 'by_region' | 'by_implementing_office' | 'by_status'>('by_contractor')
  const [metric, setMetric] = React.useState<'amount' | 'count' | 'avg'>('amount')
  const [yearFilter, setYearFilter] = React.useState<number | 'all'>('all')

  const reset = React.useCallback(() => {
    setDimension('by_contractor')
    setMetric('amount')
    setYearFilter('all')
  }, [])

  return {
    dimension,
    metric,
    yearFilter,
    setDimension,
    setMetric,
    setYearFilter,
    reset
  }
}


