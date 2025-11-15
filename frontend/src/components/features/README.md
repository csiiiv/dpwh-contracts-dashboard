# Features Directory

This directory contains feature-specific components organized by major application functionality. Each feature is self-contained with its own components, hooks, and utilities.

## 📁 Directory Structure

### `/advanced-search/` - Advanced Search Feature
Comprehensive search functionality with multiple filter criteria and result visualization.

#### Core Components
- **`AdvancedSearch.tsx`** - Main search interface with filter controls and results display
- **`SearchResults.tsx`** - Search results table with sorting, pagination, and export functionality
- **`EntityDrillDownModal.tsx`** - Modal for exploring detailed entity information and nested data
- **`AnalyticsModal.tsx`** - Modal for displaying analytics charts and visualizations
- **`FilterSection.tsx`** - Filter controls section with multiple criteria selection
- **`FilterChip.tsx`** - Individual filter chip component for selected criteria
- **`SearchableSelect.tsx`** - Searchable dropdown component for entity selection

#### Sub-components (`/components/`)
- **`AdvancedSearchActions.tsx`** - Action buttons for search operations
- **`AdvancedSearchFilters.tsx`** - Filter configuration interface
- **`AdvancedSearchResults.tsx`** - Results display wrapper component
- **`AdvancedSearchPagination.tsx`** - Pagination controls for search results

#### Utilities
- **`index.ts`** - Barrel export file for clean imports

### `/analytics/` - Analytics Feature
Data analytics and visualization components for exploring trends and patterns.

#### Components
- **`AnalyticsControls.tsx`** - Controls for configuring analytics parameters
- **`AnalyticsSummary.tsx`** - Summary statistics and key metrics display
- **`AnalyticsTable.tsx`** - Data table for analytics results with sorting and filtering

### `/shared/` - Shared Components
Reusable components used across multiple features with consistent styling and behavior.

#### Table Components
- **`DataTable.tsx`** - Generic data table with sorting, pagination, filtering, and theming
- **`ContractsTable.tsx`** - Specialized table for contract data with currency formatting
- **`EntitiesTable.tsx`** - Specialized table for entity data (contractors, organizations, categories, areas)
- **`Table.tsx`** - Basic table component with minimal styling

#### Modal Components
- **`Modal.tsx`** - Generic modal component with overlay and close functionality
- **`ModalStyles.tsx`** - Styled components and utilities for modal theming
- **`ExportCSVModal.tsx`** - Modal for CSV export configuration and progress

#### UI Components
- **`ThemeToggle.tsx`** - Dark/light mode toggle button with theme switching
- **`LoadingSpinner.tsx`** - Loading indicator with customizable size and styling
- **`ErrorBoundary.tsx`** - Error boundary component for graceful error handling
- **`ErrorDisplay.tsx`** - Error message display component with retry functionality
- **`AccessibleButton.tsx`** - Enhanced button component

#### Data Components
- **`UnifiedPagination.tsx`** - Pagination component with page size controls
- **`AnalyticsExplorer.tsx`** - Analytics exploration component with chart integration

### `/archive/` - Archived Components
Legacy components that have been replaced or are no longer actively used.

#### `/data-explorer/` - Legacy Data Explorer
- **`DataExplorer.tsx`** - Original data explorer component (deprecated)
- **`DataExplorerTable.tsx`** - Legacy table component (deprecated)
- **`DataExplorerFilters.tsx`** - Legacy filter component (deprecated)
- **`DataExplorerPagination.tsx`** - Legacy pagination component (deprecated)
- **`DataExplorerExport.tsx`** - Legacy export component (deprecated)
- **`DataExplorerAnalytics.tsx`** - Legacy analytics component (deprecated)
- **`DataExplorerTypes.ts`** - Legacy type definitions (deprecated)
- **`DataExplorer.styled.ts`** - Legacy styled components (deprecated)
- **`README.md`** - Documentation for legacy components

## 🎯 Feature Design Principles

### Modularity
Each feature is self-contained with its own components and logic.

### Reusability
Shared components are designed to be used across multiple features.

### Consistency
All components follow consistent naming conventions and design patterns.


### Performance
Components are optimized with proper memoization and lazy loading where appropriate.

## 🔧 Usage Examples

### Advanced Search
```typescript
import { AdvancedSearch } from './components/features/advanced-search/AdvancedSearch'
import { SearchResults } from './components/features/advanced-search/SearchResults'
```

### Shared Components
```typescript
import { DataTable } from './components/features/shared/DataTable'
import { ThemeToggle } from './components/features/shared/ThemeToggle'
```

### Analytics
```typescript
import { AnalyticsControls } from './components/features/analytics/AnalyticsControls'
import { AnalyticsSummary } from './components/features/analytics/AnalyticsSummary'
```
