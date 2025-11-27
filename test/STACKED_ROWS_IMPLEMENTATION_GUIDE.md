# Stacked Rows Implementation Guide

A practical guide for implementing the two-row stacked pattern used in ContractsTable.

---

## Core Pattern: Two Rows in React.Fragment

### Basic Structure

```typescript
{data.map((item, idx) => (
  <React.Fragment key={item.id}>
    {/* Row 1: Primary Data */}
    <tr 
      style={{
        borderBottom: 'none',  // ← Critical: No border between rows
        backgroundColor: rowBg
      }}
      onMouseEnter={handleRow1Hover}
      onMouseLeave={handleRow1Leave}
    >
      {/* Cells... */}
    </tr>
    
    {/* Row 2: Detail Data */}
    <tr
      style={{
        borderBottom: `1px solid ${borderColor}`,  // ← Border after row group
        backgroundColor: rowBg
      }}
      onMouseEnter={handleRow2Hover}
      onMouseLeave={handleRow2Leave}
    >
      {/* Cells... */}
    </tr>
  </React.Fragment>
))}
```

---

## Cell Types and Styling

### 1. RowSpan Cells (Span Both Rows)

```typescript
<td 
  rowSpan={2}
  style={{
    padding: spacing[2],              // 8px all sides
    verticalAlign: 'middle',          // Center vertically
    borderBottom: `1px solid ${borderColor}`, // Border at final bottom
    textAlign: 'center'               // Optional
  }}
>
  {content}
</td>
```

**Use for:**
- Action buttons
- IDs or primary keys
- Status badges
- Monetary values
- Any field that should visually "anchor" both rows

---

### 2. Row 1 Regular Cells

```typescript
<td 
  style={{
    padding: spacing[2],              // 8px all sides
    verticalAlign: 'top',             // Align to top
    lineHeight: '2.0',                // 2x line height
    maxWidth: '400px',                // Prevent overflow
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,               // Max 2 lines
    WebkitBoxOrient: 'vertical'
  }}
>
  {content}
</td>
```

**Use for:**
- Names
- Short descriptions
- Categories
- Dates

---

### 3. Row 2 Detail Cells (ZERO TOP PADDING!)

```typescript
<td 
  style={{
    padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}`, // ← 0 top!
    verticalAlign: 'top',             // Align to top
    lineHeight: '2.0',                // 2x line height
    height: '4em',                    // Fixed height (64px)
    maxWidth: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  }}
>
  {content}
</td>
```

**Use for:**
- Long descriptions
- Additional details
- Secondary information

---

## Header Implementation

### Two-Row Header with RowSpan

```typescript
<thead>
  {/* Header Row 1 */}
  <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
    <th rowSpan={2} style={headerRowSpanStyle}>
      ID
    </th>
    <th style={headerRow1Style}>
      Primary Info
    </th>
    <th rowSpan={2} style={headerRowSpanStyle}>
      Status
    </th>
  </tr>
  
  {/* Header Row 2 */}
  <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
    <th style={headerRow2Style}>
      Detail Info
    </th>
  </tr>
</thead>
```

### Header Styles

```typescript
// Headers that span both rows
const headerRowSpanStyle = {
  padding: spacing[2],
  borderBottom: `2px solid ${borderColor}`,
  fontWeight: 600,
  fontSize: typography.fontSize.xs,
  color: textSecondary,
  cursor: 'pointer'
}

// Header Row 1 regular headers
const headerRow1Style = {
  padding: `${spacing[2]} ${spacing[2]} ${spacing[1]} ${spacing[2]}`,
  fontWeight: 600,
  fontSize: typography.fontSize.xs,
  color: textSecondary,
  cursor: 'pointer'
}

