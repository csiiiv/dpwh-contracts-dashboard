# Application Constants

This directory contains constant values and configuration used throughout the frontend application.

## 📁 Files

- **`tabs.ts`** - Tab configuration and navigation constants

## 🏷️ Tab Constants

### Purpose
The `tabs.ts` file defines the main navigation structure for the dashboard's tabbed interface.

### Tab Configuration
```typescript
export const TABS = {
  DATA_EXPLORER: {
    id: 'data-explorer',
    label: 'Data Explorer',
    icon: 'chart-bar',
    description: 'Primary analytics interface with entity-based analysis',
    path: '/data-explorer',
    default: true
  },
  ADVANCED_SEARCH: {
    id: 'advanced-search',
    label: 'Advanced Search',
    icon: 'search',
    description: 'Detailed contract search with filtering',
    path: '/advanced-search'
  },
  API_DOCS: {
    id: 'api-docs',
    label: 'API Docs',
    icon: 'code',
    description: 'Complete API documentation',
    path: '/api-docs',
    external: true // Opens API documentation
  },
  HELP: {
    id: 'help',
    label: 'Help',
    icon: 'question-circle',
    description: 'User guide and support information',
    path: '/help'
  },
  ABOUT: {
    id: 'about',
    label: 'About',
    icon: 'info-circle',
    description: 'Technical details and data sources',
    path: '/about'
  }
} as const;
```

### Tab Order and Navigation
```typescript
export const TAB_ORDER = [
  TABS.DATA_EXPLORER,
  TABS.ADVANCED_SEARCH,
  TABS.API_DOCS,
  TABS.HELP,
  TABS.ABOUT
];

export const DEFAULT_TAB = TABS.DATA_EXPLORER;
```

## 🎯 Constant Categories

### Navigation Constants
- **Tab Definitions**: Main dashboard tabs with metadata
- **Route Paths**: URL patterns for each tab
- **Tab Icons**: Icon identifiers for UI display
- **Default States**: Initial tab and navigation state

### API Constants
```typescript
// Example API constants (may be in other files)
export const API_ENDPOINTS = {
  CONTRACTS_SEARCH: '/contracts/chip-search/',
  CONTRACTS_EXPORT: '/contracts/chip-export/',
  FILTER_OPTIONS: '/contracts/filter-options/',
  // ... other endpoints
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.VITE_API_URL || 'http://localhost:3200',
  VERSION: 'v1',
  TIMEOUT: 30000,
  RATE_LIMIT: 240 // requests per hour
} as const;
```

### UI Constants
```typescript
// Example UI constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_VISIBLE_PAGES: 7
} as const;

export const EXPORT_CONFIG = {
  MAX_RECORDS: 5000000,
  CHUNK_SIZE: 25000,
  SUPPORTED_FORMATS: ['csv'] as const
} as const;
```

### Data Constants
```typescript
// Example data-related constants
export const DATA_RANGES = {
  MIN_YEAR: 2013,
  MAX_YEAR: 2025,
  DEFAULT_VALUE_RANGE: { min: 0, max: 1000000000000 } // 1T
} as const;

export const DIMENSIONS = {
  CONTRACTOR: 'by_contractor',
  ORGANIZATION: 'by_organization',
  AREA: 'by_area',
  CATEGORY: 'by_category'
} as const;
```

## 🔧 Benefits of Constants

### Type Safety
- **const assertions** ensure immutable constant objects
- **TypeScript inference** provides autocomplete and validation
- **Compile-time checking** prevents typos and invalid values

### Maintainability
- **Single Source of Truth**: All configuration in one place
- **Easy Updates**: Change constants instead of hardcoded values
- **Consistency**: Shared values across components
- **Documentation**: Constants serve as implicit documentation

### Performance
- **No Runtime Computation**: Values known at compile time
- **Bundle Optimization**: Dead code elimination of unused constants
- **Memory Efficiency**: Shared references instead of duplicates

## 🔗 Usage Patterns

### Component Integration
```typescript
import { TABS, TAB_ORDER } from '../constants/tabs';

const NavigationTabs = () => {
  return (
    <TabContainer>
      {TAB_ORDER.map(tab => (
        <Tab key={tab.id} {...tab} />
      ))}
    </TabContainer>
  );
};
```

### Type Derivation
```typescript
// Derive types from constants
type TabId = keyof typeof TABS;
type TabConfig = typeof TABS[TabId];
```

### Environment Integration
```typescript
// Environment-dependent constants
export const CONFIG = {
  API_URL: process.env.VITE_API_URL || 'http://localhost:3200',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  DEBUG: process.env.NODE_ENV === 'development'
} as const;
```

---

Part of the [Frontend Source](../) providing centralized constant definitions and configuration values used throughout the React application.