import type { ExportConfig } from './useUnifiedExport'

// Utility function to create standardized timestamp
const createTimestamp = (): string => {
  return new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
         new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
}

// Pre-configured export configs for different use cases
export const createAdvancedSearchConfig = (): ExportConfig => ({
  type: 'streaming',
  dataSource: 'contracts',
  apiEndpoint: '/contracts/chip-export/',
  filename: `contracts_export_${createTimestamp()}.csv`,
  useStreamSaver: true
})

export const createDataExplorerConfig = (dimension: string): ExportConfig => {
  const baseEstimate = getEstimatedBytesPerRow('aggregated', dimension)
  return {
    type: 'streaming',
    dataSource: 'aggregated',
  apiEndpoint: '/contracts/chip-export-aggregated/',
    filename: `analytics_${dimension.replace('by_', '')}_${createTimestamp()}.csv`,
    useStreamSaver: true,
    estimateBytesPerRow: baseEstimate
  }
}

// New streaming config for Analytics Explorer  
export const createAnalyticsExplorerConfig = (dimension: string): ExportConfig => {
  const baseEstimate = getEstimatedBytesPerRow('aggregated', dimension)
  return {
    type: 'streaming',
    dataSource: 'aggregated', 
  apiEndpoint: '/contracts/chip-export-aggregated/',
    filename: `analytics_${dimension.replace('by_', '')}_${createTimestamp()}.csv`,
    useStreamSaver: true,
    estimateBytesPerRow: baseEstimate
  }
}

// New streaming config for Entity Drill Down (contracts)
export const createEntityDrillDownContractsConfig = (entityName: string, _entityType: string): ExportConfig => ({
  type: 'streaming',
  dataSource: 'contracts',
  apiEndpoint: '/contracts/chip-export/',
  filename: `entity_${entityName.replace(/[^a-zA-Z0-9]/g, '_')}_contracts_${createTimestamp()}.csv`,
  useStreamSaver: true,
  estimateBytesPerRow: getEstimatedBytesPerRow('contracts')
})

// New streaming config for Entity Drill Down (aggregates) 
export const createEntityDrillDownAggregatesConfig = (entityName: string, dimension: string): ExportConfig => {
  const baseEstimate = getEstimatedBytesPerRow('aggregated', dimension)
  return {
    type: 'streaming',
    dataSource: 'aggregated',
  apiEndpoint: '/contracts/chip-export-aggregated/', 
    filename: `entity_${entityName.replace(/[^a-zA-Z0-9]/g, '_')}_${dimension}_${createTimestamp()}.csv`,
    useStreamSaver: true,
    estimateBytesPerRow: baseEstimate
  }
}

// Legacy client-side config (kept for backwards compatibility)
export const createEntityDrillDownConfig = (entityName: string, activeTab: string): ExportConfig => ({
  type: 'client-side',
  dataSource: 'custom',
  filename: `entity_${entityName.replace(/[^a-zA-Z0-9]/g, '_')}_${activeTab}_${createTimestamp()}.csv`,
  headers: activeTab === 'contracts' 
    ? ['Reference ID', 'Notice Title', 'Award Title', 'Organization', 'Awardee', 'Category', 'Area', 'Contract Amount', 'Award Amount', 'Status', 'Contract No', 'Award Date']
    : ['Entity', 'Total Value', 'Contract Count', 'Average Value'],
  dataProcessor: (data: any[]) => {
    const headers = activeTab === 'contracts' 
      ? ['Reference ID', 'Notice Title', 'Award Title', 'Organization', 'Awardee', 'Category', 'Area', 'Contract Amount', 'Award Amount', 'Status', 'Contract No', 'Award Date']
      : ['Entity', 'Total Value', 'Contract Count', 'Average Value']
    
    const csvContent = [
      headers.join(','),
      ...data.map((item) => {
        if (activeTab === 'contracts') {
          return [
            `"${item.reference_id || ''}"`,
            `"${item.notice_title || ''}"`,
            `"${item.award_title || ''}"`,
            `"${item.organization_name || ''}"`,
            `"${item.awardee_name || ''}"`,
            `"${item.business_category || ''}"`,
            `"${item.area_of_delivery || ''}"`,
            item.contract_amount || 0,
            item.award_amount || 0,
            `"${item.award_status || ''}"`,
            `"${item.contract_no || ''}"`,
            `"${item.created_at || ''}"`
          ].join(',')
        } else {
          return [
            `"${item.label || ''}"`,
            item.total_value || 0,
            item.count || 0,
            ((item.total_value || 0) / Math.max(1, item.count || 0)).toFixed(2)
          ].join(',')
        }
      })
    ].join('\n')
    
    return csvContent
  }
})

