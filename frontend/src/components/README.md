# Components Directory

This directory contains all React components organized by feature and functionality. Components are designed to be reusable, accessible, and maintainable.

## 📁 Directory Structure

### `/features/` - Feature-Specific Components
Components organized by major application features.

#### `/advanced-search/` - Advanced Search Feature
- **`AdvancedSearch.tsx`** - Main advanced search interface component
- **`SearchResults.tsx`** - Search results table with sorting and pagination
- **`EntityDrillDownModal.tsx`** - Modal for drilling down into entity details
- **`AnalyticsModal.tsx`** - Modal for displaying analytics and charts
- **`FilterSection.tsx`** - Filter controls and criteria selection
- **`FilterChip.tsx`** - Individual filter chip component
- **`SearchableSelect.tsx`** - Searchable dropdown component
- **`/components/`** - Sub-components for advanced search functionality

#### `/analytics/` - Analytics Components
- **`AnalyticsControls.tsx`** - Controls for analytics configuration
- **`AnalyticsSummary.tsx`** - Summary statistics display
- **`AnalyticsTable.tsx`** - Data table for analytics results

#### `/shared/` - Shared Components
Reusable components used across multiple features.

- **`DataTable.tsx`** - Generic data table with sorting, pagination, and filtering
- **`ContractsTable.tsx`** - Specialized table for contract data
- **`EntitiesTable.tsx`** - Specialized table for entity data (contractors, organizations, etc.)
- **`Table.tsx`** - Basic table component
- **`Modal.tsx`** - Generic modal component
- **`ModalStyles.tsx`** - Styled components for modals
- **`ThemeToggle.tsx`** - Dark/light mode toggle button
- **`LoadingSpinner.tsx`** - Loading indicator component
- **`ErrorBoundary.tsx`** - Error boundary for error handling
- **`ErrorDisplay.tsx`** - Error message display component
- **`ExportCSVModal.tsx`** - Modal for CSV export functionality
- **`UnifiedPagination.tsx`** - Pagination component
- **`AccessibleButton.tsx`** - Accessible button component
- **`AnalyticsExplorer.tsx`** - Analytics exploration component

### `/charts/` - Chart Components
- **`QuarterlyTrendsChart.tsx`** - Chart component for quarterly trend visualization

### `/lazy/` - Lazy-Loaded Components
- **`LazyComponents.tsx`** - Components loaded on demand for performance

### `/styled/` - Styled Components
- **`App.styled.ts`** - Styled components for the main app layout
- **`Common.styled.ts`** - Common styled components
- **`Loading.styled.ts`** - Loading-related styled components

## 🎯 Component Design Principles

### Reusability
Components are designed to be reusable across different features and contexts.


### Type Safety
Components are fully typed with TypeScript interfaces and props.

### Performance
Components are optimized for performance with proper memoization and lazy loading.

### Consistency
Components follow consistent naming conventions and design patterns.

## 🔧 Usage

Components are imported and used throughout the application:

```typescript
import { DataTable } from './components/features/shared/DataTable'
import { ThemeToggle } from './components/features/shared/ThemeToggle'
```

## 📝 Component Documentation

Each component includes:
- TypeScript interfaces for props
- JSDoc comments for documentation
- Usage examples in comments
