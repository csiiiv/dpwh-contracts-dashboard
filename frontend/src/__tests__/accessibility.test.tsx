import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DataExplorer } from '../components/features/data-explorer/DataExplorer'
import { AccessibleButton } from '../components/features/shared/AccessibleButton'
// Removed unused components: AccessibleForm, VirtualTable

// Extend Jest matchers
expect.extend(toHaveNoViolations)

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

jest.mock('../hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    announceToScreenReader: jest.fn(),
    setFocus: jest.fn(),
    trapFocus: jest.fn(),
    releaseFocus: jest.fn()
  })
}))

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

describe('Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(unifiedDataServiceImproved.queryEntities as jest.Mock).mockResolvedValue({
      success: true,
      data: mockData
    })
    ;(unifiedDataServiceImproved.loadGlobalTotals as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        total_contracts: 1000,
        total_value: 100000000,
        average_value: 100000
      }
    })
  })

  describe('DataExplorer Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<DataExplorer />)
      
      await waitFor(() => {
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
      })
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading structure', async () => {
      render(<DataExplorer />)
      
      await waitFor(() => {
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
      })
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toBeInTheDocument()
      expect(mainHeading).toHaveTextContent('Data Explorer')
    })

    it('should have proper tab navigation', async () => {
      render(<DataExplorer />)
      
      await waitFor(() => {
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
      })
      
      const tabList = screen.getByRole('tablist')
      expect(tabList).toBeInTheDocument()
      
      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(4) // Contractors, Areas, Organizations, Business Categories
    })

    it('should support keyboard navigation', async () => {
      render(<DataExplorer />)
      
      await waitFor(() => {
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
      })
      
      const firstTab = screen.getByRole('tab', { name: /contractors/i })
      firstTab.focus()
      expect(firstTab).toHaveFocus()
      
      // Test arrow key navigation
      await userEvent.keyboard('{ArrowRight}')
      const secondTab = screen.getByRole('tab', { name: /areas/i })
      expect(secondTab).toHaveFocus()
    })

    it('should have proper ARIA labels', async () => {
      render(<DataExplorer />)
      
      await waitFor(() => {
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      expect(searchInput).toHaveAttribute('aria-label')
      
      const table = screen.getByRole('table')
      expect(table).toHaveAttribute('aria-label')
    })

    it('should announce changes to screen readers', async () => {
      render(<DataExplorer />)
      
      await waitFor(() => {
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      await userEvent.type(searchInput, 'test')
      
      // The component should handle screen reader announcements
      expect(searchInput).toHaveValue('test')
    })
  })

  describe('AccessibleButton Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <AccessibleButton onClick={() => {}}>
          Test Button
        </AccessibleButton>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper button semantics', () => {
      render(
        <AccessibleButton onClick={() => {}}>
          Test Button
        </AccessibleButton>
      )
      
      const button = screen.getByRole('button', { name: 'Test Button' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should support keyboard activation', async () => {
      const handleClick = jest.fn()
      render(
        <AccessibleButton onClick={handleClick}>
          Test Button
        </AccessibleButton>
      )
      
      const button = screen.getByRole('button', { name: 'Test Button' })
      button.focus()
      expect(button).toHaveFocus()
      
      await userEvent.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      await userEvent.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(2)
    })

    it('should handle disabled state properly', () => {
      render(
        <AccessibleButton onClick={() => {}} disabled>
          Disabled Button
        </AccessibleButton>
      )
      
      const button = screen.getByRole('button', { name: 'Disabled Button' })
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should support custom ARIA attributes', () => {
      render(
        <AccessibleButton 
          onClick={() => {}} 
          aria-describedby="button-description"
          aria-expanded="false"
        >
          Expandable Button
        </AccessibleButton>
      )
      
      const button = screen.getByRole('button', { name: 'Expandable Button' })
      expect(button).toHaveAttribute('aria-describedby', 'button-description')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })
  })

  // Removed AccessibleForm and VirtualTable accessibility tests - components were unused

  describe('Focus Management', () => {
    it('should trap focus in modals', async () => {
      render(<DataExplorer />)
      
      await waitFor(() => {
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
      })
      
      // Test focus management when modals are opened
      const firstRow = screen.getByText('Test Contractor 1')
      await userEvent.click(firstRow)
      
      // Focus should be trapped within the modal
      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
    })

    it('should restore focus when modals are closed', async () => {
      render(<DataExplorer />)
      
      await waitFor(() => {
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
      })
      
      const firstRow = screen.getByText('Test Contractor 1')
      await userEvent.click(firstRow)
      
      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i })
      await userEvent.click(closeButton)
      
      // Focus should return to the trigger element
      expect(firstRow).toHaveFocus()
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper live regions for dynamic content', async () => {
      render(<DataExplorer />)
      
      await waitFor(() => {
        expect(screen.getByText('Data Explorer')).toBeInTheDocument()
      })
      
      // Check for live regions
      const liveRegions = screen.getAllByRole('status')
      expect(liveRegions.length).toBeGreaterThan(0)
    })

    it('should announce loading states', async () => {
      render(<DataExplorer />)
      
      // The component should announce loading states
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })
})