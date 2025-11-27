# Table Line Spacing Analysis - Stacked Nested Rows

## Overview
This document analyzes the line spacing and formatting implementation for the main tables in the DPWH Contracts Dashboard, with specific focus on the **stacked nested rows** design pattern used in `ContractsTable.tsx`.

---

## 1. ContractsTable.tsx - Two-Row Stacked Design

### Architecture
The `ContractsTable` uses a **two-row stacked layout** where each contract record is displayed across TWO consecutive `<tr>` elements wrapped in a `React.Fragment`.

### Line Spacing Breakdown

#### **Header Structure (Two-Row Header)**

```typescript
// Header Row 1
<tr style={{ borderBottom: `1px solid ${borderColor}` }}>
  // Columns with rowSpan={2} span both header rows
  // Columns without rowSpan only appear in Row 1
</tr>

// Header Row 2  
<tr style={{ borderBottom: `2px solid ${borderColor}` }}>
  // Only columns that weren't spanned from Row 1
</tr>
```

**Key Spacing Details:**
- **Row 1 Columns**: `padding: spacing[2]` (8px) with `borderBottom: 2px solid` for rowSpan columns
- **Row 2 Columns**: Split padding:
  - Top: `spacing[1]` (4px)
  - Sides & Bottom: `spacing[2]` (8px)
- **Between rows**: No extra spacing (rows are stacked directly)
- **Final border**: `2px solid` after Row 2

#### **Body Structure (Two-Row Per Contract)**

Each contract uses TWO stacked rows:

**Row 1 (Primary Data Row)**
```typescript
<tr style={{
  borderBottom: 'none',  // No border between Row 1 & 2
  backgroundColor: rowBg
}}>
  // Cells with rowSpan={2} for:
  // - Action button (🔍)
  // - Contract ID
  // - Status badge
  // - Contract Price
  
  // Single-row cells for:
  // - Contractors
  // - Region  
  // - Effectivity Date
</tr>
```

**Padding for Row 1 Cells:**
- **RowSpan cells**: `padding: spacing[2]` (8px all sides)
- **Single cells**: `padding: spacing[2]` (8px all sides)
- **Vertical alignment**: 
  - RowSpan cells: `verticalAlign: 'middle'`
  - Single cells: `verticalAlign: 'top'`

**Row 2 (Detail Data Row)**
```typescript
<tr style={{
  borderBottom: `1px solid ${borderColor}`,  // Border AFTER Row 2
  backgroundColor: rowBg
}}>
  // Cells for:
  // - Description
  // - Implementing Office
  // - Expiry Date
</tr>
```

**Padding for Row 2 Cells:**
- **Top**: `0` (no top padding - creates tight stacking)
- **Sides**: `spacing[2]` (8px)
- **Bottom**: `spacing[2]` (8px)
- **Height**: Fixed at `4em`
- **Vertical alignment**: `verticalAlign: 'top'`

### Critical Line Spacing Pattern

```
┌─────────────────────────────────────────┐
│ Row 1 Cell (padding: 8px all sides)    │
├─────────────────────────────────────────┤ ← NO BORDER HERE
│ Row 2 Cell (padding: 0 8px 8px 8px)    │ ← 0px top padding!
└─────────────────────────────────────────┘ ← 1px border here
```

**The key to tight vertical stacking:**
1. Row 1 has `borderBottom: 'none'`
2. Row 2 has `padding-top: 0`
3. Row 2 has `borderBottom: 1px solid`

This creates a seamless visual connection between the two rows while maintaining proper bottom spacing.

### Text Line Spacing

**Row 1 (Contractors field):**
```typescript
lineHeight: '2.0'
WebkitLineClamp: 2
```

**Row 2 (Description field):**
```typescript
lineHeight: '2.0'
WebkitLineClamp: 2
height: '4em'
```

The `lineHeight: 2.0` combined with `WebkitLineClamp: 2` and `height: 4em` creates consistent vertical rhythm for text content.

### Hover Effect Coordination

The two rows are synchronized for hover effects:

```typescript
// Row 1 onMouseEnter
const nextRow = e.currentTarget.nextElementSibling
e.currentTarget.style.backgroundColor = hoverBg
if (nextRow) nextRow.style.backgroundColor = hoverBg

// Row 2 onMouseEnter  
const prevRow = e.currentTarget.previousElementSibling
e.currentTarget.style.backgroundColor = hoverBg
if (prevRow) prevRow.style.backgroundColor = hoverBg
```