// Header Row 2
const headerRow2Style = {
  padding: `${spacing[1]} ${spacing[2]} ${spacing[2]} ${spacing[2]}`,
  fontWeight: 600,
  fontSize: typography.fontSize.xs,
  color: textSecondary,
  cursor: 'pointer'
}
```

---

## Synchronized Hover Effects

### Complete Implementation

```typescript
const handleRow1Enter = (e: React.MouseEvent<HTMLTableRowElement>) => {
  const currentRow = e.currentTarget
  const nextRow = currentRow.nextElementSibling as HTMLElement
  
  currentRow.style.backgroundColor = hoverBg
  if (nextRow) nextRow.style.backgroundColor = hoverBg
}

const handleRow1Leave = (e: React.MouseEvent<HTMLTableRowElement>) => {
  const currentRow = e.currentTarget
  const nextRow = currentRow.nextElementSibling as HTMLElement
  
  currentRow.style.backgroundColor = rowBg
  if (nextRow) nextRow.style.backgroundColor = rowBg
}

const handleRow2Enter = (e: React.MouseEvent<HTMLTableRowElement>) => {
  const currentRow = e.currentTarget
  const prevRow = currentRow.previousElementSibling as HTMLElement
  
  currentRow.style.backgroundColor = hoverBg
  if (prevRow) prevRow.style.backgroundColor = hoverBg
}

const handleRow2Leave = (e: React.MouseEvent<HTMLTableRowElement>) => {
  const currentRow = e.currentTarget
  const prevRow = currentRow.previousElementSibling as HTMLElement
  
  currentRow.style.backgroundColor = rowBg
  if (prevRow) prevRow.style.backgroundColor = rowBg
}
```

### Applied to Rows

```typescript
<React.Fragment key={item.id}>
  <tr 
    onMouseEnter={handleRow1Enter}
    onMouseLeave={handleRow1Leave}
    onClick={() => onItemClick(item)}
  >
    {/* Row 1 cells */}
  </tr>
  
  <tr 
    onMouseEnter={handleRow2Enter}
    onMouseLeave={handleRow2Leave}
    onClick={() => onItemClick(item)}
  >
    {/* Row 2 cells */}
  </tr>
</React.Fragment>
```

---

## Complete Example

```typescript
import React from 'react'
import { spacing, typography } from '../design-system'

interface DataItem {
  id: string
  name: string
  description: string
  status: string
  amount: number
  date: string
}

interface Props {
  data: DataItem[]
  isDark?: boolean
}

