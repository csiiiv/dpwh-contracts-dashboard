# Treemap Visualization Feature

This directory contains components for the interactive treemap visualization feature.

## 📁 Components

- **`TreemapPage.tsx`** - Main treemap page component with controls and visualization
- **`index.ts`** - Component exports

## 🎯 Purpose

The Treemap feature provides hierarchical data visualization where:
- **Rectangle size** represents contract value
- **Color coding** differentiates categories or entities
- **Drill-down capability** allows exploring nested data structures
- **Interactive filtering** focuses on specific data subsets

## 🗺️ Visualization Types

### Data Dimensions
- **By Contractors** - Visualize top contractors by contract value
- **By Organizations** - Government agencies spending visualization
- **By Areas** - Geographic spending distribution
- **By Categories** - Business category breakdown

### Interactive Features
- **Hover Details** - Show entity information on hover
- **Click Navigation** - Drill down into specific entities
- **Zoom Controls** - Navigate hierarchical data levels
- **Filter Integration** - Apply filters to focus visualization

## 🔧 Technical Implementation

### Chart Library Integration
- Uses D3.js for treemap calculations and rendering
- Responsive design adapts to different screen sizes
- Smooth animations for transitions and interactions

### Data Processing
- Aggregates contract data by selected dimension
- Calculates hierarchical structures for nested visualization
- Applies filtering and sorting for optimal display

## 🎨 Visual Design

### Color Scheme
- Consistent with dashboard theme (dark/light mode)
- Categorical colors for different entity types
- Value-based color intensity variations

### Layout
- Responsive treemap sizing
- Control panel for dimension selection
- Legend and value indicators

## 📊 Use Cases

### Market Analysis
- Identify dominant contractors in specific sectors
- Analyze government spending patterns by region
- Compare relative market shares visually

### Transparency Research
- Quickly spot spending concentration
- Visual identification of major contract recipients
- Geographic spending distribution analysis

---

Part of the [Features Components](../) within the [Frontend Components](../../) system.