Both rows change background color simultaneously to maintain visual unity.

---

## 2. DataTable.tsx - Standard Single-Row Design

### Line Spacing Pattern

**Standard cell padding:**
```typescript
padding: spacing[3]  // 12px all sides
borderBottom: `1px solid ${vars.border.light}`
```

**Header cells:**
```typescript
padding: spacing[3]  // 12px all sides
borderBottom: `2px solid ${vars.border.medium}`
position: 'sticky'
top: 0
```

**Key differences from ContractsTable:**
- Single row per record (not stacked)
- Uniform padding (12px vs 8px)
- No rowSpan cells
- No vertical alignment coordination needed

---

## 3. EntitiesTable.tsx

Uses `DataTable.tsx` as its base, inheriting the same single-row spacing pattern.

---

## Design System Reference

### Spacing Scale
```typescript
spacing[0] = '0'
spacing[1] = '0.25rem'  // 4px
spacing[2] = '0.5rem'   // 8px
spacing[3] = '0.75rem'  // 12px
spacing[4] = '1rem'     // 16px
```

### Semantic Table Spacing
```typescript
table: {
  cellPadding: spacing[3],    // 12px (default)
  headerPadding: spacing[4],  // 16px
  rowGap: spacing[1],         // 4px
}
```

**Note:** ContractsTable uses **spacing[2] (8px)** instead of the semantic default of spacing[3] (12px) to achieve tighter row stacking.

---

## Key Takeaways

### For Stacked Nested Rows (ContractsTable pattern):

1. **Zero top padding on second row** enables tight vertical stacking
2. **No border between stacked rows** maintains visual unity
3. **Border only after final row** separates record groups
4. **Synchronized hover states** across both rows
5. **RowSpan cells** provide vertical anchors spanning both rows
6. **Consistent lineHeight (2.0)** creates predictable text spacing
7. **Fixed height (4em)** on Row 2 cells prevents layout shifts

### Best Practices:

✅ Use `verticalAlign: 'middle'` for rowSpan cells  
✅ Use `verticalAlign: 'top'` for single-row cells  
✅ Set `padding-top: 0` on the second row  
✅ Apply borders only after the final row  
✅ Coordinate hover effects across sibling rows  
✅ Use `React.Fragment` to group related rows  
✅ Apply same background color to both rows  

### Spacing Formula:

```
Row 1 Cell Height = (2 × padding[2]) + content
Row 2 Cell Height = padding[2] + content (no top padding)
Total Gap Between Records = 1px border
```

---

## Visual Diagram

```
╔════════════════════════════════════════════════════════════╗
║ HEADER ROW 1 (padding: 8px, some cells rowSpan=2)        ║
╠════════════════════════════════════════════════════════════╣
║ HEADER ROW 2 (padding: 4px 8px 8px 8px)                  ║
╠════════════════════════════════════════════════════════════╣ 2px border
║                                                            ║
║ CONTRACT 1 - ROW 1                                        ║
║   padding: 8px all sides                                  ║
║   [ID (rowSpan)] [Contractors] [Status (rowSpan)] ...     ║
╟────────────────────────────────────────────────────────────╢ NO BORDER
║ CONTRACT 1 - ROW 2                                        ║
║   padding: 0 8px 8px 8px  ← Note the 0 top padding       ║
║   [Description] [Implementing Office] [Expiry]            ║
╠════════════════════════════════════════════════════════════╣ 1px border
║                                                            ║
║ CONTRACT 2 - ROW 1                                        ║
║   padding: 8px all sides                                  ║
╟────────────────────────────────────────────────────────────╢ NO BORDER
║ CONTRACT 2 - ROW 2                                        ║
║   padding: 0 8px 8px 8px                                  ║
╠════════════════════════════════════════════════════════════╣ 1px border
║ ...                                                        ║
╚════════════════════════════════════════════════════════════╝
```

---

## Implementation Reference

### ContractsTable Location
`frontend/src/components/features/contracts-explorer/ContractsTable.tsx`

**Lines 206-389**: Two-row stacked implementation  
**Lines 136-198**: Two-row header implementation  
**Lines 269-284**: Row 1 cell padding  
**Lines 355-387**: Row 2 cell padding (note the 0 top padding)

### DataTable Location  
`frontend/src/components/features/shared/DataTable.tsx`

**Lines 107-116**: Standard cell padding implementation

---

*Analysis Date: November 27, 2025*  
*Codebase: DPWH Contracts Dashboard*

