/**
 * Analytics utilities for contracts data
 * Aggregates contracts by various dimensions
 */

import { Contract } from '../types/contracts'
import { getContractorNames } from '../types/contracts'

export interface AggregatedEntity {
  name: string
  total_value: number
  count: number
  avg_value: number
}

export interface YearlyAggregate {
  year: number
  total_value: number
  count: number
  avg_value: number
}

export interface MonthlyAggregate {
  month: string // Format: "YYYY-MM"
  total_value: number
  count: number
  avg_value: number
}

export interface QuarterlyAggregate {
  year: number
  quarter: number
  total_value: number
  count: number
  avg_value: number
}

export interface ContractsAggregates {
  summary: Array<{
    count: number
    total_value: number
    avg_value: number
  }>
  by_contractor: AggregatedEntity[]
  by_region: AggregatedEntity[]
  by_implementing_office: AggregatedEntity[]
  by_status: AggregatedEntity[]
  by_source_of_funds: AggregatedEntity[]
  by_year: YearlyAggregate[]
  by_month: MonthlyAggregate[]
  by_quarter: QuarterlyAggregate[]
}

/**
 * Aggregate contracts by contractor
 */
export const aggregateByContractor = (contracts: Contract[]): AggregatedEntity[] => {
  const map = new Map<string, { total_value: number; count: number }>()

  contracts.forEach(contract => {
    const contractors = getContractorNames(contract)
    const cost = contract.cost_php || 0

    contractors.forEach(contractor => {
      if (contractor) {
        const existing = map.get(contractor) || { total_value: 0, count: 0 }
        map.set(contractor, {
          total_value: existing.total_value + cost,
          count: existing.count + 1
        })
      }
    })
  })

  return Array.from(map.entries())
    .map(([name, data]) => ({
      name,
      total_value: data.total_value,
      count: data.count,
      avg_value: data.total_value / Math.max(1, data.count)
    }))
    .sort((a, b) => b.total_value - a.total_value)
}

/**
 * Aggregate contracts by region
 */
export const aggregateByRegion = (contracts: Contract[]): AggregatedEntity[] => {
  const map = new Map<string, { total_value: number; count: number }>()

  contracts.forEach(contract => {
    const region = contract.region || 'Unknown'
    const cost = contract.cost_php || 0

    const existing = map.get(region) || { total_value: 0, count: 0 }
    map.set(region, {
      total_value: existing.total_value + cost,
      count: existing.count + 1
    })
  })

  return Array.from(map.entries())
    .map(([name, data]) => ({
      name,
      total_value: data.total_value,
      count: data.count,
      avg_value: data.total_value / Math.max(1, data.count)
    }))
    .sort((a, b) => b.total_value - a.total_value)
}

/**
 * Aggregate contracts by implementing office
 */
export const aggregateByImplementingOffice = (contracts: Contract[]): AggregatedEntity[] => {
  const map = new Map<string, { total_value: number; count: number }>()

  contracts.forEach(contract => {
    const office = contract.implementing_office || 'Unknown'
    const cost = contract.cost_php || 0

    const existing = map.get(office) || { total_value: 0, count: 0 }
    map.set(office, {
      total_value: existing.total_value + cost,
      count: existing.count + 1
    })
  })

  return Array.from(map.entries())
    .map(([name, data]) => ({
      name,
      total_value: data.total_value,
      count: data.count,
      avg_value: data.total_value / Math.max(1, data.count)
    }))
    .sort((a, b) => b.total_value - a.total_value)
}

/**
 * Aggregate contracts by status
 */
export const aggregateByStatus = (contracts: Contract[]): AggregatedEntity[] => {
  const map = new Map<string, { total_value: number; count: number }>()

  contracts.forEach(contract => {
    const status = contract.status || 'Unknown'
    const cost = contract.cost_php || 0

    const existing = map.get(status) || { total_value: 0, count: 0 }
    map.set(status, {
      total_value: existing.total_value + cost,
      count: existing.count + 1
    })
  })

  return Array.from(map.entries())
    .map(([name, data]) => ({
      name,
      total_value: data.total_value,
      count: data.count,
      avg_value: data.total_value / Math.max(1, data.count)
    }))
    .sort((a, b) => b.total_value - a.total_value)
}

/**
 * Aggregate contracts by source of funds
 */
