# Utils Directory

This directory contains utility functions, helpers, and common utilities used throughout the PHILGEPS Awards Data Explorer frontend application.

## 📁 Directory Structure

### Core Utility Files


#### `chartConfig.ts`
Chart configuration utilities and settings.

**Features:**
- Chart configuration objects
- Color palette definitions
- Chart styling utilities
- Responsive chart settings
- Animation configurations

**Key Functions:**
- `getChartConfig()` - Get chart configuration
- `getColorPalette()` - Get color palette
- `getResponsiveConfig()` - Get responsive settings
- `getAnimationConfig()` - Get animation settings

#### `codeSplitting.ts`
Code splitting utilities and lazy loading helpers.

**Features:**
- Lazy component loading
- Dynamic imports
- Bundle splitting utilities
- Performance optimization
- Loading state management

**Key Functions:**
- `lazyLoadComponent()` - Lazy load components
- `dynamicImport()` - Dynamic import utilities
- `splitBundle()` - Bundle splitting helpers
- `manageLoadingState()` - Loading state management

#### `errorHandling.ts`
Error handling utilities and error management.

**Features:**
- Error boundary utilities
- Error logging
- Error recovery
- User-friendly error messages
- Error reporting

**Key Functions:**
- `handleError()` - Central error handling
- `logError()` - Error logging
- `recoverFromError()` - Error recovery
- `getUserFriendlyMessage()` - User-friendly error messages

#### `filterPersistence.ts`
Filter persistence utilities for maintaining filter state.

**Features:**
- Filter state persistence
- URL parameter management
- Local storage utilities
- Filter serialization
- State restoration

**Key Functions:**
- `persistFilters()` - Persist filter state
- `restoreFilters()` - Restore filter state
- `serializeFilters()` - Serialize filter data
- `deserializeFilters()` - Deserialize filter data

#### `percentageUtils.ts`
Percentage calculation and formatting utilities.

**Features:**
- Percentage calculations
- Percentage formatting
- Progress calculations
- Ratio calculations
- Statistical calculations

**Key Functions:**
- `calculatePercentage()` - Calculate percentages
- `formatPercentage()` - Format percentage display
- `calculateProgress()` - Calculate progress percentages
- `calculateRatio()` - Calculate ratios

#### `performanceOptimizations.ts`
Performance optimization utilities and helpers.

**Features:**
- Memoization utilities
- Debouncing functions
- Throttling functions
- Performance monitoring
- Optimization helpers

**Key Functions:**
- `memoize()` - Memoization utility
- `debounce()` - Debouncing function
- `throttle()` - Throttling function
- `measurePerformance()` - Performance measurement
- `optimizeRendering()` - Rendering optimization

#### `serviceWorker.ts`
Service worker utilities and PWA functionality.

**Features:**
- Service worker registration
- Cache management
- Offline functionality
- Update notifications
- Background sync

**Key Functions:**
- `registerServiceWorker()` - Register service worker
- `manageCache()` - Cache management
- `handleOffline()` - Offline functionality
- `notifyUpdate()` - Update notifications

## 🎯 Utility Categories



### Performance Utilities
Tools for optimizing application performance.

#### Features
- Memoization
- Debouncing and throttling
- Performance monitoring
- Rendering optimization
- Bundle optimization

#### Usage
```typescript
import { memoize, debounce } from './utils/performanceOptimizations'

const memoizedFunction = memoize(expensiveFunction)
const debouncedSearch = debounce(searchFunction, 300)
```

### Data Utilities
Tools for data processing and manipulation.

#### Features
- Percentage calculations
- Data formatting
- Filter management
- State persistence
- Data validation

#### Usage
```typescript
import { calculatePercentage, formatPercentage } from './utils/percentageUtils'

const percentage = calculatePercentage(value, total)
const formatted = formatPercentage(percentage, 2)
```

### UI Utilities
Tools for user interface functionality.

#### Features
- Chart configuration
- Error handling
- Loading states
- Code splitting
- Service worker management

#### Usage
```typescript
import { getChartConfig } from './utils/chartConfig'
import { handleError } from './utils/errorHandling'

const chartConfig = getChartConfig('line', { responsive: true })
handleError(error, { showToast: true })
```

## 🔧 Usage Patterns

### Importing Utilities
```typescript
// Import specific utilities
import { debounce } from './utils/performanceOptimizations'
import { getAriaProps } from './utils/accessibility'

// Import multiple utilities
import { 
  calculatePercentage, 
  formatPercentage 
} from './utils/percentageUtils'
```

### Utility Composition
```typescript
// Compose utilities for complex functionality
import { debounce } from './utils/performanceOptimizations'
import { handleError } from './utils/errorHandling'

const debouncedSearch = debounce(async (query) => {
  try {
    const results = await searchAPI(query)
    return results
  } catch (error) {
    handleError(error, { context: 'search' })
  }
}, 300)
```

## 🛠️ Development Guidelines

### Utility Design
- **Single Purpose** - Each utility has a single, well-defined purpose
- **Pure Functions** - Prefer pure functions when possible
- **Type Safety** - Use TypeScript for type safety
- **Error Handling** - Include proper error handling

### Performance Considerations
- **Efficient Algorithms** - Use efficient algorithms and data structures
- **Memory Management** - Avoid memory leaks and excessive allocations
- **Caching** - Use caching where appropriate
- **Lazy Loading** - Implement lazy loading for heavy operations

### Testing
- **Unit Tests** - Write comprehensive unit tests
- **Edge Cases** - Test edge cases and error conditions
- **Performance Tests** - Test performance characteristics
- **Integration Tests** - Test utility integration

## 📝 Documentation Standards

Each utility includes:
- **Function Documentation** - JSDoc comments for all functions
- **Usage Examples** - Practical usage examples
- **Parameter Documentation** - Detailed parameter descriptions
- **Return Value Documentation** - Return value specifications
- **Error Handling** - Error handling documentation
