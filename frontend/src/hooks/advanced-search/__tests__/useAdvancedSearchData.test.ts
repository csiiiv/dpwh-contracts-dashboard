import { renderHook, act } from '@testing-library/react'
import { useAdvancedSearchData } from '../useAdvancedSearchData'
import { advancedSearchService } from '../../../../services/AdvancedSearchService'

// Mock the services
jest.mock('../../../../services/AdvancedSearchService')
const mockAdvancedSearchService = advancedSearchService as jest.Mocked<typeof advancedSearchService>

describe('useAdvancedSearchData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useAdvancedSearchData())
      
      expect(result.current.searchResults).toEqual([])
      expect(result.current.aggregates).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.hasSearched).toBe(false)
      expect(result.current.analyticsLoading).toBe(false)
    })

    it('should initialize with correct utility values', () => {
      const { result } = renderHook(() => useAdvancedSearchData())
      
      expect(result.current.hasResults).toBe(false)
      expect(result.current.getResultCount()).toBe(0)
      expect(result.current.getAggregateCount()).toBe(0)
    })
  })

  describe('Search Functionality', () => {
    it('should perform search successfully', async () => {
      const mockResults = [
        {
          id: 1,
          reference_id: 'REF-001',
          notice_title: 'Test Notice 1',
          award_title: 'Test Award 1',
          organization_name: 'Test Organization',
          awardee_name: 'Test Contractor',
          business_category: 'Test Category',
          area_of_delivery: 'Test Area',
          contract_amount: 100000,
          award_amount: 95000,
          award_status: 'Active',
          contract_no: 'CON-001',
          created_at: '2023-01-01'
        }
      ]

      const mockAggregates = {
        contractors: [{ name: 'Test Contractor', count: 1, total_amount: 100000 }],
        areas: [{ name: 'Test Area', count: 1, total_amount: 100000 }],
        organizations: [{ name: 'Test Organization', count: 1, total_amount: 100000 }],
        business_categories: [{ name: 'Test Category', count: 1, total_amount: 100000 }]
      }

      mockAdvancedSearchService.searchContractsWithChips.mockResolvedValue({
        success: true,
        data: mockResults,
        pagination: {
          page: 1,
          page_size: 20,
          total_count: 1,
          total_pages: 1
        }
      })

      mockAdvancedSearchService.chipAggregates.mockResolvedValue({
        success: true,
        data: mockAggregates
      })

      const { result } = renderHook(() => useAdvancedSearchData())

      await act(async () => {
        await result.current.performSearch({
          contractors: [],
          areas: [],
          organizations: [],
          businessCategories: [],
          keywords: [],
          timeRanges: [],
          includeFloodControl: true
        })
      })

      expect(result.current.searchResults).toEqual(mockResults)
      expect(result.current.aggregates).toEqual(mockAggregates)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.hasSearched).toBe(true)
      expect(result.current.analyticsLoading).toBe(false)
      expect(result.current.hasResults).toBe(true)
      expect(result.current.getResultCount()).toBe(1)
      expect(result.current.getAggregateCount()).toBe(4)
    })

    it('should handle search failure', async () => {
      mockAdvancedSearchService.searchContractsWithChips.mockResolvedValue({
        success: false,
        message: 'Search failed'
      })

      mockAdvancedSearchService.chipAggregates.mockResolvedValue({
        success: false,
        message: 'Aggregates failed'
      })

      const { result } = renderHook(() => useAdvancedSearchData())

      await act(async () => {
        await result.current.performSearch({
          contractors: [],
          areas: [],
          organizations: [],
          businessCategories: [],
          keywords: [],
          timeRanges: [],
          includeFloodControl: true
        })
      })

      expect(result.current.searchResults).toEqual([])
      expect(result.current.aggregates).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Search failed')
      expect(result.current.hasSearched).toBe(false)
      expect(result.current.hasResults).toBe(false)
    })

    it('should handle search error', async () => {
      mockAdvancedSearchService.searchContractsWithChips.mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useAdvancedSearchData())

      await act(async () => {
        await result.current.performSearch({
          contractors: [],
          areas: [],
          organizations: [],
          businessCategories: [],
          keywords: [],
          timeRanges: [],
          includeFloodControl: true
        })
      })

      expect(result.current.searchResults).toEqual([])
      expect(result.current.aggregates).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Search failed. Please try again.')
      expect(result.current.hasSearched).toBe(false)
    })

    it('should handle aggregates failure while search succeeds', async () => {
      const mockResults = [
        {
          id: 1,
          reference_id: 'REF-001',
          notice_title: 'Test Notice 1',
          award_title: 'Test Award 1',
          organization_name: 'Test Organization',
          awardee_name: 'Test Contractor',
          business_category: 'Test Category',
          area_of_delivery: 'Test Area',
          contract_amount: 100000,
          award_amount: 95000,
          award_status: 'Active',
          contract_no: 'CON-001',
          created_at: '2023-01-01'
        }
      ]

      mockAdvancedSearchService.searchContractsWithChips.mockResolvedValue({
        success: true,
        data: mockResults,
        pagination: {
          page: 1,
          page_size: 20,
          total_count: 1,
          total_pages: 1
        }
      })

      mockAdvancedSearchService.chipAggregates.mockResolvedValue({
        success: false,
        message: 'Aggregates failed'
      })

      const { result } = renderHook(() => useAdvancedSearchData())

      await act(async () => {
        await result.current.performSearch({
          contractors: [],
          areas: [],
          organizations: [],
          businessCategories: [],
          keywords: [],
          timeRanges: [],
          includeFloodControl: true
        })
      })

      expect(result.current.searchResults).toEqual(mockResults)
      expect(result.current.aggregates).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.hasSearched).toBe(true)
    })
  })

  describe('Utility Functions', () => {
    it('should clear results', () => {
      const { result } = renderHook(() => useAdvancedSearchData())

      // Set some initial state
      act(() => {
        result.current.searchResults = [
          {
            id: 1,
            reference_id: 'REF-001',
            notice_title: 'Test Notice 1',
            award_title: 'Test Award 1',
            organization_name: 'Test Organization',
            awardee_name: 'Test Contractor',
            business_category: 'Test Category',
            area_of_delivery: 'Test Area',
            contract_amount: 100000,
            award_amount: 95000,
            award_status: 'Active',
            contract_no: 'CON-001',
            created_at: '2023-01-01'
          }
        ]
        result.current.aggregates = {
          contractors: [{ name: 'Test Contractor', count: 1, total_amount: 100000 }]
        }
        result.current.hasSearched = true
        result.current.loading = true
        result.current.error = 'Some error'
        result.current.analyticsLoading = true
      })

      act(() => {
        result.current.clearResults()
      })

      expect(result.current.searchResults).toEqual([])
      expect(result.current.aggregates).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.hasSearched).toBe(false)
      expect(result.current.loading).toBe(false)
      expect(result.current.analyticsLoading).toBe(false)
    })

    it('should set error', () => {
      const { result } = renderHook(() => useAdvancedSearchData())

      act(() => {
        result.current.setError('Test error')
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.setError(null)
      })

      expect(result.current.error).toBeNull()
    })

    it('should correctly identify hasResults', () => {
      const { result } = renderHook(() => useAdvancedSearchData())

      expect(result.current.hasResults).toBe(false)

      act(() => {
        result.current.searchResults = [
          {
            id: 1,
            reference_id: 'REF-001',
            notice_title: 'Test Notice 1',
            award_title: 'Test Award 1',
            organization_name: 'Test Organization',
            awardee_name: 'Test Contractor',
            business_category: 'Test Category',
            area_of_delivery: 'Test Area',
            contract_amount: 100000,
            award_amount: 95000,
            award_status: 'Active',
            contract_no: 'CON-001',
            created_at: '2023-01-01'
          }
        ]
      })

      expect(result.current.hasResults).toBe(true)
    })

    it('should correctly count results', () => {
      const { result } = renderHook(() => useAdvancedSearchData())

      expect(result.current.getResultCount()).toBe(0)

      act(() => {
        result.current.searchResults = [
          {
            id: 1,
            reference_id: 'REF-001',
            notice_title: 'Test Notice 1',
            award_title: 'Test Award 1',
            organization_name: 'Test Organization',
            awardee_name: 'Test Contractor',
            business_category: 'Test Category',
            area_of_delivery: 'Test Area',
            contract_amount: 100000,
            award_amount: 95000,
            award_status: 'Active',
            contract_no: 'CON-001',
            created_at: '2023-01-01'
          },
          {
            id: 2,
            reference_id: 'REF-002',
            notice_title: 'Test Notice 2',
            award_title: 'Test Award 2',
            organization_name: 'Test Organization 2',
            awardee_name: 'Test Contractor 2',
            business_category: 'Test Category 2',
            area_of_delivery: 'Test Area 2',
            contract_amount: 200000,
            award_amount: 190000,
            award_status: 'Active',
            contract_no: 'CON-002',
            created_at: '2023-01-02'
          }
        ]
      })

      expect(result.current.getResultCount()).toBe(2)
    })

    it('should correctly count aggregates', () => {
      const { result } = renderHook(() => useAdvancedSearchData())

      expect(result.current.getAggregateCount()).toBe(0)

      act(() => {
        result.current.aggregates = {
          contractors: [
            { name: 'Contractor 1', count: 1, total_amount: 100000 },
            { name: 'Contractor 2', count: 2, total_amount: 200000 }
          ],
          areas: [
            { name: 'Area 1', count: 1, total_amount: 100000 }
          ],
          organizations: [],
          business_categories: [
            { name: 'Category 1', count: 1, total_amount: 100000 },
            { name: 'Category 2', count: 1, total_amount: 100000 }
          ]
        }
      })

      expect(result.current.getAggregateCount()).toBe(5) // 2 + 1 + 0 + 2
    })
  })

  describe('Loading States', () => {
    it('should set loading state during search', async () => {
      let resolveSearch: (value: any) => void
      const searchPromise = new Promise(resolve => {
        resolveSearch = resolve
      })

      mockAdvancedSearchService.searchContractsWithChips.mockReturnValue(searchPromise as any)
      mockAdvancedSearchService.chipAggregates.mockResolvedValue({
        success: true,
        data: {}
      })

      const { result } = renderHook(() => useAdvancedSearchData())

      act(() => {
        result.current.performSearch({
          contractors: [],
          areas: [],
          organizations: [],
          businessCategories: [],
          keywords: [],
          timeRanges: [],
          includeFloodControl: true
        })
      })

      expect(result.current.loading).toBe(true)
      expect(result.current.analyticsLoading).toBe(true)

      await act(async () => {
        resolveSearch!({
          success: true,
          data: [],
          pagination: { page: 1, page_size: 20, total_count: 0, total_pages: 0 }
        })
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.analyticsLoading).toBe(false)
    })
  })
})
