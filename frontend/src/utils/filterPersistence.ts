import { FilterState, DateRangeState } from '../hooks/advanced-search/useAdvancedSearchFilters'

export interface SavedFilter {
  id: string
  name: string
  description?: string
  filters: FilterState
  dateRange: DateRangeState
  includeFloodControl: boolean
  createdAt: string
  updatedAt: string
}

export interface PredefinedFilter {
  id: string
  name: string
  description: string
  filters: FilterState
  dateRange: DateRangeState
  includeFloodControl: boolean
}

const STORAGE_KEYS = {
  SAVED_FILTERS: 'advancedSearch_savedFilters',
  LAST_USED_FILTER: 'advancedSearch_lastUsedFilter'
} as const

export class FilterPersistence {
  /**
   * Save a filter configuration to localStorage
   */
  static saveFilter(filter: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'>): string {
    if (typeof window === 'undefined') {
      throw new Error('localStorage is not available')
    }

    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const savedFilter: SavedFilter = {
      ...filter,
      id,
      createdAt: now,
      updatedAt: now
    }

    try {
      const existingFilters = this.getSavedFilters()
      const updatedFilters = [...existingFilters, savedFilter]
      
      localStorage.setItem(STORAGE_KEYS.SAVED_FILTERS, JSON.stringify(updatedFilters))
      
      console.log('✅ Filter saved successfully:', { id, name: filter.name })
      return id
    } catch (error) {
      console.error('❌ Failed to save filter:', error)
      throw new Error('Failed to save filter. Please try again.')
    }
  }

  /**
   * Update an existing saved filter
   */
  static updateFilter(id: string, updates: Partial<Omit<SavedFilter, 'id' | 'createdAt'>>): boolean {
    if (typeof window === 'undefined') {
      throw new Error('localStorage is not available')
    }

    try {
      const existingFilters = this.getSavedFilters()
      const filterIndex = existingFilters.findIndex(filter => filter.id === id)
      
      if (filterIndex === -1) {
        throw new Error('Filter not found')
      }

      const updatedFilter: SavedFilter = {
        ...existingFilters[filterIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      existingFilters[filterIndex] = updatedFilter
      localStorage.setItem(STORAGE_KEYS.SAVED_FILTERS, JSON.stringify(existingFilters))
      
      console.log('✅ Filter updated successfully:', { id, name: updatedFilter.name })
      return true
    } catch (error) {
      console.error('❌ Failed to update filter:', error)
      throw new Error('Failed to update filter. Please try again.')
    }
  }

  /**
   * Delete a saved filter
   */
  static deleteFilter(id: string): boolean {
    if (typeof window === 'undefined') {
      throw new Error('localStorage is not available')
    }

    try {
      const existingFilters = this.getSavedFilters()
      const updatedFilters = existingFilters.filter(filter => filter.id !== id)
      
      localStorage.setItem(STORAGE_KEYS.SAVED_FILTERS, JSON.stringify(updatedFilters))
      
      console.log('✅ Filter deleted successfully:', { id })
      return true
    } catch (error) {
      console.error('❌ Failed to delete filter:', error)
      throw new Error('Failed to delete filter. Please try again.')
    }
  }

  /**
   * Get all saved filters
   */
  static getSavedFilters(): SavedFilter[] {
    if (typeof window === 'undefined') {
      return []
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_FILTERS)
      if (!stored) {
        return []
      }
      
      const filters = JSON.parse(stored) as SavedFilter[]
      return Array.isArray(filters) ? filters : []
    } catch (error) {
      console.error('❌ Failed to load saved filters:', error)
      return []
    }
  }

  /**
   * Get a specific saved filter by ID
   */
  static getSavedFilter(id: string): SavedFilter | null {
    const filters = this.getSavedFilters()
    return filters.find(filter => filter.id === id) || null
  }

  /**
   * Save the last used filter configuration
   */
  static saveLastUsedFilter(filters: FilterState, dateRange: DateRangeState, includeFloodControl: boolean): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const lastUsedFilter = {
        filters,
        dateRange,
        includeFloodControl,
        timestamp: Date.now()
      }
      
      localStorage.setItem(STORAGE_KEYS.LAST_USED_FILTER, JSON.stringify(lastUsedFilter))
    } catch (error) {
      console.error('❌ Failed to save last used filter:', error)
    }
  }

  /**
   * Load the last used filter configuration
   */
  static loadLastUsedFilter(): {
    filters: FilterState
    dateRange: DateRangeState
    includeFloodControl: boolean
  } | null {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAST_USED_FILTER)
      if (!stored) {
        return null
      }
      
      const lastUsedFilter = JSON.parse(stored)
      
      // Check if the data is not too old (e.g., 30 days)
      const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
      if (Date.now() - lastUsedFilter.timestamp > maxAge) {
        localStorage.removeItem(STORAGE_KEYS.LAST_USED_FILTER)
        return null
      }
      
      return {
        filters: lastUsedFilter.filters,
        dateRange: lastUsedFilter.dateRange,
        includeFloodControl: lastUsedFilter.includeFloodControl
      }
    } catch (error) {
      console.error('❌ Failed to load last used filter:', error)
      return null
    }
  }

  /**
   * Clear all saved filters
   */
  static clearAllSavedFilters(): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.SAVED_FILTERS)
      localStorage.removeItem(STORAGE_KEYS.LAST_USED_FILTER)
      console.log('✅ All saved filters cleared')
    } catch (error) {
      console.error('❌ Failed to clear saved filters:', error)
    }
  }

  /**
   * Export saved filters as JSON
   */
  static exportFilters(): string {
    const filters = this.getSavedFilters()
    return JSON.stringify(filters, null, 2)
  }

  /**
   * Import filters from JSON string
   */
  static importFilters(jsonData: string): { success: number; errors: string[] }
  
  /**
   * Import filters from array of filter objects
   */
  static importFilters(filters: SavedFilter[]): number
  
  static importFilters(data: string | SavedFilter[]): { success: number; errors: string[] } | number {
    if (typeof window === 'undefined') {
      throw new Error('localStorage is not available')
    }

    try {
      let importedFilters: SavedFilter[]
      
      if (typeof data === 'string') {
        // Parse JSON string
        importedFilters = JSON.parse(data) as SavedFilter[]
      } else {
        // Use array directly
        importedFilters = data
      }
      
      if (!Array.isArray(importedFilters)) {
        throw new Error('Invalid data format')
      }

      const existingFilters = this.getSavedFilters()
      const existingIds = new Set(existingFilters.map(f => f.id))
      
      let successCount = 0
      const errors: string[] = []
      
      for (const filter of importedFilters) {
        try {
          // Validate required fields
          if (!filter.id || !filter.name || !filter.filters || !filter.dateRange) {
            errors.push(`Invalid filter: ${filter.name || 'Unknown'}`)
            continue
          }
          
          // Generate new ID if it already exists
          if (existingIds.has(filter.id)) {
            filter.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
          
          // Add to existing filters
          existingFilters.push({
            ...filter,
            createdAt: filter.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          
          successCount++
        } catch (error) {
          errors.push(`Failed to import filter: ${filter.name || 'Unknown'}`)
        }
      }
      
      localStorage.setItem(STORAGE_KEYS.SAVED_FILTERS, JSON.stringify(existingFilters))
      
      // Return appropriate type based on input
      if (typeof data === 'string') {
        return { success: successCount, errors }
      } else {
        return successCount
      }
    } catch (error) {
      console.error('❌ Failed to import filters:', error)
      throw new Error('Failed to import filters. Please check the data format.')
    }
  }
}
