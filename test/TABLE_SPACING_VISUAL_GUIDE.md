# Table Spacing Visual Guide - Exact Measurements

## ContractsTable: Two-Row Stacked Pattern

### Pixel-Perfect Spacing Breakdown

```
                    ┌──────────────────────────────────────┐
                    │ 8px                                  │
     ╔══════════════╪══════════════════════════════════════╪══════════════╗
     ║ 8px          │          Row 1 Content               │          8px ║
     ║              │ (Contractors, Region, Effectivity)   │              ║
     ║              │      lineHeight: 2.0                 │              ║
     ║              │                                  8px │              ║
     ╟──────────────┴──────────────────────────────────────┴──────────────╢
     ║                     ← NO BORDER, NO GAP →                          ║
     ╟──────────────┬──────────────────────────────────────┬──────────────╢
     ║              │ 0px  ← ZERO top padding!             │          8px ║
     ║ 8px          │                                      │              ║
     ║              │          Row 2 Content               │              ║
     ║              │ (Description, Office, Expiry)        │              ║
     ║              │      lineHeight: 2.0                 │              ║
     ║              │      height: 4em (64px @ 16px base)  │              ║
     ║              │                                  8px │              ║
     ╚══════════════╪══════════════════════════════════════╪══════════════╝
                    └──────────────────────────────────────┘
                    │ 1px border                           │
                    └──────────────────────────────────────┘
```

### Measurement Table

| Element | Top | Right | Bottom | Left | Notes |
|---------|-----|-------|--------|------|-------|
| **Header Row 1** | 8px | 8px | 8px | 8px | Normal padding |
| **Header Row 2** | 4px | 8px | 8px | 8px | Reduced top padding |
| **Body Row 1** | 8px | 8px | 8px | 8px | Full padding |
| **Body Row 2** | **0px** | 8px | 8px | 8px | **Zero top padding** |

### Border Distribution

```
HEADER
├─ Row 1: borderBottom: '1px solid' (for non-rowSpan headers)
└─ Row 2: borderBottom: '2px solid' (thicker final border)

BODY (per contract record)
├─ Row 1: borderBottom: 'none' ← Key to tight stacking!
└─ Row 2: borderBottom: '1px solid' (separator between records)
```

---

## RowSpan Cells - Special Vertical Alignment

These cells span both Row 1 and Row 2:

```
     ╔════════════════════╗
     ║                    ║
     ║   8px padding      ║
     ║                    ║
     ║      ┌──────┐      ║  ← verticalAlign: 'middle'
     ║      │ Content │    ║     (centers across both rows)
     ║      └──────┘      ║
     ║                    ║
     ║   8px padding      ║
     ║                    ║
     ╚════════════════════╝
        1px border
```

**RowSpan cells:**
- Contract ID
- Action button (🔍)
- Status badge
- Contract Price

**Padding:** `8px` all sides  
**Vertical Align:** `middle`  
**Border:** `1px solid` only at bottom (after Row 2)

---

## Text Content Spacing

### Line Height Calculation

```typescript
fontSize: typography.fontSize.sm    // 14px
lineHeight: '2.0'                  // 2.0 × 14px = 28px per line

// For 2-line clamp:
WebkitLineClamp: 2
Total height: 28px × 2 = 56px
```

### Row 2 Fixed Height

```typescript
height: '4em'  // 4 × 16px = 64px
```

This ensures consistent row heights even when content is shorter than 2 lines.

---

## Complete Contract Row Dimensions

### Assuming 16px base font size:

```
Total Height Per Contract Record:
┌─────────────────────────────────────────────┐
│ Row 1                                       │
│   Top padding:    8px                       │
│   Content:        ~28px (2 lines @ 28px)    │
│   Bottom padding: 8px                       │
│   Subtotal:       ~44px                     │
├─────────────────────────────────────────────┤ No gap
│ Row 2                                       │
│   Top padding:    0px  ← Tight stack!      │
│   Content/Height: 64px (4em fixed)          │
│   Bottom padding: 8px                       │
│   Subtotal:       72px                      │
├─────────────────────────────────────────────┤
│ Border:           1px                       │
└─────────────────────────────────────────────┘

TOTAL: ~117px per contract record
```

---

## Comparison with Standard DataTable

### DataTable (Single Row)

```
     ╔══════════════════════════════════════╗
     ║ 12px                             12px ║
     ║                                      ║
     ║ 12px     Content (single row)   12px ║
     ║                                      ║
     ║ 12px                             12px ║
     ╚══════════════════════════════════════╝
                   1px border

Height: 12px + content + 12px + 1px
       = ~25px + content height
```

**Key Difference:**  
- DataTable: Uniform 12px padding (spacing[3])
- ContractsTable: Tighter 8px padding (spacing[2]) + zero-top on Row 2

---

## Hover State Coordination

### Visual Effect When Hovering

```
NORMAL STATE:
┌────────────────────┐
│ Row 1 (bg: rowBg) │
├────────────────────┤
│ Row 2 (bg: rowBg) │
└────────────────────┘

HOVER STATE:
┌────────────────────┐
│ Row 1 (bg: hover) │ ← Both rows change
├────────────────────┤    simultaneously
│ Row 2 (bg: hover) │
└────────────────────┘
```

**Implementation:** Each row's hover handler updates its sibling row's background color using DOM traversal (`previousElementSibling` / `nextElementSibling`).

---

## Responsive Considerations

### Min-width Protection

```typescript
table: {
  minWidth: '900px'  // Prevents excessive squeezing
}

container: {
  overflowX: 'auto'  // Enables horizontal scroll
}
```

### Column Max-Widths

```typescript
// Row 1, Cell 3 (Contractors)
maxWidth: '400px'
WebkitLineClamp: 2
lineHeight: '2.0'

// Row 2, Cell 1 (Description)  
maxWidth: '400px'
WebkitLineClamp: 2
lineHeight: '2.0'
height: '4em'
```

---

## CSS Properties Summary

### Critical Properties for Stacked Rows

```css
/* Row 1 */
border-bottom: none;              /* No separator */
vertical-align: top;              /* Align content to top */
padding: 8px;                     /* Full padding */

/* Row 2 */
border-bottom: 1px solid;         /* Separator after group */
vertical-align: top;              /* Align content to top */
padding: 0 8px 8px 8px;          /* ZERO top padding */
height: 4em;                      /* Fixed height */

/* RowSpan cells */
row-span: 2;                      /* Span both rows */
vertical-align: middle;           /* Center in span */
padding: 8px;                     /* Full padding */
border-bottom: 1px solid;         /* Only at final bottom */
```

---

## Code References

### ContractsTable.tsx

**Row 1 Padding:**
```typescript
// Lines 269-282
padding: `${spacing[2]} ${spacing[2]}`
```

**Row 2 Padding (ZERO TOP!):**
```typescript
// Lines 356, 373, 380
padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}`
```

**Row 2 Fixed Height:**
```typescript
// Lines 360, 376, 384
height: '4em'
```

**Line Height:**
```typescript
// Lines 279, 366
lineHeight: '2.0'
```

---

*Visual Guide Created: November 27, 2025*  
*For: DPWH Contracts Dashboard*