export const StackedTable: React.FC<Props> = ({ data, isDark = false }) => {
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const hoverBg = isDark ? '#1f2937' : '#f9fafb'
  const textPrimary = isDark ? '#f3f4f6' : '#111827'
  const textSecondary = isDark ? '#9ca3af' : '#6b7280'
  
  const getRowBg = (idx: number) => {
    const isEven = idx % 2 === 0
    return isEven 
      ? 'transparent' 
      : (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)')
  }
  
  return (
    <table style={{ 
      width: '100%', 
      borderCollapse: 'separate',
      borderSpacing: 0 
    }}>
      <thead>
        {/* Header Row 1 */}
        <tr>
          <th 
            rowSpan={2}
            style={{ 
              padding: spacing[2],
              textAlign: 'center',
              borderBottom: `2px solid ${borderColor}`,
              fontWeight: 600,
              color: textSecondary
            }}
          >
            Actions
          </th>
          <th 
            rowSpan={2}
            style={{ 
              padding: spacing[2],
              borderBottom: `2px solid ${borderColor}`,
              fontWeight: 600,
              color: textSecondary
            }}
          >
            ID
          </th>
          <th 
            style={{ 
              padding: `${spacing[2]} ${spacing[2]} ${spacing[1]} ${spacing[2]}`,
              fontWeight: 600,
              color: textSecondary
            }}
          >
            Name
          </th>
          <th 
            rowSpan={2}
            style={{ 
              padding: spacing[2],
              borderBottom: `2px solid ${borderColor}`,
              fontWeight: 600,
              color: textSecondary
            }}
          >
            Status
          </th>
          <th 
            style={{ 
              padding: `${spacing[2]} ${spacing[2]} ${spacing[1]} ${spacing[2]}`,
              fontWeight: 600,
              color: textSecondary
            }}
          >
            Date
          </th>
          <th 
            rowSpan={2}
            style={{ 
              padding: spacing[2],
              textAlign: 'right',
              borderBottom: `2px solid ${borderColor}`,
              fontWeight: 600,
              color: textSecondary
            }}
          >
            Amount
          </th>
        </tr>
        
        {/* Header Row 2 */}
        <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
          <th 
            style={{ 
              padding: `${spacing[1]} ${spacing[2]} ${spacing[2]} ${spacing[2]}`,
              fontWeight: 600,
              color: textSecondary
            }}
          >
            Description
          </th>
          <th 
            style={{ 
              padding: `${spacing[1]} ${spacing[2]} ${spacing[2]} ${spacing[2]}`,
              fontWeight: 600,
              color: textSecondary
            }}
          >
            Details
          </th>
        </tr>
      </thead>
      
      <tbody>
        {data.map((item, idx) => {
          const rowBg = getRowBg(idx)
          
          return (
            <React.Fragment key={item.id}>
              {/* Row 1 */}
              <tr 
                style={{
                  borderBottom: 'none',
                  backgroundColor: rowBg,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  const nextRow = e.currentTarget.nextElementSibling as HTMLElement
                  e.currentTarget.style.backgroundColor = hoverBg
                  if (nextRow) nextRow.style.backgroundColor = hoverBg
                }}
                onMouseLeave={(e) => {
                  const nextRow = e.currentTarget.nextElementSibling as HTMLElement
                  e.currentTarget.style.backgroundColor = rowBg
                  if (nextRow) nextRow.style.backgroundColor = rowBg
                }}
              >
                {/* Action cell (rowSpan) */}
                <td 
                  rowSpan={2}
                  style={{
                    padding: spacing[2],
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    borderBottom: `1px solid ${borderColor}`
                  }}
                >
                  <button>🔍</button>
                </td>
                
                {/* ID cell (rowSpan) */}
                <td 
                  rowSpan={2}
                  style={{
                    padding: spacing[2],
                    verticalAlign: 'middle',
                    borderBottom: `1px solid ${borderColor}`,
                    fontWeight: 600,
                    color: textPrimary
                  }}
                >
                  {item.id}
                </td>
                
                {/* Name cell */}
                <td 
                  style={{
                    padding: spacing[2],
                    verticalAlign: 'top',
                    lineHeight: '2.0',
                    color: textPrimary
                  }}
                >
                  {item.name}
                </td>
                
                {/* Status cell (rowSpan) */}
                <td 
                  rowSpan={2}
                  style={{
                    padding: spacing[2],
                    verticalAlign: 'middle',
                    borderBottom: `1px solid ${borderColor}`
                  }}
                >
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: '#10b98120',
                    color: '#10b981',
                    fontWeight: 600
                  }}>
                    {item.status}
                  </span>
                </td>
                
                {/* Date cell */}
                <td 
                  style={{
                    padding: spacing[2],
                    verticalAlign: 'top',
                    color: textPrimary
                  }}
                >
                  {item.date}
                </td>
                
                {/* Amount cell (rowSpan) */}
                <td 
                  rowSpan={2}
                  style={{
                    padding: spacing[2],
                    textAlign: 'right',
                    verticalAlign: 'middle',
                    borderBottom: `1px solid ${borderColor}`,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: textPrimary
                  }}
                >
                  ${item.amount.toLocaleString()}
                </td>
              </tr>
              
              {/* Row 2 */}
              <tr 
                style={{
                  borderBottom: `1px solid ${borderColor}`,
                  backgroundColor: rowBg,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  const prevRow = e.currentTarget.previousElementSibling as HTMLElement
                  e.currentTarget.style.backgroundColor = hoverBg
                  if (prevRow) prevRow.style.backgroundColor = hoverBg
                }}
                onMouseLeave={(e) => {
                  const prevRow = e.currentTarget.previousElementSibling as HTMLElement
                  e.currentTarget.style.backgroundColor = rowBg
                  if (prevRow) prevRow.style.backgroundColor = rowBg
                }}
              >
                {/* Description cell - NOTE THE ZERO TOP PADDING */}
                <td 
                  style={{
                    padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}`,
                    verticalAlign: 'top',
                    lineHeight: '2.0',
                    height: '4em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as any,
                    color: textSecondary
                  }}
                >
                  {item.description}
                </td>
                
                {/* Details cell - ALSO ZERO TOP PADDING */}
                <td 
                  style={{
                    padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}`,
                    verticalAlign: 'top',
                    height: '4em',
                    color: textSecondary
                  }}
                >
                  Additional details...
                </td>
              </tr>
            </React.Fragment>
          )
        })}
      </tbody>
    </table>
  )
}
```

---

## Common Pitfalls and Solutions

### ❌ Problem: Gap between stacked rows

**Cause:** Row 1 has a border-bottom

**Solution:**
```typescript
// Row 1
borderBottom: 'none'  // ← Remove border

