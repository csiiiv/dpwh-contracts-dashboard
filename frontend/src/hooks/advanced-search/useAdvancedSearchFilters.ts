import { useState, useCallback, useEffect } from 'react'
import { FilterPersistence } from '../../utils/filterPersistence'

export interface FilterState {
  contractors: string[]
  areas: string[]
  organizations: string[]
  business_categories: string[]
  keywords: string[]
  timeRanges: string[]
  valueRange?: {
    min?: number
    max?: number
  }
}

export interface DateRangeState {
  type: 'all_time' | 'yearly' | 'quarterly' | 'custom'
  year: number
  quarter: number
  startDate: string
  endDate: string
}

export interface UseAdvancedSearchFiltersReturn {
  // Filter state
  filters: FilterState
  keywordInput: string
  includeFloodControl: boolean
  dateRange: DateRangeState
  
  // Filter actions
  addFilter: (type: keyof FilterState, value: string) => void
  removeFilter: (type: keyof FilterState, index: number) => void
  clearAllFilters: () => void
  clearContractors: () => void
  clearAreas: () => void
  clearOrganizations: () => void
  clearBusinessCategories: () => void
  
  // Keyword actions
  addKeyword: (keyword: string) => void
  setKeywordInput: (value: string) => void
  handleKeywordKeyDown: (e: React.KeyboardEvent) => void
  handleKeywordAdd: () => void
  
  // Date range actions
  setDateRange: (dateRange: DateRangeState) => void
  setDateRangeType: (type: DateRangeState['type']) => void
  setDateRangeYear: (year: number) => void
  setDateRangeQuarter: (quarter: number) => void
  setDateRangeStartDate: (startDate: string) => void
  setDateRangeEndDate: (endDate: string) => void
  
  // Flood control actions
  setIncludeFloodControl: (value: boolean) => void
  
  // Value range actions
  setValueRange: (valueRange: FilterState['valueRange']) => void
  
  // Utility functions
  hasActiveFilters: boolean
  getActiveFilterCount: () => number
  getFilterSummary: () => string
  
  // Persistence functions
  saveCurrentFilter: (name: string, description?: string) => string
  loadLastUsedFilter: () => void
  clearAllSavedFilters: () => void
}

