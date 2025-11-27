# Modular Contracts Table - Usage Guide

## 📋 Overview

The ContractsTable has been refactored into a modular, configurable component system:

- **ContractsTable.tsx** - Main table component (~250 lines, down from ~475)
- **ContractRow.tsx** - Reusable row subcomponent (~250 lines)
- **contracts-table-config.ts** - Configuration presets and utilities

## 🎯 Key Benefits

✅ **Modular** - Row logic separated into its own component  
✅ **Configurable** - Change line counts with a single prop  
✅ **Maintainable** - No magic numbers, all values derived from config  
✅ **Reusable** - ContractRow can be used independently  
✅ **Testable** - Easier to unit test row rendering  

---

## 🚀 Basic Usage

### Default Configuration (2 lines)

```typescript
import { ContractsTable } from './ContractsTable'

<ContractsTable
  contracts={contractsData}
  totalCount={209198}
  pageSize={25}
  currentPage={1}
  totalPages={8368}
  sortBy="cost_php"
  sortDirection="desc"
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  onSortChange={handleSortChange}
  onContractClick={handleContractClick}
  onViewContractDetails={handleViewDetails}
  isDark={false}
  // No rowConfig needed - uses default (2 lines)
/>
```

---

## ⚙️ Custom Configurations

### Expanded View (3 lines)

```typescript
import { ContractsTable } from './ContractsTable'
import { TABLE_CONFIGS } from './contracts-table-config'

<ContractsTable
  {...props}
  rowConfig={TABLE_CONFIGS.expanded}  // 3 lines each
/>
```

### Compact View (1 line)

```typescript
<ContractsTable
  {...props}
  rowConfig={TABLE_CONFIGS.compact}  // 1 line each
/>
```

### Detailed View (4 lines)

```typescript
<ContractsTable
  {...props}
  rowConfig={TABLE_CONFIGS.detailed}  // 4 lines each
/>
```

---

## 🎨 Available Presets

| Preset | Contractors | Description | Row Height | Records/Screen | Best For |
|--------|-------------|-------------|------------|----------------|----------|
| `compact` | 1 line | 1 line | ~95px | 12-15 | Mobile, high-density |
| `default` | 2 lines | 2 lines | ~145px | 7-8 | Standard desktop |
| `expanded` | 3 lines | 3 lines | ~205px | 5-6 | Large screens |
| `detailed` | 4 lines | 4 lines | ~265px | 3-4 | Full information |

---

## 🛠️ Custom Configuration

### Create Your Own Config

```typescript
import type { ContractRowConfig } from './contracts-table-config'

const myCustomConfig: ContractRowConfig = {
  maxLines: {
    contractors: 2,
    description: 3  // Different from contractors!
  },
  lineHeight: 1.8,  // Custom line height
  fontSize: {
    primary: '15px',   // Custom font size
    secondary: '13px'
  }
}

<ContractsTable
  {...props}
  rowConfig={myCustomConfig}
/>
```

### Calculate Height Before Rendering

```typescript
import { getLayoutValues } from './contracts-table-config'

const config = TABLE_CONFIGS.expanded
const layout = getLayoutValues(config)

console.log('Row 2 Height:', layout.row2Height)  // "6em"
console.log('Estimated Row Height:', layout.estimatedRowHeight)  // ~205px
console.log('Contractors Lines:', layout.contractorsLines)  // 3
```

---

## 📦 Component Architecture

### ContractsTable (Main)

**Responsibilities:**
- Table structure (thead, tbody, pagination)
- Header rendering and sorting
- Pagination controls
- Loading overlay
- Format functions (currency, date, status color)

**Delegates to ContractRow:**
- Individual contract row rendering
- Two-row stacked layout
- Hover effects
- Click handlers

### ContractRow (Subcomponent)

**Responsibilities:**
- Render single contract as two stacked rows
- Apply configuration (line counts, heights)
- Handle row-level interactions
- Synchronized hover effects

**Props:**
```typescript
interface ContractRowProps {
  contract: Contract           // Contract data
  index: number                // Row index (for alternating colors)
  isDark: boolean              // Theme
  config: ContractRowConfig    // Layout configuration
  onContractClick?: (contract: Contract) => void
  onViewContractDetails?: (contract: Contract) => void
  formatCurrency: (amount: number | null) => string
  formatDate: (dateString: string | null) => string
  getStatusColor: (status: string | null) => string
}
```

### contracts-table-config.ts

**Exports:**
- `ContractRowConfig` - TypeScript interface
- `TABLE_CONFIGS` - Preset configurations (compact, default, expanded, detailed)
- `DEFAULT_ROW_CONFIG` - Default preset (2 lines)
- `getLayoutValues()` - Calculate derived values from config
- `TableConfigPreset` - Type for preset keys

---

## 🔧 Advanced Usage

### Dynamic Configuration Based on Screen Size

```typescript
import { useState, useEffect } from 'react'
import { TABLE_CONFIGS, type TableConfigPreset } from './contracts-table-config'

function ContractsExplorer() {
  const [preset, setPreset] = useState<TableConfigPreset>('default')
  
  // Adjust config based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setPreset('compact')
      } else if (width < 1200) {
        setPreset('default')
      } else {
        setPreset('expanded')
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return (
    <ContractsTable
      {...props}
      rowConfig={TABLE_CONFIGS[preset]}
    />
  )
}
```

