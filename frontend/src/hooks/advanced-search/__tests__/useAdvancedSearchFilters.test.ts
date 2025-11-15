import { renderHook, act } from '@testing-library/react'
import { useAdvancedSearchFilters } from '../useAdvancedSearchFilters'

describe('useAdvancedSearchFilters', () => {
  beforeEach(() => {
    // Reset any mocks or state before each test
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty filters', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      expect(result.current.filters.contractors).toEqual([])
      expect(result.current.filters.areas).toEqual([])
      expect(result.current.filters.organizations).toEqual([])
      expect(result.current.filters.business_categories).toEqual([])
      expect(result.current.filters.keywords).toEqual([])
      expect(result.current.filters.timeRanges).toEqual([])
    })

    it('should initialize with empty keyword input', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      expect(result.current.keywordInput).toBe('')
    })

    it('should initialize with flood control enabled', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      expect(result.current.includeFloodControl).toBe(true)
    })

    it('should initialize with all_time date range', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      expect(result.current.dateRange.type).toBe('all_time')
      expect(result.current.dateRange.year).toBe(2021)
      expect(result.current.dateRange.quarter).toBe(4)
      expect(result.current.dateRange.startDate).toBe('2013-01-01')
      expect(result.current.dateRange.endDate).toBe('2024-12-31')
    })

    it('should initialize with no active filters', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      expect(result.current.hasActiveFilters).toBe(false)
      expect(result.current.getActiveFilterCount()).toBe(0)
      expect(result.current.getFilterSummary()).toBe('No filters')
    })
  })

  describe('Filter Management', () => {
    it('should add contractor filter', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.addFilter('contractors', 'Test Contractor')
      })
      
      expect(result.current.filters.contractors).toContain('Test Contractor')
      expect(result.current.hasActiveFilters).toBe(true)
      expect(result.current.getActiveFilterCount()).toBe(1)
    })

    it('should add area filter', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.addFilter('areas', 'Test Area')
      })
      
      expect(result.current.filters.areas).toContain('Test Area')
      expect(result.current.hasActiveFilters).toBe(true)
      expect(result.current.getActiveFilterCount()).toBe(1)
    })

    it('should add organization filter', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.addFilter('organizations', 'Test Organization')
      })
      
      expect(result.current.filters.organizations).toContain('Test Organization')
      expect(result.current.hasActiveFilters).toBe(true)
      expect(result.current.getActiveFilterCount()).toBe(1)
    })

    it('should add business category filter', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.addFilter('business_categories', 'Test Category')
      })
      
      expect(result.current.filters.business_categories).toContain('Test Category')
      expect(result.current.hasActiveFilters).toBe(true)
      expect(result.current.getActiveFilterCount()).toBe(1)
    })

    it('should not add duplicate filters', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.addFilter('contractors', 'Test Contractor')
        result.current.addFilter('contractors', 'Test Contractor')
      })
      
      expect(result.current.filters.contractors).toHaveLength(1)
      expect(result.current.filters.contractors).toContain('Test Contractor')
    })

    it('should not add empty filters', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.addFilter('contractors', '')
        result.current.addFilter('contractors', '   ')
      })
      
      expect(result.current.filters.contractors).toHaveLength(0)
    })

    it('should remove filter by index', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.addFilter('contractors', 'Test Contractor 1')
        result.current.addFilter('contractors', 'Test Contractor 2')
        result.current.removeFilter('contractors', 0)
      })
      
      expect(result.current.filters.contractors).toEqual(['Test Contractor 2'])
      expect(result.current.hasActiveFilters).toBe(true)
      expect(result.current.getActiveFilterCount()).toBe(1)
    })

    it('should clear all filters', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.addFilter('contractors', 'Test Contractor')
        result.current.addFilter('areas', 'Test Area')
        result.current.clearAllFilters()
      })
      
      expect(result.current.filters.contractors).toEqual([])
      expect(result.current.filters.areas).toEqual([])
      expect(result.current.filters.organizations).toEqual([])
      expect(result.current.filters.business_categories).toEqual([])
      expect(result.current.filters.keywords).toEqual([])
      expect(result.current.filters.timeRanges).toEqual([])
      expect(result.current.keywordInput).toBe('')
      expect(result.current.dateRange.type).toBe('all_time')
      expect(result.current.hasActiveFilters).toBe(false)
      expect(result.current.getActiveFilterCount()).toBe(0)
    })
  })

  describe('Keyword Management', () => {
    it('should add keyword', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.addKeyword('Test Keyword')
      })
      
      expect(result.current.filters.keywords).toContain('Test Keyword')
      expect(result.current.keywordInput).toBe('')
    })

    it('should add keyword via input change and add', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.setKeywordInput('Test Keyword')
        result.current.handleKeywordAdd()
      })
      
      expect(result.current.filters.keywords).toContain('Test Keyword')
      expect(result.current.keywordInput).toBe('')
    })

    it('should add keyword via Enter key', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.setKeywordInput('Test Keyword')
        result.current.handleKeywordKeyDown({ key: 'Enter' } as React.KeyboardEvent)
      })
      
      expect(result.current.filters.keywords).toContain('Test Keyword')
      expect(result.current.keywordInput).toBe('')
    })

    it('should not add keyword via other keys', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.setKeywordInput('Test Keyword')
        result.current.handleKeywordKeyDown({ key: 'Space' } as React.KeyboardEvent)
      })
      
      expect(result.current.filters.keywords).toEqual([])
      expect(result.current.keywordInput).toBe('Test Keyword')
    })

    it('should trim keyword whitespace', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.addKeyword('  Test Keyword  ')
      })
      
      expect(result.current.filters.keywords).toContain('Test Keyword')
    })

    it('should not add empty keyword', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.addKeyword('')
        result.current.addKeyword('   ')
      })
      
      expect(result.current.filters.keywords).toEqual([])
    })

    it('should not add duplicate keywords', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.addKeyword('Test Keyword')
        result.current.addKeyword('Test Keyword')
      })
      
      expect(result.current.filters.keywords).toHaveLength(1)
      expect(result.current.filters.keywords).toContain('Test Keyword')
    })
  })

  describe('Date Range Management', () => {
    it('should change date range type to yearly', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.setDateRangeType('yearly')
      })
      
      expect(result.current.dateRange.type).toBe('yearly')
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should change date range type to quarterly', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.setDateRangeType('quarterly')
      })
      
      expect(result.current.dateRange.type).toBe('quarterly')
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should change date range type to custom', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.setDateRangeType('custom')
      })
      
      expect(result.current.dateRange.type).toBe('custom')
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should change date range year', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.setDateRangeYear(2023)
      })
      
      expect(result.current.dateRange.year).toBe(2023)
    })

    it('should change date range quarter', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.setDateRangeQuarter(2)
      })
      
      expect(result.current.dateRange.quarter).toBe(2)
    })

    it('should change date range start date', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.setDateRangeStartDate('2023-01-01')
      })
      
      expect(result.current.dateRange.startDate).toBe('2023-01-01')
    })

    it('should change date range end date', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      act(() => {
        result.current.setDateRangeEndDate('2023-12-31')
      })
      
      expect(result.current.dateRange.endDate).toBe('2023-12-31')
    })
  })

  describe('Flood Control Management', () => {
    it('should toggle flood control inclusion', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      expect(result.current.includeFloodControl).toBe(true)
      
      act(() => {
        result.current.setIncludeFloodControl(false)
      })
      
      expect(result.current.includeFloodControl).toBe(false)
    })
  })

  describe('Utility Functions', () => {
    it('should correctly identify active filters', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      // Initially no active filters
      expect(result.current.hasActiveFilters).toBe(false)
      
      // Add a filter
      act(() => {
        result.current.addFilter('contractors', 'Test Contractor')
      })
      
      expect(result.current.hasActiveFilters).toBe(true)
      
      // Change date range
      act(() => {
        result.current.setDateRangeType('yearly')
      })
      
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should correctly count active filters', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      // Initially no active filters
      expect(result.current.getActiveFilterCount()).toBe(0)
      
      // Add multiple filters
      act(() => {
        result.current.addFilter('contractors', 'Test Contractor 1')
        result.current.addFilter('contractors', 'Test Contractor 2')
        result.current.addFilter('areas', 'Test Area')
        result.current.addKeyword('Test Keyword')
        result.current.setDateRangeType('yearly')
      })
      
      expect(result.current.getActiveFilterCount()).toBe(5) // 3 filters + 1 keyword + 1 date range
    })

    it('should generate correct filter summary', () => {
      const { result } = renderHook(() => useAdvancedSearchFilters())
      
      // Initially no filters
      expect(result.current.getFilterSummary()).toBe('No filters')
      
      // Add contractors
      act(() => {
        result.current.addFilter('contractors', 'Test Contractor 1')
        result.current.addFilter('contractors', 'Test Contractor 2')
      })
      
      expect(result.current.getFilterSummary()).toBe('2 contractors')
      
      // Add areas
      act(() => {
        result.current.addFilter('areas', 'Test Area')
      })
      
      expect(result.current.getFilterSummary()).toBe('2 contractors, 1 area')
      
      // Add keywords
      act(() => {
        result.current.addKeyword('Test Keyword')
      })
      
      expect(result.current.getFilterSummary()).toBe('2 contractors, 1 area, 1 keyword')
      
      // Add date range
      act(() => {
        result.current.setDateRangeType('yearly')
      })
      
      expect(result.current.getFilterSummary()).toBe('2 contractors, 1 area, 1 keyword, date range')
    })
  })
})