export const useAdvancedSearchFilters = (): UseAdvancedSearchFiltersReturn => {
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    contractors: [],
    areas: [],
    organizations: [],
    business_categories: [],
    keywords: [],
    timeRanges: []
  })

  // Keyword input state
  const [keywordInput, setKeywordInput] = useState('')
  const [debouncedKeywordInput, setDebouncedKeywordInput] = useState('')

  // Flood control dataset toggle
  const [includeFloodControl, setIncludeFloodControl] = useState(true)

  // Value range state
  const [valueRange, setValueRange] = useState<FilterState['valueRange']>(undefined)

  // Date range state
  const [dateRange, setDateRange] = useState<DateRangeState>({
    type: 'all_time',
    year: 2021,
    quarter: 4,
    startDate: '2013-01-01',
    endDate: '2025-12-31'
  })

  // Debounce keyword input with 300ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedKeywordInput(keywordInput)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [keywordInput])

  // Filter management functions
  const addFilter = useCallback((type: keyof FilterState, value: string) => {
    console.log('➕ useAdvancedSearchFilters - addFilter called:', { type, value, currentFilters: filters })
    if (value && !filters[type].includes(value)) {
      setFilters(prev => {
        const newFilters = {
          ...prev,
          [type]: [...prev[type], value]
        }
        console.log('✅ useAdvancedSearchFilters - filter added:', { type, value, newFilters })
        return newFilters
      })
    } else {
      console.log('❌ useAdvancedSearchFilters - filter not added:', { reason: !value ? 'empty value' : 'already exists' })
    }
  }, [filters])

  const removeFilter = useCallback((type: keyof FilterState, index: number) => {
    console.log('➖ useAdvancedSearchFilters - removeFilter called:', { type, index })
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }
      console.log('✅ useAdvancedSearchFilters - filter removed:', { type, index, newFilters })
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    console.log('🧹 useAdvancedSearchFilters - clearAllFilters called')
    setFilters({
      contractors: [],
      areas: [],
      organizations: [],
      business_categories: [],
      keywords: [],
      timeRanges: []
    })
    setKeywordInput('')
    setValueRange(undefined)
    setDateRange({
      type: 'all_time',
      year: 2021,
      quarter: 4,
      startDate: '2013-01-01',
      endDate: '2025-12-31'
    })
    console.log('✅ useAdvancedSearchFilters - all filters cleared')
  }, [])

  // Per-group clear functions
  const clearContractors = useCallback(() => {
    setFilters(prev => ({ ...prev, contractors: [] }))
    console.log('🧹 useAdvancedSearchFilters - contractors cleared')
  }, [])
  
  const clearAreas = useCallback(() => {
    setFilters(prev => ({ ...prev, areas: [] }))
    console.log('🧹 useAdvancedSearchFilters - areas cleared')
  }, [])
  
  const clearOrganizations = useCallback(() => {
    setFilters(prev => ({ ...prev, organizations: [] }))
    console.log('🧹 useAdvancedSearchFilters - organizations cleared')
  }, [])
  
  const clearBusinessCategories = useCallback(() => {
    setFilters(prev => ({ ...prev, business_categories: [] }))
    console.log('🧹 useAdvancedSearchFilters - business_categories cleared')
  }, [])

  // Generic per-group clear function
  const clearFilterGroup = useCallback((type: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [type]: []
    }))
    console.log('🧹 useAdvancedSearchFilters - group cleared:', type)
  }, [])

  // Keyword management functions
  const addKeyword = useCallback((keyword: string) => {
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword && !filters.keywords.includes(trimmedKeyword)) {
      setFilters(prev => ({
        ...prev,
        keywords: [...prev.keywords, trimmedKeyword]
      }))
      setKeywordInput('')
      console.log('✅ useAdvancedSearchFilters - keyword added:', trimmedKeyword)
    } else {
      console.log('❌ useAdvancedSearchFilters - keyword not added:', { reason: !trimmedKeyword ? 'empty value' : 'already exists' })
    }
  }, [filters.keywords])

  const handleKeywordKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword(keywordInput)
    }
  }, [keywordInput, addKeyword])

  const handleKeywordAdd = useCallback(() => {
    addKeyword(keywordInput)
  }, [keywordInput, addKeyword])

  // Date range management functions
  const setDateRangeType = useCallback((type: DateRangeState['type']) => {
    setDateRange(prev => ({ ...prev, type }))
    console.log('📅 useAdvancedSearchFilters - date range type changed:', type)
  }, [])

  const setDateRangeYear = useCallback((year: number) => {
    setDateRange(prev => ({ ...prev, year }))
    console.log('📅 useAdvancedSearchFilters - date range year changed:', year)
  }, [])

  const setDateRangeQuarter = useCallback((quarter: number) => {
    setDateRange(prev => ({ ...prev, quarter }))
    console.log('📅 useAdvancedSearchFilters - date range quarter changed:', quarter)
  }, [])

  const setDateRangeStartDate = useCallback((startDate: string) => {
    // Let the HTML5 date input handle validation - just store the value
    setDateRange(prev => {
      console.log('📅 useAdvancedSearchFilters - updating startDate from', prev.startDate, 'to', startDate)
      return { ...prev, startDate }
    })
    console.log('📅 useAdvancedSearchFilters - date range start date changed:', startDate)
  }, [])

  const setDateRangeEndDate = useCallback((endDate: string) => {
    // Let the HTML5 date input handle validation - just store the value
    setDateRange(prev => ({ ...prev, endDate }))
    console.log('📅 useAdvancedSearchFilters - date range end date changed:', endDate)
  }, [])

  // Utility functions
  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(filterArray => filterArray.length > 0) || 
           dateRange.type !== 'all_time' ||
           (valueRange && (valueRange.min !== undefined || valueRange.max !== undefined))
  }, [filters, dateRange.type, valueRange])

  const getActiveFilterCount = useCallback(() => {
    const filterCount = Object.values(filters).reduce((total, filterArray) => total + filterArray.length, 0)
    const dateRangeCount = dateRange.type !== 'all_time' ? 1 : 0
    const valueRangeCount = (valueRange && (valueRange.min !== undefined || valueRange.max !== undefined)) ? 1 : 0
    return filterCount + dateRangeCount + valueRangeCount
  }, [filters, dateRange.type, valueRange])

  const getFilterSummary = useCallback(() => {
    const parts = []
    
    if (filters.contractors.length > 0) {
      parts.push(`${filters.contractors.length} contractor${filters.contractors.length > 1 ? 's' : ''}`)
    }
    if (filters.areas.length > 0) {
      parts.push(`${filters.areas.length} area${filters.areas.length > 1 ? 's' : ''}`)
    }
    if (filters.organizations.length > 0) {
      parts.push(`${filters.organizations.length} organization${filters.organizations.length > 1 ? 's' : ''}`)
    }
    if (filters.business_categories.length > 0) {
      parts.push(`${filters.business_categories.length} categor${filters.business_categories.length > 1 ? 'ies' : 'y'}`)
    }
    if (filters.keywords.length > 0) {
      parts.push(`${filters.keywords.length} keyword${filters.keywords.length > 1 ? 's' : ''}`)
    }
    if (dateRange.type !== 'all_time') {
      parts.push('date range')
    }
    if (valueRange && (valueRange.min !== undefined || valueRange.max !== undefined)) {
      const minStr = valueRange.min ? `₱${(valueRange.min / 1000000).toFixed(1)}M` : '₱0'
      const maxStr = valueRange.max ? `₱${(valueRange.max / 1000000).toFixed(1)}M` : '∞'
      parts.push(`value range (${minStr} - ${maxStr})`)
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No filters'
  }, [filters, dateRange.type, valueRange])

  // Persistence functions
  const saveCurrentFilter = useCallback((name: string, description?: string): string => {
    console.log('💾 useAdvancedSearchFilters - saveCurrentFilter called:', { name, description })
    
    const filterId = FilterPersistence.saveFilter({
      name,
      description,
      filters: { ...filters, valueRange }, // Include valueRange in the filters object
      dateRange,
      includeFloodControl
    })
    
    console.log('✅ useAdvancedSearchFilters - filter saved with ID:', filterId)
    return filterId
  }, [filters, valueRange, dateRange, includeFloodControl])

  const loadLastUsedFilter = useCallback(() => {
    console.log('📂 useAdvancedSearchFilters - loadLastUsedFilter called')
    
    const lastUsed = FilterPersistence.loadLastUsedFilter()
    if (lastUsed) {
      setFilters(lastUsed.filters)
      setValueRange(lastUsed.filters.valueRange) // Add this line to restore valueRange
      setDateRange(lastUsed.dateRange)
      setIncludeFloodControl(lastUsed.includeFloodControl)
      console.log('✅ useAdvancedSearchFilters - last used filter loaded:', lastUsed)
    } else {
      console.log('ℹ️ useAdvancedSearchFilters - no last used filter found')
    }
  }, [])

  const clearAllSavedFilters = useCallback(() => {
    console.log('🧹 useAdvancedSearchFilters - clearAllSavedFilters called')
    FilterPersistence.clearAllSavedFilters()
    console.log('✅ useAdvancedSearchFilters - all saved filters cleared')
  }, [])

  // Auto-save current filter state when it changes
  useEffect(() => {
    // Only save if there are active filters
    const hasActive = Object.values(filters).some(filterArray => filterArray.length > 0) || 
                     dateRange.type !== 'all_time' ||
                     (valueRange && (valueRange.min !== undefined || valueRange.max !== undefined))
    if (hasActive) {
      FilterPersistence.saveLastUsedFilter({ ...filters, valueRange }, dateRange, includeFloodControl)
    }
  }, [filters, valueRange, dateRange, includeFloodControl])

  return {
    // Filter state
    filters,
    keywordInput,
    includeFloodControl,
    dateRange,
    valueRange,
    
    // Filter actions
    addFilter,
    removeFilter,
    clearAllFilters,
    clearFilterGroup,
    clearContractors,
    clearAreas,
    clearOrganizations,
    clearBusinessCategories,
    
    // Keyword actions
    addKeyword,
    setKeywordInput,
    handleKeywordKeyDown,
    handleKeywordAdd,
    
    // Date range actions
    setDateRange,
    setDateRangeType,
    setDateRangeYear,
    setDateRangeQuarter,
    setDateRangeStartDate,
    setDateRangeEndDate,
    
    // Flood control actions
    setIncludeFloodControl,
    
    // Value range actions
    setValueRange,
    
    // Utility functions
    hasActiveFilters: hasActiveFilters(),
    getActiveFilterCount,
    getFilterSummary,
    
    // Persistence functions
    saveCurrentFilter,
    loadLastUsedFilter,
    clearAllSavedFilters
  }
}
