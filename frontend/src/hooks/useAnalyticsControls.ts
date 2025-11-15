import { useState, useCallback } from 'react'

export type DimensionType = 'by_contractor' | 'by_organization' | 'by_area' | 'by_category'
export type MetricType = 'amount' | 'count' | 'avg'
export type TimeGranularityType = 'year' | 'quarter'

export interface AnalyticsControlsState {
  dimension: DimensionType
  metric: MetricType
  yearFilter: number | 'all'
  timeGranularity: TimeGranularityType
}

export interface AnalyticsControlsActions {
  setDimension: (dimension: DimensionType) => void
  setMetric: (metric: MetricType) => void
  setYearFilter: (year: number | 'all') => void
  setTimeGranularity: (granularity: TimeGranularityType) => void
  reset: () => void
}

export const useAnalyticsControls = (): AnalyticsControlsState & AnalyticsControlsActions => {
  const [dimension, setDimension] = useState<DimensionType>('by_contractor')
  const [metric, setMetric] = useState<MetricType>('amount')
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularityType>('year')

  const reset = useCallback(() => {
    setDimension('by_contractor')
    setMetric('amount')
    setYearFilter('all')
    setTimeGranularity('year')
  }, [])

  return {
    dimension,
    metric,
    yearFilter,
    timeGranularity,
    setDimension,
    setMetric,
    setYearFilter,
    setTimeGranularity,
    reset
  }
}
