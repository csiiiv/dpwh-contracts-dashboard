/**
 * Example Usage of Modular ContractsTable
 * 
 * This file demonstrates different ways to use the new modular ContractsTable
 * with various configurations.
 */

import React, { useState } from 'react'
import { ContractsTable } from './ContractsTable'
import { TABLE_CONFIGS, type TableConfigPreset } from './contracts-table-config'
import type { Contract } from '../../../types/contracts'

// Mock data for examples
const mockContracts: Contract[] = [
  // ... your contract data
] as any

// Example 1: Basic Usage (Default 2 lines)
export function Example1_BasicUsage() {
  return (
    <ContractsTable
      contracts={mockContracts}
      totalCount={mockContracts.length}
      pageSize={25}
      currentPage={1}
      totalPages={1}
      sortBy="cost_php"
      sortDirection="desc"
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      onSortChange={() => {}}
      isDark={false}
      // No rowConfig - uses default (2 lines)
    />
  )
}

// Example 2: Expanded View (3 lines)
export function Example2_ExpandedView() {
  return (
    <ContractsTable
      contracts={mockContracts}
      totalCount={mockContracts.length}
      pageSize={25}
      currentPage={1}
      totalPages={1}
      sortBy="cost_php"
      sortDirection="desc"
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      onSortChange={() => {}}
      isDark={false}
      rowConfig={TABLE_CONFIGS.expanded}  // 3 lines each
    />
  )
}

// Example 3: Compact View (1 line)
export function Example3_CompactView() {
  return (
    <ContractsTable
      contracts={mockContracts}
      totalCount={mockContracts.length}
      pageSize={25}
      currentPage={1}
      totalPages={1}
      sortBy="cost_php"
      sortDirection="desc"
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      onSortChange={() => {}}
      isDark={false}
      rowConfig={TABLE_CONFIGS.compact}  // 1 line each
    />
  )
}

// Example 4: User-Selectable Configuration
export function Example4_UserSelectable() {
  const [preset, setPreset] = useState<TableConfigPreset>('default')
  
  return (
    <div>
      {/* Configuration Selector */}
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5' }}>
        <label htmlFor="preset-select">Table Density: </label>
        <select 
          id="preset-select"
          value={preset} 
          onChange={e => setPreset(e.target.value as TableConfigPreset)}
          style={{ padding: '0.5rem', marginLeft: '0.5rem' }}
        >
          <option value="compact">Compact (1 line) - High Density</option>
          <option value="default">Default (2 lines) - Standard</option>
          <option value="expanded">Expanded (3 lines) - Detailed</option>
          <option value="detailed">Detailed (4 lines) - Full Info</option>
        </select>
      </div>
      
      {/* Table with selected configuration */}
      <ContractsTable
        contracts={mockContracts}
        totalCount={mockContracts.length}
        pageSize={25}
        currentPage={1}
        totalPages={1}
        sortBy="cost_php"
        sortDirection="desc"
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onSortChange={() => {}}
        isDark={false}
        rowConfig={TABLE_CONFIGS[preset]}
      />
    </div>
  )
}

// Example 5: Responsive Configuration
export function Example5_ResponsiveConfig() {
  const [preset, setPreset] = useState<TableConfigPreset>('default')
  
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setPreset('compact')
      } else if (width < 1200) {
        setPreset('default')
      } else {
        setPreset('expanded')
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return (
    <div>
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Current: {preset.toUpperCase()} (resize window to see changes)
      </p>
      
      <ContractsTable
        contracts={mockContracts}
        totalCount={mockContracts.length}
        pageSize={25}
        currentPage={1}
        totalPages={1}
        sortBy="cost_php"
        sortDirection="desc"
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onSortChange={() => {}}
        isDark={false}
        rowConfig={TABLE_CONFIGS[preset]}
      />
    </div>
  )
}

// Example 6: With LocalStorage Persistence
export function Example6_WithPersistence() {
  const [preset, setPreset] = useState<TableConfigPreset>(() => {
    const saved = localStorage.getItem('contractsTablePreset')
    return (saved as TableConfigPreset) || 'default'
  })
  
  const handlePresetChange = (newPreset: TableConfigPreset) => {
    setPreset(newPreset)
    localStorage.setItem('contractsTablePreset', newPreset)
  }
  
  return (
    <div>
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5' }}>
        <label htmlFor="preset-select">Table Density (Saved): </label>
        <select 
          id="preset-select"
          value={preset} 
          onChange={e => handlePresetChange(e.target.value as TableConfigPreset)}
          style={{ padding: '0.5rem', marginLeft: '0.5rem' }}
        >
          <option value="compact">Compact</option>
          <option value="default">Default</option>
          <option value="expanded">Expanded</option>
          <option value="detailed">Detailed</option>
        </select>
        <small style={{ marginLeft: '1rem', color: '#666' }}>
          (Your preference is saved)
        </small>
      </div>
      
      <ContractsTable
        contracts={mockContracts}
        totalCount={mockContracts.length}
        pageSize={25}
        currentPage={1}
        totalPages={1}
        sortBy="cost_php"
        sortDirection="desc"
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onSortChange={() => {}}
        isDark={false}
        rowConfig={TABLE_CONFIGS[preset]}
      />
    </div>
  )
}

// Example 7: Custom Configuration
export function Example7_CustomConfig() {
  const customConfig = {
    maxLines: {
      contractors: 2,
      description: 4  // Different from contractors!
    },
    lineHeight: 1.8,
    fontSize: {
      primary: '15px',
      secondary: '13px'
    }
  }
  
  return (
    <ContractsTable
      contracts={mockContracts}
      totalCount={mockContracts.length}
      pageSize={25}
      currentPage={1}
      totalPages={1}
      sortBy="cost_php"
      sortDirection="desc"
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      onSortChange={() => {}}
      isDark={false}
      rowConfig={customConfig}  // Custom configuration
    />
  )
}