// Row 2
borderBottom: `1px solid ${borderColor}`  // ← Add border here instead
```

---

### ❌ Problem: Rows don't hover together

**Cause:** Missing sibling DOM updates in hover handlers

**Solution:**
```typescript
onMouseEnter={(e) => {
  const sibling = e.currentTarget.nextElementSibling // or previousElementSibling
  e.currentTarget.style.backgroundColor = hoverBg
  if (sibling) sibling.style.backgroundColor = hoverBg  // ← Don't forget this!
}}
```

---

### ❌ Problem: RowSpan cells not centered

**Cause:** Missing verticalAlign or wrong value

**Solution:**
```typescript
<td rowSpan={2} style={{ verticalAlign: 'middle' }}>  // ← Use 'middle'
  {content}
</td>
```

---

### ❌ Problem: Row 2 cells too tall

**Cause:** Top padding adding unwanted space

**Solution:**
```typescript
// Row 2 cells
padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}`
//        ↑ Must be 0!
```

---

### ❌ Problem: Text overflows and breaks layout

**Cause:** Missing text constraints

**Solution:**
```typescript
style={{
  maxWidth: '400px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical'
}}
```

---

## When to Use This Pattern

### ✅ Good Use Cases:

- Complex records with many fields
- Need to show both summary and detail info
- Want to maximize information density
- Desktop-first applications
- Data that naturally splits into "primary" and "secondary"

### ❌ Not Recommended For:

- Simple data (few columns)
- Mobile-first applications (consider cards instead)
- Rapidly changing data (complex hover state management)
- Accessibility-critical applications (screen readers may struggle)

---

## Accessibility Considerations

### Add ARIA Labels

```typescript
<tr 
  role="row"
  aria-label={`${item.name} primary information`}
>
  {/* Row 1 cells */}
</tr>

<tr 
  role="row"
  aria-label={`${item.name} additional details`}
>
  {/* Row 2 cells */}
</tr>
```

### Group Related Rows

```typescript
<tbody role="rowgroup" aria-label={`Record group ${idx + 1}`}>
  <React.Fragment key={item.id}>
    <tr>{/* Row 1 */}</tr>
    <tr>{/* Row 2 */}</tr>
  </React.Fragment>
</tbody>
```

---

## Testing Checklist

- [ ] Visual gap between Row 1 and Row 2 is minimal (no extra space)
- [ ] Both rows highlight together on hover
- [ ] Border appears only after Row 2
- [ ] RowSpan cells are vertically centered
- [ ] Text doesn't overflow cell boundaries
- [ ] Alternating row colors work correctly
- [ ] Click handlers work on both rows
- [ ] Mobile/responsive behavior is acceptable

---

*Implementation Guide v1.0*  
*November 27, 2025*