export const aggregateBySourceOfFunds = (contracts: Contract[]): AggregatedEntity[] => {
  const map = new Map<string, { total_value: number; count: number }>()

  contracts.forEach(contract => {
    const fund = contract.source_of_funds || 'Unknown'
    const cost = contract.cost_php || 0

    const existing = map.get(fund) || { total_value: 0, count: 0 }
    map.set(fund, {
      total_value: existing.total_value + cost,
      count: existing.count + 1
    })
  })

  return Array.from(map.entries())
    .map(([name, data]) => ({
      name,
      total_value: data.total_value,
      count: data.count,
      avg_value: data.total_value / Math.max(1, data.count)
    }))
    .sort((a, b) => b.total_value - a.total_value)
}

/**
 * Aggregate contracts by year
 */
export const aggregateByYear = (contracts: Contract[]): YearlyAggregate[] => {
  const map = new Map<number, { total_value: number; count: number }>()

  contracts.forEach(contract => {
    const year = contract.year
    if (!year) return

    const cost = contract.cost_php || 0
    const existing = map.get(year) || { total_value: 0, count: 0 }
    map.set(year, {
      total_value: existing.total_value + cost,
      count: existing.count + 1
    })
  })

  return Array.from(map.entries())
    .map(([year, data]) => ({
      year,
      total_value: data.total_value,
      count: data.count,
      avg_value: data.total_value / Math.max(1, data.count)
    }))
    .sort((a, b) => a.year - b.year)
}

/**
 * Aggregate contracts by month
 */
export const aggregateByMonth = (contracts: Contract[]): MonthlyAggregate[] => {
  const map = new Map<string, { total_value: number; count: number }>()

  contracts.forEach(contract => {
    const effectivityDate = contract.effectivity_date
    if (!effectivityDate) return

    try {
      const date = new Date(effectivityDate)
      if (isNaN(date.getTime())) return

      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const cost = contract.cost_php || 0

      const existing = map.get(month) || { total_value: 0, count: 0 }
      map.set(month, {
        total_value: existing.total_value + cost,
        count: existing.count + 1
      })
    } catch {
      // Skip invalid dates
    }
  })

  return Array.from(map.entries())
    .map(([month, data]) => ({
      month,
      total_value: data.total_value,
      count: data.count,
      avg_value: data.total_value / Math.max(1, data.count)
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Aggregate contracts by quarter
 */
export const aggregateByQuarter = (contracts: Contract[]): QuarterlyAggregate[] => {
  const map = new Map<string, { year: number; quarter: number; total_value: number; count: number }>()

  contracts.forEach(contract => {
    const effectivityDate = contract.effectivity_date
    if (!effectivityDate) return

    try {
      const date = new Date(effectivityDate)
      if (isNaN(date.getTime())) return

      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const quarter = Math.ceil(month / 3)
      const key = `${year}-Q${quarter}`

      const cost = contract.cost_php || 0
      const existing = map.get(key) || { year, quarter, total_value: 0, count: 0 }
      map.set(key, {
        year,
        quarter,
        total_value: existing.total_value + cost,
        count: existing.count + 1
      })
    } catch {
      // Skip invalid dates
    }
  })

  return Array.from(map.values())
    .map(data => ({
      year: data.year,
      quarter: data.quarter,
      total_value: data.total_value,
      count: data.count,
      avg_value: data.total_value / Math.max(1, data.count)
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.quarter - b.quarter
    })
}

/**
 * Get all aggregates for contracts
 */
export const getContractsAggregates = (contracts: Contract[]): ContractsAggregates => {
  const totalValue = contracts.reduce((sum, c) => sum + (c.cost_php || 0), 0)
  const count = contracts.length
  const avgValue = count > 0 ? totalValue / count : 0

  return {
    summary: [{
      count,
      total_value: totalValue,
      avg_value: avgValue
    }],
    by_contractor: aggregateByContractor(contracts),
    by_region: aggregateByRegion(contracts),
    by_implementing_office: aggregateByImplementingOffice(contracts),
    by_status: aggregateByStatus(contracts),
    by_source_of_funds: aggregateBySourceOfFunds(contracts),
    by_year: aggregateByYear(contracts),
    by_month: aggregateByMonth(contracts),
    by_quarter: aggregateByQuarter(contracts)
  }
}

/**
 * Filter aggregated entities by metric and sort
 */
export const sortAggregatedEntities = (
  entities: AggregatedEntity[],
  metric: 'amount' | 'count' | 'avg',
  limit?: number
): AggregatedEntity[] => {
  let sorted = [...entities]

  switch (metric) {
    case 'amount':
      sorted.sort((a, b) => b.total_value - a.total_value)
      break
    case 'count':
      sorted.sort((a, b) => b.count - a.count)
      break
    case 'avg':
      sorted.sort((a, b) => b.avg_value - a.avg_value)
      break
  }

  if (limit) {
    sorted = sorted.slice(0, limit)
  }

  return sorted
}