export const createAnalyticsConfig = (dimension: string): ExportConfig => ({
  type: 'client-side',
  dataSource: 'analytics',
  filename: `analytics_${dimension}_${createTimestamp()}.csv`,
  headers: ['Rank', 'Entity', 'Total Value', 'Count', 'Average Value'],
  dataProcessor: (data: any[]) => {
    const headers = ['Rank', 'Entity', 'Total Value', 'Count', 'Average Value']
    const csvContent = [
      headers.join(','),
      ...data.map((item, index) => [
        index + 1,
        `"${item.label}"`,
        item.total_value || 0,
        item.count || 0,
        item.avg_value || 0
      ].join(','))
    ].join('\n')
    
    return csvContent
  }
})

// Helper function to create custom export configs
export const createCustomConfig = (
  type: 'streaming' | 'client-side',
  dataSource: 'contracts' | 'aggregated' | 'analytics' | 'custom',
  baseFilename: string,
  options: {
    apiEndpoint?: string
    headers?: string[]
    dataProcessor?: (data: any[]) => string
    useStreamSaver?: boolean
  } = {}
): ExportConfig => ({
  type,
  dataSource,
  filename: `${baseFilename}_${createTimestamp()}.csv`,
  ...options
})

// Export configuration validation
export const validateExportConfig = (config: ExportConfig): string[] => {
  const errors: string[] = []
  
  if (!config.filename) {
    errors.push('Filename is required')
  }
  
  if (config.type === 'streaming' && !config.apiEndpoint) {
    errors.push('API endpoint is required for streaming exports')
  }
  
  if (config.type === 'client-side' && !config.dataProcessor) {
    errors.push('Data processor is required for client-side exports')
  }
  
  if (!['streaming', 'client-side'].includes(config.type)) {
    errors.push('Export type must be either "streaming" or "client-side"')
  }
  
  if (!['contracts', 'aggregated', 'analytics', 'custom'].includes(config.dataSource)) {
    errors.push('Data source must be one of: contracts, aggregated, analytics, custom')
  }
  
  return errors
}

// Export size estimation helpers with improved accuracy
export const getEstimatedBytesPerRow = (dataSource: string, dimension?: string): number => {
  switch (dataSource) {
    case 'contracts':
      return 350 // Individual contract records are larger
    case 'aggregated':
      // More accurate estimates based on dimension
      switch (dimension) {
        case 'by_contractor':
          return 65 // Contractor names tend to be longer
        case 'by_organization':
          return 75 // Organization names are typically longer
        case 'by_area':
          return 45 // Area names are shorter
        case 'by_category':
          return 55 // Category names are medium length
        default:
          return 60 // Default aggregated data
      }
    case 'analytics':
      return 80 // Analytics data with calculations
    case 'custom':
      return 100 // Conservative estimate for custom data
    default:
      return 100
  }
}

// Historical accuracy tracking for estimates
let estimateAccuracyData: { estimated: number; actual: number; dataSource: string }[] = []

export const recordEstimateAccuracy = (estimated: number, actual: number, dataSource: string) => {
  estimateAccuracyData.push({ estimated, actual, dataSource })
  // Keep only last 50 records to prevent memory growth
  if (estimateAccuracyData.length > 50) {
    estimateAccuracyData = estimateAccuracyData.slice(-50)
  }
  console.log(`📊 Estimate accuracy: ${estimated} → ${actual} bytes (${((actual/estimated)*100).toFixed(1)}% of estimate)`)
}

export const getImprovedEstimate = (baseEstimate: number, dataSource: string): number => {
  const relevantData = estimateAccuracyData.filter(d => d.dataSource === dataSource)
  if (relevantData.length === 0) return baseEstimate
  
  // Calculate average accuracy ratio
  const accuracyRatio = relevantData.reduce((sum, d) => sum + (d.actual / d.estimated), 0) / relevantData.length
  const improvedEstimate = Math.round(baseEstimate * accuracyRatio)
  
  console.log(`🎯 Improved estimate for ${dataSource}: ${baseEstimate} → ${improvedEstimate} (${accuracyRatio.toFixed(2)}x factor)`)
  return improvedEstimate
}

// Memory threshold for StreamSaver usage
export const shouldUseStreamSaver = (estimatedBytes: number): boolean => {
  const STREAM_SAVER_THRESHOLD = 50 * 1024 * 1024 // 50MB
  return estimatedBytes > STREAM_SAVER_THRESHOLD
}

// Export filename sanitization
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}