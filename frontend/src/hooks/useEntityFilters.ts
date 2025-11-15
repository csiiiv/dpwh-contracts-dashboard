import { useState, useCallback, useEffect } from 'react'
import { advancedSearchService } from '../services/AdvancedSearchService'

export type DatasetType = 'contractors' | 'organizations' | 'areas' | 'categories'
export type TimeRangeType = 'all_time' | 'yearly' | 'quarterly' | 'custom'

export interface EntityFiltersState {
  dataset: DatasetType
  selectedEntity: string | null
  timeRange: TimeRangeType
  selectedYear: number
  selectedQuarter: number
  customStartDate: string
  customEndDate: string
  includeFloodControl: boolean
  entityOptions: Array<{ value: string; label: string }>
  loadingEntities: boolean
}

export interface EntityFiltersActions {
  setDataset: (dataset: DatasetType) => void
  setSelectedEntity: (entity: string | null) => void
  setTimeRange: (range: TimeRangeType) => void
  setSelectedYear: (year: number) => void
  setSelectedQuarter: (quarter: number) => void
  setCustomStartDate: (date: string) => void
  setCustomEndDate: (date: string) => void
  setIncludeFloodControl: (include: boolean) => void
  reset: () => void
}

export const useEntityFilters = (): EntityFiltersState & EntityFiltersActions => {
  const [dataset, setDataset] = useState<DatasetType>('contractors')
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRangeType>('all_time')
  const [selectedYear, setSelectedYear] = useState(2021)
  const [selectedQuarter, setSelectedQuarter] = useState(4)
  const [customStartDate, setCustomStartDate] = useState('2013-01-01')
  const [customEndDate, setCustomEndDate] = useState('2025-12-31')
  const [includeFloodControl, setIncludeFloodControl] = useState(true)
  const [entityOptions, setEntityOptions] = useState<Array<{ value: string; label: string }>>([])
  const [loadingEntities, setLoadingEntities] = useState(false)

  const fetchEntityOptions = useCallback(async () => {
    setLoadingEntities(true)
    try {
      const response = await advancedSearchService.chipAggregates({
        contractors: [],
        areas: [],
        organizations: [],
        businessCategories: [],
        keywords: [],
        timeRanges: [],
        includeFloodControl: false,
        valueRange: undefined
      })
      
      if (response.data) {
        const entities = response.data[dataset] || []
        const options = entities.slice(0, 100).map((entity: any) => ({
          value: entity.label,
          label: entity.label
        }))
        setEntityOptions(options)
      }
    } catch (error) {
      console.error('Failed to fetch entity options:', error)
      setEntityOptions([])
    } finally {
      setLoadingEntities(false)
    }
  }, [dataset])

  useEffect(() => {
    fetchEntityOptions()
  }, [fetchEntityOptions])

  const reset = useCallback(() => {
    setDataset('contractors')
    setSelectedEntity(null)
    setTimeRange('all_time')
    setSelectedYear(2021)
    setSelectedQuarter(4)
    setCustomStartDate('2013-01-01')
    setCustomEndDate('2025-12-31')
    setIncludeFloodControl(true)
  }, [])

  return {
    dataset,
    selectedEntity,
    timeRange,
    selectedYear,
    selectedQuarter,
    customStartDate,
    customEndDate,
    includeFloodControl,
    entityOptions,
    loadingEntities,
    setDataset,
    setSelectedEntity,
    setTimeRange,
    setSelectedYear,
    setSelectedQuarter,
    setCustomStartDate,
    setCustomEndDate,
    setIncludeFloodControl,
    reset
  }
}
