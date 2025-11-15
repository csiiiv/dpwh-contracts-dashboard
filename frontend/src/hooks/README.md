# Hooks Directory

This directory contains custom React hooks for state management, data fetching, and side effects. Hooks are organized by feature and functionality.

## 📁 Directory Structure

### `/advanced-search/` - Advanced Search Hooks
Hooks specific to the advanced search functionality.

#### Core Hooks
- **`useAdvancedSearchData.ts`** - Main hook for managing search data, results, and API calls
- **`useAdvancedSearchFilters.ts`** - Hook for managing filter state and criteria
- **`useAdvancedSearchPagination.ts`** - Hook for pagination state and controls
- **`useAdvancedSearchExport.ts`** - Hook for CSV export functionality

#### Test Files (`/__tests__/`)
- **`useAdvancedSearchData.test.ts`** - Unit tests for search data hook
- **`useAdvancedSearchFilters.test.ts`** - Unit tests for filter management hook

### `/archive/` - Archived Hooks
Legacy hooks that have been replaced or are no longer actively used.

- **`useDataExplorer.ts`** - Legacy data explorer hook (deprecated)
- **`useDataExplorerV2.ts`** - Legacy data explorer hook v2 (deprecated)

### Core Hooks
General-purpose hooks used throughout the application.

- **`useAnalyticsControls.ts`** - Hook for analytics configuration and controls
- **`useAnalyticsData.ts`** - Hook for analytics data fetching and processing
- **`useDebounce.ts`** - Hook for debouncing input values and API calls
- **`useEntityFilters.ts`** - Hook for entity filtering and selection
- **`useLoadingState.ts`** - Hook for managing loading states across components
- **`usePagination.ts`** - Hook for pagination logic and state management
- **`usePerformanceMonitoring.ts`** - Hook for performance monitoring and metrics
- **`useResponsive.ts`** - Hook for responsive design and breakpoint detection
- **`useUnifiedAnalytics.ts`** - Hook for unified analytics data processing

## 🎯 Hook Design Principles

### Single Responsibility
Each hook has a single, well-defined purpose and responsibility.

### Reusability
Hooks are designed to be reusable across different components and features.

### Type Safety
All hooks are fully typed with TypeScript for better development experience.

### Performance
Hooks are optimized with proper memoization and dependency management.

### Error Handling
Hooks include proper error handling and loading states.

## 🔧 Usage Examples

### Advanced Search
```typescript
import { useAdvancedSearchData } from './hooks/advanced-search/useAdvancedSearchData'
import { useAdvancedSearchFilters } from './hooks/advanced-search/useAdvancedSearchFilters'

const MyComponent = () => {
  const { searchResults, loading, error, performSearch } = useAdvancedSearchData()
  const { filters, updateFilter, clearFilters } = useAdvancedSearchFilters()
  
  // Component logic
}
```

### General Hooks
```typescript
import { useDebounce } from './hooks/useDebounce'
import { useLoadingState } from './hooks/useLoadingState'
import { usePagination } from './hooks/usePagination'

const MyComponent = () => {
  const debouncedValue = useDebounce(inputValue, 300)
  const { loading, setLoading } = useLoadingState()
  const { currentPage, totalPages, goToPage } = usePagination(totalItems, pageSize)
  
  // Component logic
}
```

## 📝 Hook Documentation

Each hook includes:
- TypeScript interfaces for parameters and return values
- JSDoc comments explaining functionality
- Usage examples in comments
- Error handling patterns
- Performance considerations

## 🧪 Testing

Hooks include comprehensive unit tests covering:
- Happy path scenarios
- Error conditions
- Edge cases
- Performance characteristics
- State management
