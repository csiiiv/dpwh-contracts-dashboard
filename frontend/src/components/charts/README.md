# Chart Components

This directory contains reusable chart components for data visualization across the dashboard.

## 📁 Components

- **`D3TreemapChart.tsx`** - D3.js-based treemap visualization component
- **`QuarterlyTrendsChart.tsx`** - Quarterly trend analysis chart
- **`TreemapChart.tsx`** - Alternative treemap implementation

## 📊 Chart Types

### D3TreemapChart
- **Purpose**: Hierarchical data visualization using D3.js
- **Features**: Interactive drill-down, responsive sizing, smooth animations
- **Use Cases**: Market share analysis, spending distribution, entity comparison
- **Data Format**: Hierarchical objects with value and label properties

### QuarterlyTrendsChart  
- **Purpose**: Time-series analysis showing quarterly trends
- **Features**: Line/bar chart options, multiple data series, time-based filtering
- **Use Cases**: Spending trends over time, seasonal analysis, year-over-year comparison
- **Data Format**: Time-series data with quarter/year groupings

### TreemapChart
- **Purpose**: Alternative treemap implementation (possibly using different library)
- **Features**: Simplified treemap for basic hierarchical visualization
- **Use Cases**: Quick category breakdowns, simple proportional displays
- **Data Format**: Flat array with value and category properties

## 🎨 Visual Design

### Consistent Theming
- Responsive to dashboard light/dark mode
- Consistent color palettes across all charts
- Professional typography and spacing
- Accessible color contrast ratios

### Interactive Features
- **Hover States**: Detailed tooltips with contextual information
- **Click Events**: Navigation to detailed views or drill-down
- **Zoom/Pan**: Navigation for large datasets
- **Legend Controls**: Show/hide data series

## 🔧 Technical Implementation

### Libraries Used
- **D3.js**: Advanced data-driven visualizations
- **Chart.js**: Standard chart types with React integration
- **Recharts**: React-native chart components
- **Styled Components**: Consistent styling and theming

### Performance Optimizations
- **Memoization**: Prevent unnecessary re-renders
- **Data Sampling**: Handle large datasets efficiently  
- **Virtualization**: Render only visible chart elements
- **Lazy Loading**: Load charts only when needed

## 🔗 Integration Points

### Used By
- **Data Explorer**: Analytics visualization
- **Advanced Search**: Search result trends
- **Treemap Page**: Main visualization component
- **Analytics Modals**: Embedded trend analysis

### Data Sources
- Real-time API calls for current data
- Cached aggregations for performance
- Filtered datasets based on user selections

## 📈 Chart Configuration

### Common Props
```typescript
interface ChartProps {
  data: ChartData[]
  width?: number
  height?: number
  theme: 'light' | 'dark'
  interactive?: boolean
  onElementClick?: (element: ChartElement) => void
  loading?: boolean
}
```

### Responsive Behavior
- Automatic sizing based on container
- Mobile-optimized layouts
- Touch-friendly interactions on mobile devices

---

Part of the [Frontend Components](../) system providing visualization capabilities across the dashboard.