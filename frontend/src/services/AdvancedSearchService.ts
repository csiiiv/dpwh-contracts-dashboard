/**
 * Advanced Search Service for contracts
 */

export interface SearchFilters {
  contractor: string
  area: string
  organization: string
  businessCategory: string
  keywords: string
  timeRange: {
    type: 'all_time' | 'yearly' | 'quarterly' | 'custom'
    year?: number
    quarter?: number
    startDate?: string
    endDate?: string
  }
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface ChipSearchParams {
  contractors: string[]
  areas: string[]
  organizations: string[]
  businessCategories: string[]
  keywords: string[]
  timeRanges: Array<{
    type: 'yearly' | 'quarterly' | 'custom'
    year?: number
    quarter?: number
    startDate?: string
    endDate?: string
  }>
  page?: number
  pageSize?: number
  topN?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  includeFloodControl?: boolean
  dimension?: string
  valueRange?: {
    min?: number
    max?: number
  }
}

export interface SearchResult {
  id: number
  reference_id: string
  notice_title: string
  award_title: string
  organization_name: string
  awardee_name: string
  business_category: string
  area_of_delivery: string
  contract_amount: number
  award_date: string
  award_status: string
  contract_no: string
  created_at: string
}

export interface SearchResponse {
  data: SearchResult[]
  pagination: {
    page: number
    page_size: number
    total_count: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
  filters_applied: {
    contractor: string
    area: string
    organization: string
    business_category: string
    keywords: string
    time_range: string
  }
}

export interface TimeRange {
  type: 'all_time' | 'yearly' | 'quarterly'
  year?: number
  quarter?: string
}

export interface FilterOptions {
  contractors: string[]
  areas: string[]
  organizations: string[]
  business_categories: string[]
  years?: number[]
}

export interface ChipAggregatesResponse {
  data: {
    summary: Array<{ count: number; total_value: number; avg_value: number }>
    by_year: Array<{ year: number; total_value: number; count: number }>
    by_month: Array<{ month: string; total_value: number; count: number }>
    by_contractor: Array<{ label: string; total_value: number; count: number }>
    by_organization: Array<{ label: string; total_value: number; count: number }>
    by_area: Array<{ label: string; total_value: number; count: number }>
    by_category: Array<{ label: string; total_value: number; count: number }>
  }
}

export interface ChipAggregatesPaginatedResponse {
  data: Array<{ label: string; total_value: number; count: number; avg_value: number }>
  pagination: {
    current_page: number
    page_size: number
    total_count: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

export interface ExportEstimateResponse {
  total_count: number
  estimated_csv_bytes: number
}

import { resolveUrl } from '../utils/api'

export class AdvancedSearchService {
  private baseUrl: string

  constructor(baseUrl?: string) {
    // Prefer explicit baseUrl argument, otherwise resolve from shared helper
    if (baseUrl) {
      this.baseUrl = baseUrl.replace(/\/$/, '')
    } else {
      // Use centralized resolver to normalize API root and version prefix
      // resolveUrl('/') will return either `${root}/api/v1` or `/api/v1` when root is empty
      this.baseUrl = resolveUrl('/')
    }
  }

  // Helper function to provide default value range when undefined or empty
  private getDefaultValueRange(valueRange?: { min?: number; max?: number; } | null): { min?: number; max?: number; } | null {
    if (!valueRange || (valueRange.min === undefined && valueRange.max === undefined)) {
      return { min: 0, max: 1000000000000 } // Default to min 0 and max 1T
    }
    return valueRange
  }

  /**
   * Perform advanced search for contracts
   */
  async searchContracts(filters: SearchFilters): Promise<SearchResponse> {
    try {
      // Create a clean payload to avoid circular references
      const payload = {
        contractor: filters.contractor || '',
        area: filters.area || '',
        organization: filters.organization || '',
        business_category: filters.businessCategory || '',
        keywords: filters.keywords || '',
        time_range: filters.timeRange?.type || 'all_time',
        year: filters.timeRange?.year,
        quarter: filters.timeRange?.quarter,
        page: filters.page || 1,
        page_size: filters.pageSize || 20,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      }
      
      const response = await fetch(`${this.baseUrl}/contracts/advanced-search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        // Try to read JSON error body for a clearer message
        let errMsg = response.statusText || `HTTP ${response.status}`
        try {
          const errBody = await response.json()
          if (errBody && (errBody.error || errBody.message)) {
            errMsg = errBody.error || errBody.message
          }
        } catch (e) {
          // ignore JSON parse errors and keep statusText
        }
        console.error('AdvancedSearchService - searchContracts non-ok response:', response.status, response.statusText)
        throw new Error(`Search failed: ${errMsg}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Advanced search error:', error)
      throw new Error('Failed to perform search. Please try again.')
    }
  }

  /**
   * Perform search with filter chips (multiple values per filter type)
   */
  async searchContractsWithChips(params: ChipSearchParams): Promise<SearchResponse> {
    try {
      const payload = {
        contractors: params.contractors || [],
        areas: params.areas || [],
        organizations: params.organizations || [],
        business_categories: params.businessCategories || [],
        keywords: params.keywords || [],
        time_ranges: params.timeRanges || [],
        page: params.page || 1,
        page_size: params.pageSize || 20,
        sortBy: params.sortBy,
        sortDirection: params.sortDirection,
        include_flood_control: params.includeFloodControl || false,
        value_range: this.getDefaultValueRange(params.valueRange)
      }
      
      // Debug logging
      console.log('🚀 AdvancedSearchService - sending payload:', payload)
      
      const response = await fetch(`${this.baseUrl}/contracts/chip-search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        // Attempt to parse backend JSON error to provide actionable message
        let errMsg = response.statusText || `HTTP ${response.status}`
        try {
          const errBody = await response.json()
          // errBody can be many shapes: {error: '...'}, {message: '...'}, {'detail': '...'}, or a dict of field->list
          if (errBody) {
            if (typeof errBody === 'string') {
              errMsg = errBody
            } else if (errBody.error || errBody.message || errBody.detail) {
              errMsg = errBody.error || errBody.message || errBody.detail
            } else if (typeof errBody === 'object') {
              // Build concise message from serializer errors object
              const parts: string[] = []
              for (const [k, v] of Object.entries(errBody)) {
                if (Array.isArray(v)) {
                  parts.push(`${k}: ${v.join(', ')}`)
                } else if (typeof v === 'string') {
                  parts.push(`${k}: ${v}`)
                } else {
                  parts.push(`${k}: ${JSON.stringify(v)}`)
                }
              }
              if (parts.length) errMsg = parts.join('; ')
            }
          }
        } catch (e) {
          // ignore parse errors
        }
        console.error('AdvancedSearchService - searchContractsWithChips non-ok response:', response.status, response.statusText)
        throw new Error(`Search failed: ${errMsg} (status ${response.status})`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Chip search error:', error)
      throw new Error('Failed to perform search. Please try again.')
    }
  }

  async chipAggregates(params: ChipSearchParams): Promise<ChipAggregatesResponse> {
    const payload = {
      contractors: params.contractors || [],
      areas: params.areas || [],
      organizations: params.organizations || [],
      business_categories: params.businessCategories || [],
      keywords: params.keywords || [],
      time_ranges: params.timeRanges || [],
      topN: params.topN || 20,
      include_flood_control: params.includeFloodControl || false,
      value_range: this.getDefaultValueRange(params.valueRange)
    }

    console.log('🔍 chipAggregates request payload:', JSON.stringify(payload, null, 2))

    const response = await fetch(`${this.baseUrl}/contracts/chip-aggregates/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ chipAggregates error response:', response.status, errorText)
      throw new Error(`Aggregates failed: ${response.statusText}`)
    }
    return response.json()
  }

  async chipAggregatesPaginated(params: ChipSearchParams & { dimension: string }): Promise<ChipAggregatesPaginatedResponse> {
    const payload = {
      contractors: params.contractors || [],
      areas: params.areas || [],
      organizations: params.organizations || [],
      business_categories: params.businessCategories || [],
      keywords: params.keywords || [],
      time_ranges: params.timeRanges || [],
      page: params.page || 1,
      page_size: params.pageSize || 20,
      dimension: params.dimension || 'by_contractor',
      sort_by: params.sortBy || 'total_value',
      sort_direction: params.sortDirection || 'desc',
      include_flood_control: params.includeFloodControl || false,
      value_range: this.getDefaultValueRange(params.valueRange)
    }

    const response = await fetch(`${this.baseUrl}/contracts/chip-aggregates-paginated/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      throw new Error(`Paginated aggregates failed: ${response.statusText}`)
    }
    return response.json()
  }

  async chipExportEstimate(params: ChipSearchParams): Promise<ExportEstimateResponse> {
    const payload = {
      contractors: params.contractors || [],
      areas: params.areas || [],
      organizations: params.organizations || [],
      business_categories: params.businessCategories || [],
      keywords: params.keywords || [],
      time_ranges: params.timeRanges || [],
      include_flood_control: params.includeFloodControl || false,
      value_range: this.getDefaultValueRange(params.valueRange)
    }
    const response = await fetch(`${this.baseUrl}/contracts/chip-export-estimate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) throw new Error('Estimate failed')
    return response.json()
  }

  async chipExport(params: ChipSearchParams): Promise<Blob> {
    const payload = {
      contractors: params.contractors || [],
      areas: params.areas || [],
      organizations: params.organizations || [],
      business_categories: params.businessCategories || [],
      keywords: params.keywords || [],
      time_ranges: params.timeRanges || [],
      value_range: this.getDefaultValueRange(params.valueRange)
    }
    const response = await fetch(`${this.baseUrl}/contracts/chip-export/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) throw new Error('Export failed')
    return response.blob()
  }

  async chipExportAggregated(params: ChipSearchParams & { dimension: string }): Promise<Blob> {
    const payload = {
      contractors: params.contractors || [],
      areas: params.areas || [],
      organizations: params.organizations || [],
      business_categories: params.businessCategories || [],
      keywords: params.keywords || [],
      time_ranges: params.timeRanges || [],
      dimension: params.dimension || 'by_contractor',
      include_flood_control: params.includeFloodControl || false,
      value_range: this.getDefaultValueRange(params.valueRange)
    }
    const response = await fetch(`${this.baseUrl}/contracts/chip-export-aggregated/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) throw new Error('Aggregated export failed')
    return response.blob()
  }

  async chipExportAggregatedEstimate(params: ChipSearchParams & { dimension: string }): Promise<ExportEstimateResponse> {
    const payload = {
      contractors: params.contractors || [],
      areas: params.areas || [],
      organizations: params.organizations || [],
      business_categories: params.businessCategories || [],
      keywords: params.keywords || [],
      time_ranges: params.timeRanges || [],
      dimension: params.dimension || 'by_contractor',
      include_flood_control: params.includeFloodControl || false,
      value_range: this.getDefaultValueRange(params.valueRange)
    }
    const response = await fetch(`${this.baseUrl}/contracts/chip-export-aggregated-estimate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) throw new Error('Aggregated export estimate failed')
    return response.json()
  }

  /**
   * Get filter options for dropdowns
   */
  async getFilterOptions(): Promise<FilterOptions> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts/filter-options/?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to load filter options: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Filter options error:', error)
      throw new Error('Failed to load filter options. Please try again.')
    }
  }
}

// Export singleton instance
export const advancedSearchService = new AdvancedSearchService()
