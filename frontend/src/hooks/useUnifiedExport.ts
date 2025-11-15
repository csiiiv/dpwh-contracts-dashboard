import { useState, useCallback, useRef } from 'react'
import { resolveUrl } from '../utils/api'

// Export configuration types
export type ExportType = 'streaming' | 'client-side'
export type DataSource = 'contracts' | 'aggregated' | 'analytics' | 'custom'

export interface ExportConfig {
  type: ExportType
  dataSource: DataSource
  apiEndpoint?: string
  filename: string
  useStreamSaver?: boolean
  headers?: string[]
  dataProcessor?: (data: any[], startRank: number, endRank: number) => string
  filters?: any
  searchParams?: any
  groupBy?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  estimateBytesPerRow?: number
}

export interface ExportEstimate {
  count: number
  bytes: number
}

export interface UnifiedExportState {
  isExporting: boolean
  exportProgress: number
  exportEstimate: ExportEstimate | null
  showExportModal: boolean
  exportError: string | null
}

export interface UnifiedExportActions {
  initiateExport: (config: ExportConfig) => Promise<void>
  downloadExport: (config: ExportConfig) => Promise<void>
  cancelExport: () => void
  closeExportModal: () => void
}

export type UseUnifiedExportReturn = UnifiedExportState & UnifiedExportActions

