import { EntityDataService } from './EntityDataService'
import { ContractDataService } from './ContractDataService'
import { AnalyticsDataService } from './AnalyticsDataService'
import { resolveUrl } from '../utils/api'
import type { 
  EntityType, 
  DatasetType, 
  TimeRange, 
  SortDirection
} from '../types/DataExplorer'

export interface UnifiedDataServiceConfig {
  baseUrl?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  enableCaching?: boolean
  cacheTimeout?: number
}

export class UnifiedDataServiceImproved {
  private entityService: EntityDataService
  private contractService: ContractDataService
  private analyticsService: AnalyticsDataService
  private cache: Map<string, { data: any; timestamp: number }>
  private config: Required<UnifiedDataServiceConfig>

  constructor(config: UnifiedDataServiceConfig = {}) {
    const baseUrl = config.baseUrl || resolveUrl('/data-processing')

    this.config = {
      baseUrl: String(baseUrl).replace(/\/$/, ''),
      timeout: 8000,
      retries: 1,
      retryDelay: 300,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      ...config,
    }

  this.entityService = new EntityDataService(this.config.baseUrl)
  this.contractService = new ContractDataService(this.config.baseUrl)
  this.analyticsService = new AnalyticsDataService(this.config.baseUrl)
    this.cache = new Map()

    // Configure services with the same config
    this.entityService.addRequestInterceptor((config: any) => ({
      ...config,
      timeout: this.config.timeout,
      retries: this.config.retries,
      retryDelay: this.config.retryDelay,
    }))

    this.contractService.addRequestInterceptor((config: any) => ({
      ...config,
      timeout: this.config.timeout,
      retries: this.config.retries,
      retryDelay: this.config.retryDelay,
    }))

    this.analyticsService.addRequestInterceptor((config: any) => ({
      ...config,
      timeout: this.config.timeout,
      retries: this.config.retries,
      retryDelay: this.config.retryDelay,
    }))
  }

  // Cache management
  private getCacheKey(prefix: string, params: Record<string, any>): string {
    return `${prefix}:${JSON.stringify(params)}`
  }

  private getFromCache<T>(key: string): T | null {
    if (!this.config.enableCaching) return null

    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.config.cacheTimeout) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  private setCache<T>(key: string, data: T): void {
    if (!this.config.enableCaching) return

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }


  // Entity methods
  async queryEntities(
    entityType: DatasetType,
    pageIndex: number = 0,
    pageSize: number = 10,
    timeRange: TimeRange = { type: 'all_time' },
    searchQuery?: string,
    sortBy: string = 'total_contract_value',
    sortDir: SortDirection = 'DESC',
    includeFloodControl: boolean = false
  ) {
    const params = {
      entityType,
      pageIndex,
      pageSize,
      timeRange,
      searchQuery,
      sortBy,
      sortDir,
      includeFloodControl,
    }

    const cacheKey = this.getCacheKey('queryEntities', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.entityService.queryEntities(params)
    this.setCache(cacheKey, result)
    return result
  }

  async getEntityDetails(
    entityType: EntityType,
    entityId: string,
    timeRange?: TimeRange
  ) {
    const params = { entityType, entityId, timeRange }
    const cacheKey = this.getCacheKey('getEntityDetails', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.entityService.getEntityDetails(entityType, entityId, timeRange)
    this.setCache(cacheKey, result)
    return result
  }

  async searchEntities(
    entityType: DatasetType,
    query: string,
    limit: number = 10
  ) {
    const params = { entityType, query, limit }
    const cacheKey = this.getCacheKey('searchEntities', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.entityService.searchEntities(entityType, query, limit)
    this.setCache(cacheKey, result)
    return result
  }

  async getEntityStats(
    entityType: DatasetType,
    timeRange?: TimeRange
  ) {
    const params = { entityType, timeRange }
    const cacheKey = this.getCacheKey('getEntityStats', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.entityService.getEntityStats(entityType, timeRange)
    this.setCache(cacheKey, result)
    return result
  }

  // Contract methods
  async queryContracts(
    entityType: EntityType,
    entityValue: string,
    pageIndex: number = 0,
    pageSize: number = 10,
    timeRange?: TimeRange,
    sortBy: string = 'contract_value',
    sortDir: SortDirection = 'DESC',
    includeFloodControl: boolean = false
  ) {
    const params = {
      entityType,
      entityValue,
      pageIndex,
      pageSize,
      timeRange,
      sortBy,
      sortDir,
      includeFloodControl,
    }

    const cacheKey = this.getCacheKey('queryContracts', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.contractService.queryContracts(params)
    this.setCache(cacheKey, result)
    return result
  }

  async searchContracts(
    query: string,
    pageIndex: number = 0,
    pageSize: number = 10,
    timeRange?: TimeRange,
    sortBy: string = 'contract_value',
    sortDir: SortDirection = 'DESC',
    includeFloodControl: boolean = false
  ) {
    const params = {
      query,
      pageIndex,
      pageSize,
      timeRange,
      sortBy,
      sortDir,
      includeFloodControl,
    }

    const cacheKey = this.getCacheKey('searchContracts', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.contractService.searchContracts(params)
    this.setCache(cacheKey, result)
    return result
  }

  async getContractDetails(contractId: string) {
    const params = { contractId }
    const cacheKey = this.getCacheKey('getContractDetails', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.contractService.getContractDetails(contractId)
    this.setCache(cacheKey, result)
    return result
  }

  async getContractStats(
    entityType?: EntityType,
    entityValue?: string,
    timeRange?: TimeRange
  ) {
    const params = { entityType, entityValue, timeRange }
    const cacheKey = this.getCacheKey('getContractStats', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.contractService.getContractStats(entityType, entityValue, timeRange)
    this.setCache(cacheKey, result)
    return result
  }

  async getContractQuarterlyTrends(
    entityType?: EntityType,
    entityValue?: string,
    timeRange?: TimeRange
  ) {
    const params = { entityType, entityValue, timeRange }
    const cacheKey = this.getCacheKey('getContractQuarterlyTrends', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.contractService.getQuarterlyTrends(entityType, entityValue, timeRange)
    this.setCache(cacheKey, result)
    return result
  }

  // Analytics methods
  async loadGlobalTotals() {
    const cacheKey = 'globalTotals'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.analyticsService.loadGlobalTotals()
    this.setCache(cacheKey, result)
    return result
  }

  async getAnalyticsData(timeRange?: TimeRange) {
    const params = { timeRange }
    const cacheKey = this.getCacheKey('getAnalyticsData', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.analyticsService.getAnalyticsData(timeRange)
    this.setCache(cacheKey, result)
    return result
  }

  async getYearlyTrends(startYear?: number, endYear?: number) {
    const params = { startYear, endYear }
    const cacheKey = this.getCacheKey('getYearlyTrends', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.analyticsService.getYearlyTrends(startYear, endYear)
    this.setCache(cacheKey, result)
    return result
  }

  async getQuarterlyTrends(
    year?: number,
    startQuarter?: number,
    endQuarter?: number
  ) {
    const params = { year, startQuarter, endQuarter }
    const cacheKey = this.getCacheKey('getQuarterlyTrends', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.analyticsService.getQuarterlyTrends(year, startQuarter, endQuarter)
    this.setCache(cacheKey, result)
    return result
  }

  async getMonthlyTrends(
    year?: number,
    startMonth?: number,
    endMonth?: number
  ) {
    const params = { year, startMonth, endMonth }
    const cacheKey = this.getCacheKey('getMonthlyTrends', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.analyticsService.getMonthlyTrends(year, startMonth, endMonth)
    this.setCache(cacheKey, result)
    return result
  }

  async getComparisonData(period1: TimeRange, period2: TimeRange) {
    const params = { period1, period2 }
    const cacheKey = this.getCacheKey('getComparisonData', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.analyticsService.getComparisonData(period1, period2)
    this.setCache(cacheKey, result)
    return result
  }

  async getTopPerformers(
    entityType: 'contractors' | 'organizations' | 'areas' | 'categories',
    limit: number = 10,
    timeRange?: TimeRange
  ) {
    const params = { entityType, limit, timeRange }
    const cacheKey = this.getCacheKey('getTopPerformers', params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = await this.analyticsService.getTopPerformers(entityType, limit, timeRange)
    this.setCache(cacheKey, result)
    return result
  }

  // Utility methods
  clearCache() {
    this.cache.clear()
  }

  getCacheSize() {
    return this.cache.size
  }

  // Backward compatibility methods
  async getChunkData(_chunkInfo: any) {
    // This method is kept for backward compatibility
    // In the new architecture, this would be handled by the entity service
    console.warn('getChunkData is deprecated. Use queryEntities instead.')
    return this.queryEntities('contractors', 0, 10)
  }

  async getDataReference() {
    // This method is kept for backward compatibility
    // In the new architecture, this would be handled by the analytics service
    console.warn('getDataReference is deprecated. Use loadGlobalTotals instead.')
    return this.loadGlobalTotals()
  }
}

// Create and export a singleton instance
// Use environment variable for API URL
export const unifiedDataServiceImproved = new UnifiedDataServiceImproved({
  baseUrl: resolveUrl('/data-processing')
})
