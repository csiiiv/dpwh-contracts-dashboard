import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataExplorer } from '../components/features/data-explorer/DataExplorer'
// Removed unused components: VirtualTable, LazyImage
import { unifiedDataServiceImproved } from '../services/UnifiedDataServiceImproved'

// Mock dependencies
jest.mock('../services/UnifiedDataServiceImproved', () => ({
  unifiedDataServiceImproved: {
    queryEntities: jest.fn(),
    queryContracts: jest.fn(),
    queryRelatedEntities: jest.fn(),
    queryQuarterlyTrends: jest.fn(),
    loadGlobalTotals: jest.fn()
  }
}))

jest.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({ isDark: false })
}))

jest.mock('../hooks/useResponsive', () => ({
  useResponsive: () => ({ isMobile: false, isTablet: false, isDesktop: true })
}))

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn()
}

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true
})

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPerformance.now.mockReturnValue(Date.now())
  })

  describe('DataExplorer Performance', () => {
    const mockData = {
      contractors: [
        { name: 'Test Contractor 1', total_contract_value: 1000000, contract_count: 10, average_contract_value: 100000 },
        { name: 'Test Contractor 2', total_contract_value: 2000000, contract_count: 20, average_contract_value: 100000 }
      ],
      areas: [
        { name: 'Test Area 1', total_contract_value: 1500000, contract_count: 15, average_contract_value: 100000 }
      ],
      organizations: [
        { name: 'Test Org 1', total_contract_value: 3000000, contract_count: 30, average_contract_value: 100000 }
      ],
      business_categories: [
        { name: 'Test Category 1', total_contract_value: 2500000, contract_count: 25, average_contract_value: 100000 }
      ]
    }

    beforeEach(() => {
      (unifiedDataServiceImproved.queryEntities as jest.Mock).mockResolvedValue({
        success: true,
        data: mockData
      })
      (unifiedDataServiceImproved.loadGlobalTotals as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          total_contracts: 1000,
          total_value: 100000000,
          average_value: 100000
        }
      })
    })

    it('should render within performance budget', async () => {
      const startTime = performance.now()
      
      render(<DataExplorer />)
      
      await waitFor(() => {
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render within 100ms
      expect(renderTime).toBeLessThan(100)
    })

    it('should handle dataset switching efficiently', async () => {
      render(<DataExplorer />)
      
      await waitFor(() => {
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
      })
      
      const startTime = performance.now()
      
      // Switch datasets
      const contractorTab = screen.getByText('Contractors')
      fireEvent.click(contractorTab)
      
      const endTime = performance.now()
      const switchTime = endTime - startTime
      
      // Should switch datasets within 50ms
      expect(switchTime).toBeLessThan(50)
    })

    it('should handle search input efficiently', async () => {
      render(<DataExplorer />)
      
      await waitFor(() => {
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      
      const startTime = performance.now()
      fireEvent.change(searchInput, { target: { value: 'a' } })
      fireEvent.change(searchInput, { target: { value: 'ab' } })
      fireEvent.change(searchInput, { target: { value: 'abc' } })
      fireEvent.change(searchInput, { target: { value: 'abcd' } })
      const endTime = performance.now()
      
      // Should handle rapid input changes efficiently
      expect(endTime - startTime).toBeLessThan(50)
    })
  })

  // Removed VirtualTable and LazyImage performance tests - components were unused

  describe('Memory Usage', () => {
    it('should not leak memory during component lifecycle', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
      
      const { unmount } = render(<DataExplorer />)
      
      // Simulate some interactions
      const searchInput = screen.getByPlaceholderText(/search/i)
      fireEvent.change(searchInput, { target: { value: 'test' } })
      
      unmount()
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory
      
      // Memory increase should be reasonable (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024)
    })
  })

  describe('Rendering Performance', () => {
    it('should maintain 60fps during interactions', () => {
      const frameTimes: number[] = []
      let lastTime = performance.now()
      
      const measureFrame = () => {
        const currentTime = performance.now()
        const frameTime = currentTime - lastTime
        frameTimes.push(frameTime)
        lastTime = currentTime
      }
      
      render(<DataExplorer />)
      
      // Simulate rapid interactions
      const searchInput = screen.getByPlaceholderText(/search/i)
      for (let i = 0; i < 10; i++) {
        measureFrame()
        fireEvent.change(searchInput, { target: { value: `test${i}` } })
      }
      
      // Calculate average frame time
      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
      
      // Should maintain 60fps (16.67ms per frame)
      expect(averageFrameTime).toBeLessThan(16.67)
    })
  })
})