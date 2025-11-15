# Advanced Search Hook Tests

This directory contains unit tests for the advanced search React hooks.

## 📁 Test Files

- **`useAdvancedSearchData.test.ts`** - Tests for the data fetching and search execution hook
- **`useAdvancedSearchFilters.test.ts`** - Tests for the filter state management hook

## 🧪 Test Coverage

### `useAdvancedSearchData.test.ts`
Tests for the data management hook including:
- Search execution with different filter combinations
- Loading state management
- Error handling during API calls
- Pagination state updates
- Export functionality
- Analytics data fetching

### `useAdvancedSearchFilters.test.ts`
Tests for the filter state hook including:
- Filter state initialization
- Adding/removing filter chips
- Keyword management
- Date range validation
- Value range filtering
- Predefined filter loading/saving
- Filter persistence across sessions

## 🎯 Testing Strategy

### Test Categories
- **State Management**: Filter state updates and persistence
- **API Integration**: Mock API calls and response handling
- **User Interactions**: Filter additions, removals, and modifications
- **Edge Cases**: Invalid inputs, empty results, error conditions
- **Performance**: State update efficiency and re-render optimization

### Testing Tools
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **Mock Service Worker (MSW)**: API mocking for integration tests

## 🔧 Running Tests

```bash
# Run all advanced search hook tests
npm test -- --grep "advanced-search"

# Run specific test file
npm test -- useAdvancedSearchData.test.ts
npm test -- useAdvancedSearchFilters.test.ts

# Run with coverage
npm test -- --coverage advanced-search
```

## 📊 Test Metrics

Tests ensure:
- ✅ 100% hook function coverage
- ✅ All state transitions tested
- ✅ Error boundaries validated
- ✅ API integration verified
- ✅ Performance regression prevention

---

Part of the [Advanced Search Hooks](../) testing suite within the [Frontend Testing](./) infrastructure.