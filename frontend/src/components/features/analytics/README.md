# Analytics Feature Components

This directory contains components for the analytics functionality used across different features.

## 📁 Components

- **`AnalyticsControls.tsx`** - Control panel for analytics configuration
- **`AnalyticsSummary.tsx`** - Summary statistics display component
- **`AnalyticsTable.tsx`** - Analytics data table with sorting and pagination

## 🎯 Purpose

These analytics components provide:
- **Configurable Analytics** - Dimension and metric selection controls
- **Statistical Summaries** - Key metrics and totals display
- **Tabular Analysis** - Detailed analytics results in table format

## 📊 Analytics Capabilities

### Dimensions
- **By Contractor** - Analyze spending by contractor entities
- **By Organization** - Government agency spending analysis
- **By Area** - Geographic/regional spending breakdown
- **By Category** - Business category analysis

### Metrics
- **Contract Amount** - Total contract values
- **Contract Count** - Number of contracts
- **Average Value** - Average contract amounts
- **Trend Analysis** - Time-based patterns

## 🔧 Component Architecture

### AnalyticsControls
- Dimension selector (contractors/organizations/areas/categories)
- Metric selector (amount/count/average)
- Time range filtering options
- Entity-specific filtering controls

### AnalyticsSummary  
- Total contract count and value displays
- Average calculations
- Percentage breakdowns
- Key performance indicators

### AnalyticsTable
- Sortable columns for all metrics
- Pagination for large datasets
- Export functionality (CSV)
- Drill-down capabilities to individual contracts
- Search and filtering within results

## 🎨 Visual Design

### Layout
- Clean, professional table design
- Responsive column layouts
- Consistent with dashboard theming
- Accessible color schemes for data visualization

### Interactions
- Click-to-sort on column headers
- Hover states for interactive elements
- Loading states during data fetching
- Error states with retry options

## 🔗 Integration

These components are used in:
- **Data Explorer** - Primary analytics interface
- **Advanced Search** - Analytics modal for search results
- **Entity Drill-down** - Detailed entity analysis

## 📈 Data Flow

1. **Controls** → Configure analytics parameters
2. **API Call** → Fetch aggregated data based on configuration  
3. **Summary** → Display high-level statistics
4. **Table** → Show detailed analytics results
5. **Export** → Download data for external analysis

---

Part of the [Features Components](../) within the [Frontend Components](../../) system.