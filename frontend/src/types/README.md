# TypeScript Type Definitions

This directory contains TypeScript type definitions and interfaces used throughout the frontend application.

## 📁 Structure

- **`index.ts`** - Centralized export of all type definitions

## 🏗️ Type Categories

### API Types
```typescript
// Contract and entity data types
interface Contract {
  id: number;
  reference_id: string;
  award_title: string;
  organization_name: string;
  awardee_name: string;
  contract_amount: number;
  award_date: string;
  // ... additional properties
}

interface ContractSearchParams {
  contractors: string[];
  areas: string[];
  organizations: string[];
  business_categories: string[];
  keywords: string[];
  time_ranges: TimeRange[];
  // ... additional search parameters
}
```

### Component Props Types
```typescript
// Reusable component prop interfaces
interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  pagination?: PaginationConfig;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
}

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: (value: string) => void;
  color?: 'primary' | 'secondary' | 'accent';
}
```

### State Management Types
```typescript
// Zustand store types
interface AppState {
  theme: 'light' | 'dark';
  filters: SearchFilters;
  searchResults: SearchResults;
  loading: boolean;
  error: string | null;
}

interface SearchFilters {
  contractors: string[];
  areas: string[];
  organizations: string[];
  keywords: string[];
  dateRange: DateRange;
  valueRange: ValueRange;
}
```

### Chart and Visualization Types
```typescript
// Data visualization interfaces
interface ChartData {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

interface TreemapNode {
  name: string;
  value: number;
  children?: TreemapNode[];
  color: string;
}
```

### Utility Types
```typescript
// Common utility types
type ApiResponse<T> = {
  data: T;
  pagination?: PaginationInfo;
  success: boolean;
  error?: string;
};

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};
```

## 🎯 Type Safety Benefits

### Compile-Time Validation
- **Interface Compliance**: Ensure components receive correct props
- **API Contract Enforcement**: Validate API response structures
- **State Type Safety**: Prevent state mutation errors
- **Function Signature Validation**: Ensure correct parameter types

### Development Experience
- **IntelliSense Support**: Auto-completion and type hints
- **Refactoring Safety**: Catch breaking changes during refactoring
- **Documentation**: Types serve as inline documentation
- **Error Prevention**: Catch type-related bugs before runtime

## 🔧 Type Organization

### Export Strategy
```typescript
// Centralized exports in index.ts
export type { Contract, Contractor, Organization, Area, BusinessCategory };
export type { SearchParams, SearchResults, FilterState };
export type { ChartData, TreemapNode, AnalyticsData };
export type { ApiResponse, AsyncState, TableProps };
```

### Naming Conventions
- **Interfaces**: PascalCase (e.g., `ContractData`)
- **Type Aliases**: PascalCase (e.g., `SearchState`)
- **Generic Types**: Single letter or descriptive (e.g., `T`, `DataType`)
- **Union Types**: Descriptive names (e.g., `ThemeMode`)

## 🔗 Integration

### Used Throughout
- **Components**: Props validation and state typing
- **Hooks**: Return type definitions and parameter typing
- **Services**: API request/response typing
- **Stores**: State shape and action typing
- **Utils**: Function parameter and return typing

### Type Guards and Validation
```typescript
// Runtime type validation helpers
const isContract = (obj: any): obj is Contract => {
  return obj && typeof obj.id === 'number' && typeof obj.award_title === 'string';
};

const assertNonNull = <T>(value: T | null | undefined): T => {
  if (value == null) throw new Error('Value cannot be null or undefined');
  return value;
};
```

## 📊 Type Complexity Management

### Generic Types
- Reusable interfaces with type parameters
- Constraint-based generic types
- Conditional types for advanced scenarios

### Union and Intersection Types
- State variant representations
- Combined interface requirements
- Discriminated unions for type safety

---

Part of the [Frontend Source](../) providing comprehensive type safety across the entire React application.