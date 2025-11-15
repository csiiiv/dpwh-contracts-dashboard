# Services Directory

This directory contains service layer components for API communication and business logic in the PHILGEPS Awards Data Explorer frontend. All data processing is handled server-side via REST API calls.

## 📁 Directory Structure

### Core Services

#### `AdvancedSearchService.ts`
Service for advanced search functionality and API communication with the Django backend.

**Features:**
- Search query construction and API calls
- Contract search with chip-based filters
- Analytics data retrieval
- Export functionality
- Filter management and pagination

**Key Methods:**
- `searchContractsWithChips()` - Execute advanced search queries
- `chipAggregates()` - Get analytics data for charts
- `chipExport()` - Handle CSV export functionality
- `getFilterOptions()` - Retrieve available filter options

#### `UnifiedDataServiceImproved.ts`
Unified data service for all data operations and API communication.

**Features:**
- Centralized API communication
- Data transformation and normalization
- Error handling and retry logic
- Caching strategies for performance
- Service composition and orchestration

**Key Methods:**
- `fetchData()` - Generic data fetching with caching
- `processData()` - Data transformation and validation
- `handleErrors()` - Centralized error handling
- `cacheData()` - Response caching management

## 🎯 Service Architecture

### Service Layer Pattern
The services follow a service layer pattern that:
- **Separates Concerns** - Separates API logic from UI components
- **Centralizes Logic** - Centralizes business logic and data processing
- **Provides Abstraction** - Provides clean abstraction over API calls
- **Handles Errors** - Centralizes error handling and recovery

### API Communication
Services handle all API communication with:
- **HTTP Requests** - RESTful API calls
- **Data Serialization** - Request/response serialization
- **Error Handling** - API error handling and recovery
- **Caching** - Response caching for performance

### Data Processing
Services handle data processing on the client side:
- **Data Transformation** - Transform API responses to UI-friendly formats
- **Data Validation** - Validate data integrity and structure
- **Data Normalization** - Normalize data for consistent usage
- **Server-Side Processing** - All heavy data processing is handled by the Django backend with DuckDB
- **Data Aggregation** - Aggregate data for analytics and reporting

## 🔧 Usage

### Advanced Search Service
```typescript
import { AdvancedSearchService } from './services/AdvancedSearchService'

const searchService = new AdvancedSearchService()

// Perform search
const results = await searchService.performSearch({
  query: 'construction',
  filters: { category: 'infrastructure' },
  page: 1,
  pageSize: 20
})
```

### Unified Data Service
```typescript
import { unifiedDataServiceImproved } from './services/UnifiedDataServiceImproved'

// Fetch data
const data = await unifiedDataServiceImproved.fetchData('/api/v1/contracts/')

// Process data
const processedData = unifiedDataServiceImproved.processData(data)
```

## 📊 Service Features

### Search Functionality
- **Query Construction** - Build complex search queries
- **Filter Management** - Handle multiple filter criteria
- **Sorting** - Sort results by various criteria
- **Pagination** - Handle large result sets efficiently

### Data Management
- **Data Fetching** - Efficient data fetching with caching
- **Data Processing** - Transform and normalize data
- **Data Validation** - Ensure data integrity
- **Data Caching** - Cache frequently accessed data

### Error Handling
- **API Errors** - Handle API errors gracefully
- **Network Errors** - Handle network connectivity issues
- **Data Errors** - Handle data validation errors
- **User Feedback** - Provide meaningful error messages

### Performance Optimization
- **Request Batching** - Batch multiple requests
- **Response Caching** - Cache API responses
- **Lazy Loading** - Load data on demand
- **Debouncing** - Debounce rapid API calls

## 🛠️ Development Guidelines

### Service Design
- **Single Responsibility** - Each service has a single responsibility
- **Interface Segregation** - Use focused interfaces
- **Dependency Injection** - Use dependency injection for testability
- **Error Handling** - Implement comprehensive error handling

### API Integration
- **RESTful Design** - Follow RESTful API design principles
- **Consistent Naming** - Use consistent naming conventions
- **Error Codes** - Use standard HTTP error codes
- **Response Format** - Use consistent response formats

### Testing
- **Unit Tests** - Write comprehensive unit tests
- **Integration Tests** - Test API integration
- **Mock Services** - Use mock services for testing
- **Error Scenarios** - Test error handling scenarios

## 📝 Service Documentation

Each service includes:
- **API Documentation** - Document all public methods
- **Usage Examples** - Provide usage examples
- **Error Handling** - Document error handling
- **Performance Notes** - Document performance considerations
- **Dependencies** - List service dependencies