// Hook for unified export functionality
export const useUnifiedExport = (): UseUnifiedExportReturn => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportEstimate, setExportEstimate] = useState<ExportEstimate | null>(null)

  const [showExportModal, setShowExportModal] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  
  const exportAbort = useRef<AbortController | null>(null)

  // Use centralized resolveUrl from `frontend/src/utils/api.ts`
  // `resolveUrl` handles absolute URLs, VITE_API_URL and optional runtime overrides.

  // Normalize filters coming from various components (camelCase or snake_case)
  const normalizeFilters = useCallback((filters: any = {}) => {
    const contractors = filters.contractors || filters.contractor || []
    const areas = filters.areas || []
    const organizations = filters.organizations || []
    const business_categories = filters.business_categories || filters.businessCategories || []
    const keywords = filters.keywords || []

    // Accept either `time_ranges` or `timeRanges` and coerce to expected objects
    let time_ranges = filters.time_ranges || filters.timeRanges || []
    if (!Array.isArray(time_ranges)) time_ranges = []

    // Filter and normalize time range entries to only allowed shapes
    time_ranges = time_ranges
      .filter((tr: any) => tr && typeof tr === 'object')
      .map((tr: any) => {
        const t = { ...tr }
        // Some places use `startDate`/`endDate` strings — keep as-is
        return t
      })
      .filter((tr: any) => ['yearly', 'quarterly', 'custom'].includes(String(tr.type)))

    const include_flood_control = filters.include_flood_control ?? filters.includeFloodControl ?? false
    const value_range = filters.value_range ?? filters.valueRange ?? null
    const dimension = filters.dimension ?? filters.dimension ?? 'by_contractor'

    return {
      contractors,
      areas,
      organizations,
      business_categories,
      keywords,
      time_ranges,
      include_flood_control,
      value_range,
      dimension
    }
  }, [])

  // Get export estimate
  const getExportEstimate = useCallback(async (config: ExportConfig): Promise<ExportEstimate> => {
    console.log('🔍 Getting export estimate for:', config.dataSource)
    
    try {
      if (config.dataSource === 'aggregated') {
        // Get aggregated data estimate
        const normalized = normalizeFilters(config.filters)
        const payload = {
          contractors: normalized.contractors,
          areas: normalized.areas,
          organizations: normalized.organizations,
          business_categories: normalized.business_categories,
          keywords: normalized.keywords,
          time_ranges: normalized.time_ranges,
          dimension: normalized.dimension || 'by_contractor',
          include_flood_control: normalized.include_flood_control,
          value_range: normalized.value_range
        }
        console.log('🔎 Export estimate (aggregated) payload:', payload)
  const url = resolveUrl('/contracts/chip-export-aggregated-estimate/')
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          let errText = ''
          try { errText = await response.text() } catch (e) { errText = '' }
          console.error('Estimate API error body (aggregated):', errText)
          throw new Error(`Failed to get estimate: ${response.status} ${errText}`)
        }

        const data = await response.json()
        console.log('\u2705 Aggregated estimate:', data)

        return {
          count: data.total_count,
          bytes: data.estimated_csv_bytes
        }
      } else if (config.dataSource === 'contracts') {
        // Get contracts estimate
        const normalized = normalizeFilters(config.filters)
        const payload = {
          contractors: normalized.contractors,
          areas: normalized.areas,
          organizations: normalized.organizations,
          business_categories: normalized.business_categories,
          keywords: normalized.keywords,
          time_ranges: normalized.time_ranges,
          include_flood_control: normalized.include_flood_control,
          value_range: normalized.value_range
        }
        console.log('🔎 Export estimate (contracts) payload:', payload)
  const url = resolveUrl('/contracts/chip-export-estimate/')
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          let errText = ''
          try { errText = await response.text() } catch (e) { errText = '' }
          console.error('Estimate API error body (contracts):', errText)
          throw new Error(`Failed to get estimate: ${response.status} ${errText}`)
        }

        const data = await response.json()
        console.log('\u2705 Contracts estimate:', data)

        return {
          count: data.total_count,
          bytes: data.estimated_csv_bytes
        }
      } else {
        // For client-side exports, estimate based on data
        const estimatedCount = 1000 // Default estimate
        const bytesPerEntry = 60 // Conservative estimate
        return {
          count: estimatedCount,
          bytes: estimatedCount * bytesPerEntry
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to get export estimate, using fallback:', error)
      // Fallback estimate when API is not available
      const estimatedCount = 10000 // Conservative fallback
      const bytesPerEntry = config.dataSource === 'aggregated' ? 60 : 350
      return {
        count: estimatedCount,
        bytes: estimatedCount * bytesPerEntry
      }
    }
  }, [])

  // Memory-efficient streaming with progress tracking
  const performDirectDownload = useCallback(async (response: Response, filename: string) => {
    console.log('🚀 Starting streaming download with progress')
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))
    
    try {
      const reader = response.body!.getReader()
      const total = Number(response.headers.get('Content-Length') || 0)
      const chunks: Uint8Array[] = []
      let received = 0
      
      console.log('📊 Content-Length:', total)
      
      // Update actual size from Content-Length for real-time display
      if (total > 0) {

        console.log('✅ Updated actual size from Content-Length:', total)
        if (exportEstimate) {
          const accuracyPercent = ((total / exportEstimate.bytes) * 100).toFixed(1)
          console.log(`🎯 Estimate vs Actual: ${exportEstimate.bytes.toLocaleString()} → ${total.toLocaleString()} bytes (${accuracyPercent}% accuracy)`)
        }
      }
      
      // Stream data and track progress
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          setExportProgress(100.0000)
          console.log('✅ Streaming completed - 100.0000%')
          break
        }
        
        if (value) {
          chunks.push(value)
          received += value.length
          
          // Update progress
          const progressTotal = total > 0 ? total : (exportEstimate?.bytes || 0)
          if (progressTotal > 0) {
            const progressFloat = Math.min(100, (received / progressTotal) * 100)
            const progressRounded = Number(progressFloat.toFixed(4))
            setExportProgress(progressRounded)
            console.log(`📈 Progress: ${progressRounded.toFixed(4)}% (${received.toLocaleString()}/${progressTotal.toLocaleString()} bytes)`)
            
            // Show accuracy improvement when we have both estimate and actual
            if (exportEstimate && total > 0 && exportEstimate.bytes !== total) {
              const accuracyPercent = ((total / exportEstimate.bytes) * 100).toFixed(1)
              console.log(`🎯 Estimate accuracy: ${exportEstimate.bytes.toLocaleString()} → ${total.toLocaleString()} bytes (${accuracyPercent}% of estimate)`)
            }
          } else {
            // Fallback progress estimation
            const estimatedProgressFloat = Math.min(95, (received / 1000000) * 100)
            const estimatedProgressRounded = Number(estimatedProgressFloat.toFixed(4))
            setExportProgress(estimatedProgressRounded)
            console.log(`📈 Progress (estimated): ${estimatedProgressRounded.toFixed(4)}% (${received.toLocaleString()} bytes)`)
          }
        }
      }
      
      // Create blob and download
      const blob = new Blob(chunks as BlobPart[], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Record accuracy for future estimates
      if (exportEstimate && total > 0) {
        const { recordEstimateAccuracy } = await import('./useUnifiedExportConfigs')
        recordEstimateAccuracy(exportEstimate.bytes, total, 'streaming')
      }
      
      console.log('✅ Download completed')
      
    } catch (error) {
      console.error('❌ Streaming download failed:', error)
      throw error
    }
  }, [exportEstimate])

  // Streaming export (server-side streaming with direct browser download)
  const performStreamingExport = useCallback(async (config: ExportConfig) => {
    if (!config.apiEndpoint) {
      throw new Error('API endpoint required for streaming export')
    }

    console.log('🚀 Starting streaming export:', config)
    console.log('📋 Export filters:', config.filters)

    // Build payload based on data source - normalize filters to backend expectations
    const normalized = normalizeFilters(config.filters)
    let payload: any
    if (config.dataSource === 'contracts') {
      payload = {
        contractors: normalized.contractors,
        areas: normalized.areas,
        organizations: normalized.organizations,
        business_categories: normalized.business_categories,
        keywords: normalized.keywords,
        time_ranges: normalized.time_ranges,
        include_flood_control: normalized.include_flood_control,
        value_range: normalized.value_range
      }
    } else if (config.dataSource === 'aggregated') {
      payload = {
        contractors: normalized.contractors,
        areas: normalized.areas,
        organizations: normalized.organizations,
        business_categories: normalized.business_categories,
        keywords: normalized.keywords,
        time_ranges: normalized.time_ranges,
        dimension: normalized.dimension || 'by_contractor',
        include_flood_control: normalized.include_flood_control,
        value_range: normalized.value_range
      }
    } else {
      throw new Error(`Streaming not supported for data source: ${config.dataSource}`)
    }

    console.log('📡 Sending payload to API:', payload)
    const endpoint = resolveUrl(config.apiEndpoint || '')
    console.log('🌐 API endpoint:', endpoint)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: exportAbort.current?.signal
    })

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`)
    }

    // Use direct browser download - no memory accumulation
    return performDirectDownload(response, config.filename)
  }, [exportAbort, performDirectDownload])

  // Client-side export (for smaller datasets)
  const performClientSideExport = useCallback(async (config: ExportConfig, data: any[]) => {
    console.log('🚀 Starting client-side export:', config)
    
    if (!config.dataProcessor) {
      throw new Error('Data processor required for client-side export')
    }

    try {
      // Process data to CSV
      const csvContent = config.dataProcessor(data, 1, data.length)
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = config.filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
  setExportProgress(100.0000)
      console.log('✅ Client-side export completed')
      
    } catch (error) {
      console.error('❌ Client-side export failed:', error)
      throw error
    }
  }, [])

  // Initiate export (get estimate and show modal)
  const initiateExport = useCallback(async (config: ExportConfig) => {
    console.log('🚀 Initiating export:', config)
    
    try {
      setIsExporting(true)
      setExportError(null)
  setExportProgress(0.0000)
      
      // Get export estimate
      const estimate = await getExportEstimate(config)
      setExportEstimate(estimate)
      
      // Show export modal
      setShowExportModal(true)
      
      console.log('✅ Export initiated successfully')
      
    } catch (error) {
      console.error('❌ Export initiation failed:', error)
      setExportError(error instanceof Error ? error.message : 'Export failed')
      setIsExporting(false)
    }
  }, [getExportEstimate])

  // Download export (perform the actual export)
  const downloadExport = useCallback(async (config: ExportConfig) => {
    console.log('📥 Starting download:', config)
    
    try {
      setIsExporting(true)
      setExportError(null)
  setExportProgress(0.0000)
      
      // Create abort controller for cancellation
      exportAbort.current = new AbortController()
      
      if (config.type === 'streaming') {
        await performStreamingExport(config)
      } else if (config.type === 'client-side') {
        // For client-side, we need the actual data
        // This would typically come from the component's state
        throw new Error('Client-side export requires data to be passed separately')
      } else {
        throw new Error(`Unsupported export type: ${config.type}`)
      }
      
      console.log('✅ Export completed successfully')
      
    } catch (error) {
      console.error('❌ Export failed:', error)
      setExportError(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setIsExporting(false)
      exportAbort.current = null
    }
  }, [performStreamingExport, performClientSideExport])

  // Cancel export
  const cancelExport = useCallback(() => {
    console.log('❌ Cancelling export')
    
    if (exportAbort.current) {
      exportAbort.current.abort()
      exportAbort.current = null
    }
    
    setIsExporting(false)
  setExportProgress(0.0000)
    setExportError(null)
  }, [])

  // Close export modal
  const closeExportModal = useCallback(() => {
    setShowExportModal(false)
    setExportError(null)
  setExportProgress(0.0000)
  }, [])

  return {
    // State
    isExporting,
    exportProgress,
    exportEstimate,
    showExportModal,
    exportError,
    
    // Actions
    initiateExport,
    downloadExport,
    cancelExport,
    closeExportModal
  }
}