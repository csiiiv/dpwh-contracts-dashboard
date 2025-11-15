import React, { useState } from 'react'
import { useUnifiedExport } from '../hooks/useUnifiedExport'
import { 
  createAdvancedSearchConfig, 
  createDataExplorerConfig, 
  createAnalyticsConfig,
  createEntityDrillDownConfig 
} from '../hooks/useUnifiedExportConfigs'
import { ExportCSVModal } from '../components/features/shared/ExportCSVModal'

// Mock data for testing
const mockAnalyticsData = [
  { label: 'Contractor A', total_value: 1000000, count: 5, avg_value: 200000 },
  { label: 'Contractor B', total_value: 750000, count: 3, avg_value: 250000 },
  { label: 'Contractor C', total_value: 500000, count: 2, avg_value: 250000 }
]

const mockContractData = [
  {
    reference_id: 'REF001',
    notice_title: 'Construction Project A',
    award_title: 'Award A',
    organization_name: 'Org A',
    awardee_name: 'Company A',
    business_category: 'Construction',
    area_of_delivery: 'Metro Manila',
    contract_amount: 1000000,
    award_amount: 950000,
    award_status: 'Completed',
    contract_no: 'C001',
    created_at: '2024-01-15'
  }
]

export const UnifiedExportTester: React.FC = () => {
  const unifiedExport = useUnifiedExport()
  const [activeTest, setActiveTest] = useState<string>('')

  // Test configurations
  const testConfigs = {
    'advanced-search': {
      name: 'Advanced Search (Streaming)',
      config: createAdvancedSearchConfig(),
      description: 'Tests streaming export for individual contracts'
    },
    'data-explorer': {
      name: 'Data Explorer (Streaming)',
      config: createDataExplorerConfig('by_contractor'),
      description: 'Tests streaming export for aggregated data'
    },
    'analytics': {
      name: 'Analytics Explorer (Client-side)',
      config: createAnalyticsConfig('by_contractor'),
      description: 'Tests client-side export with mock data'
    },
    'entity-drilldown': {
      name: 'Entity Drill Down (Client-side)',
      config: createEntityDrillDownConfig('Test Entity', 'contracts'),
      description: 'Tests client-side export for entity data'
    }
  }

  // Handle test execution
  const runTest = async (testType: string) => {
    setActiveTest(testType)
    const testConfig = testConfigs[testType as keyof typeof testConfigs]
    
    console.log(`🧪 Running test: ${testConfig.name}`)
    console.log('📝 Config:', testConfig.config)
    
    try {
      // For client-side exports, we need to modify the config to include data
      if (testConfig.config.type === 'client-side') {
        const modifiedConfig = {
          ...testConfig.config,
          dataProcessor: (_data: any[]) => {
            // Use mock data for testing
            const testData = testType === 'analytics' ? mockAnalyticsData : mockContractData
            return testConfig.config.dataProcessor!(testData, 1, testData.length)
          }
        }
        await unifiedExport.initiateExport(modifiedConfig)
      } else {
        // For streaming exports, add mock filters
        const modifiedConfig = {
          ...testConfig.config,
          filters: {
            contractors: [],
            areas: [],
            organizations: [],
            businessCategories: [],
            keywords: [],
            timeRanges: [],
            dimension: 'by_contractor',
            includeFloodControl: false,
            valueRange: null
          }
        }
        await unifiedExport.initiateExport(modifiedConfig)
      }
    } catch (error) {
      console.error(`❌ Test failed for ${testConfig.name}:`, error)
    }
  }

  // Handle mock export execution
  const handleMockExport = async (startRank: number, endRank: number) => {
    const testConfig = testConfigs[activeTest as keyof typeof testConfigs]
    
    if (testConfig.config.type === 'client-side') {
      // For client-side, simulate the export
      console.log(`📥 Mock client-side export: ${startRank}-${endRank}`)
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate mock CSV
      const testData = activeTest === 'analytics' ? mockAnalyticsData : mockContractData
      const csvContent = testConfig.config.dataProcessor!(testData, startRank, endRank)
      
      // Create download
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = testConfig.config.filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('✅ Mock export completed')
    } else {
      // For streaming, attempt the actual download (will likely fail without backend)
      try {
        await unifiedExport.downloadExport(testConfig.config)
      } catch (error) {
        console.log('⚠️ Streaming test failed (expected without backend):', error)
        
        // Create a mock CSV file instead
        const mockCsv = `Reference ID,Title,Amount\nMOCK001,Mock Contract,100000`
        const blob = new Blob([mockCsv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = testConfig.config.filename
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        console.log('✅ Mock streaming export completed (fallback)')
      }
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🧪 Unified Export System Tester</h2>
      <p>This utility tests the unified export system components without requiring a full backend.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Available Tests:</h3>
        {Object.entries(testConfigs).map(([key, test]) => (
          <div key={key} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h4>{test.name}</h4>
            <p>{test.description}</p>
            <button 
              onClick={() => runTest(key)}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Run Test
            </button>
          </div>
        ))}
      </div>

      {/* Export Modal */}
      <ExportCSVModal
        open={unifiedExport.showExportModal}
        onClose={unifiedExport.closeExportModal}
        onExport={handleMockExport}
        onCancel={unifiedExport.cancelExport}
        totalCount={unifiedExport.exportEstimate?.count || 100}
        dataType={activeTest ? testConfigs[activeTest as keyof typeof testConfigs].name : 'Test Data'}
        loading={unifiedExport.isExporting}
        progress={unifiedExport.exportProgress}
        estimatedSize={unifiedExport.exportEstimate?.bytes}
        actualSize={unifiedExport.actualSize || undefined}
        showProgress={true}
        showFileSize={true}
      />

      {/* Test Results */}
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Test Results:</h3>
        <p><strong>Export Status:</strong> {unifiedExport.isExporting ? 'Exporting...' : 'Ready'}</p>
        <p><strong>Progress:</strong> {unifiedExport.exportProgress}%</p>
        <p><strong>Estimated Count:</strong> {unifiedExport.exportEstimate?.count || 'N/A'}</p>
        <p><strong>Estimated Size:</strong> {unifiedExport.exportEstimate?.bytes ? `${(unifiedExport.exportEstimate.bytes / 1024).toFixed(1)} KB` : 'N/A'}</p>
        {unifiedExport.actualSize && (
          <p><strong>Actual Size:</strong> {`${(unifiedExport.actualSize / 1024).toFixed(1)} KB`} 
            <span style={{ color: '#666', marginLeft: '8px' }}>
              ({((unifiedExport.actualSize / (unifiedExport.exportEstimate?.bytes || 1)) * 100).toFixed(0)}% of estimate)
            </span>
          </p>
        )}
        {unifiedExport.exportError && (
          <p style={{ color: 'red' }}><strong>Error:</strong> {unifiedExport.exportError}</p>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h4>What This Tests:</h4>
        <ul>
          <li>✅ Export configuration creation</li>
          <li>✅ Modal display and interaction</li>
          <li>✅ Progress tracking (simulated)</li>
          <li>✅ File size estimation</li>
          <li>✅ Error handling</li>
          <li>✅ CSV generation and download</li>
          <li>⚠️ Streaming (requires backend)</li>
        </ul>
      </div>
    </div>
  )
}