### User Preference with Local Storage

```typescript
function ContractsExplorer() {
  const [preset, setPreset] = useState<TableConfigPreset>(() => {
    const saved = localStorage.getItem('tablePreset')
    return (saved as TableConfigPreset) || 'default'
  })
  
  const handlePresetChange = (newPreset: TableConfigPreset) => {
    setPreset(newPreset)
    localStorage.setItem('tablePreset', newPreset)
  }
  
  return (
    <>
      {/* Preset Selector */}
      <select value={preset} onChange={e => handlePresetChange(e.target.value as TableConfigPreset)}>
        <option value="compact">Compact</option>
        <option value="default">Default</option>
        <option value="expanded">Expanded</option>
        <option value="detailed">Detailed</option>
      </select>
      
      <ContractsTable
        {...props}
        rowConfig={TABLE_CONFIGS[preset]}
      />
    </>
  )
}
```

---

## 📊 Migration Guide

### Before (Hardcoded Values)

```typescript
// Multiple places to change
WebkitLineClamp: 2,      // Line 277
height: '4em',           // Line 360
height: '4em',           // Line 376  
height: '4em',           // Line 384
WebkitLineClamp: 2,      // Line 364
```

**Issues:**
- ❌ Change 5+ places to modify line count
- ❌ Easy to miss cells and break layout
- ❌ No configuration flexibility
- ❌ Difficult to test different layouts

### After (Modular)

```typescript
// Change in ONE place
<ContractsTable
  {...props}
  rowConfig={TABLE_CONFIGS.expanded}  // 3 lines!
/>
```

**Benefits:**
- ✅ Change in one place
- ✅ All cells automatically sync
- ✅ Multiple presets available
- ✅ Easy to test and customize

---

## 🧪 Testing

### Test ContractRow Independently

```typescript
import { render, screen } from '@testing-library/react'
import { ContractRow } from './ContractRow'
import { DEFAULT_ROW_CONFIG, TABLE_CONFIGS } from './contracts-table-config'

test('renders contract with default config', () => {
  render(
    <table><tbody>
      <ContractRow
        contract={mockContract}
        index={0}
        isDark={false}
        config={DEFAULT_ROW_CONFIG}
        formatCurrency={jest.fn()}
        formatDate={jest.fn()}
        getStatusColor={jest.fn()}
      />
    </tbody></table>
  )
  
  expect(screen.getByText(mockContract.contract_id)).toBeInTheDocument()
})

test('renders with expanded config (3 lines)', () => {
  const { container } = render(
    <table><tbody>
      <ContractRow
        contract={mockContract}
        index={0}
        isDark={false}
        config={TABLE_CONFIGS.expanded}
        {...otherProps}
      />
    </tbody></table>
  )
  
  // Check that WebkitLineClamp is 3
  const descriptionCell = container.querySelector('td[style*="line-clamp"]')
  expect(descriptionCell).toHaveStyle({ WebkitLineClamp: 3 })
})
```

---

## 📝 Configuration Reference

### ContractRowConfig Interface

```typescript
interface ContractRowConfig {
  maxLines: {
    contractors: number    // Number of lines for contractors field
    description: number    // Number of lines for description field
  }
  lineHeight: number       // Line height multiplier (e.g., 2.0)
  fontSize: {
    primary: string        // Font size for Row 1 (e.g., '14px')
    secondary: string      // Font size for Row 2 (e.g., '12px')
  }
}
```

### Calculated Values

```typescript
const layout = getLayoutValues(config)

layout.contractorsLines    // config.maxLines.contractors
layout.descriptionLines    // config.maxLines.description
layout.lineHeight          // config.lineHeight
layout.row2Height          // `${description × lineHeight}em`
layout.estimatedRowHeight  // Approximate height in pixels
```

---

## 💡 Best Practices

1. **Use Presets First** - Start with built-in presets before creating custom configs
2. **Test on Different Screens** - Verify layout on various viewport sizes
3. **Consider Information Density** - Balance visibility vs. scrolling
4. **Maintain Consistency** - Use same preset across similar tables
5. **Provide User Choice** - Let power users choose their preferred density

---

## 🔮 Future Enhancements

Possible improvements:
- [ ] Add animation when switching configs
- [ ] Persist user preference per table
- [ ] Add "auto" mode that adjusts based on viewport
- [ ] Support different configs for different columns
- [ ] Add accessibility preferences (larger text for vision impaired)

---

## 📚 Related Documentation

- [TABLE_LINE_SPACING_ANALYSIS.md](../../../../test/TABLE_LINE_SPACING_ANALYSIS.md) - Original spacing analysis
- [STACKED_ROWS_IMPLEMENTATION_GUIDE.md](../../../../test/STACKED_ROWS_IMPLEMENTATION_GUIDE.md) - Implementation patterns
- [CONTRACTS_FIELD_LAYOUT_ANALYSIS.md](../../../../test/CONTRACTS_FIELD_LAYOUT_ANALYSIS.md) - Field-by-field breakdown

---

*Last Updated: November 27, 2025*  
*Version: 2.0.0 (Modular Refactor)*


