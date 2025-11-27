# Table Line Spacing Analysis - Documentation Index

Complete analysis of line spacing and formatting for stacked nested rows in the DPWH Contracts Dashboard.

---

## 📚 Documentation Files

### 1. [TABLE_LINE_SPACING_ANALYSIS.md](./TABLE_LINE_SPACING_ANALYSIS.md)
**Comprehensive Technical Analysis**

- Detailed breakdown of ContractsTable two-row stacked design
- Line spacing patterns and measurements
- Comparison with standard DataTable
- Design system reference
- Visual diagrams
- Best practices and key takeaways

**Read this for:** Understanding the architecture and design decisions

---

### 2. [TABLE_SPACING_VISUAL_GUIDE.md](./TABLE_SPACING_VISUAL_GUIDE.md)
**Pixel-Perfect Visual Reference**

- Exact spacing measurements in pixels
- Visual ASCII diagrams
- Border distribution patterns
- RowSpan cell dimensions
- Complete row height calculations
- CSS properties summary

**Read this for:** Exact measurements and visual understanding

---

### 3. [STACKED_ROWS_IMPLEMENTATION_GUIDE.md](./STACKED_ROWS_IMPLEMENTATION_GUIDE.md)
**Practical Implementation Guide**

- Complete code examples
- Cell type implementations
- Hover effect handlers
- Common pitfalls and solutions
- Accessibility considerations
- Testing checklist

**Read this for:** Implementing or modifying stacked tables

---

### 4. [CONTRACTS_FIELD_LAYOUT_ANALYSIS.md](./CONTRACTS_FIELD_LAYOUT_ANALYSIS.md)
**Field-by-Field Breakdown**

- Detailed analysis of all 11 contract fields
- Column-by-column layout explanation
- Field styling specifications
- Typography hierarchy
- Color usage and alignment
- Data formatting details

**Read this for:** Understanding what each field displays and how it's styled

---

### 5. [CONTRACTS_FIELD_VISUAL_MAP.md](./CONTRACTS_FIELD_VISUAL_MAP.md)
**Visual Field Mapping**

- ASCII visual diagrams of field positions
- Field dimension specifications
- Padding distribution maps
- Hover state visualizations
- Responsive behavior diagrams
- Status badge details

**Read this for:** Visual understanding of field layout and positioning

---

### 6. [CONTRACTS_ANNOTATED_EXAMPLE.md](./CONTRACTS_ANNOTATED_EXAMPLE.md)
**Real-World Examples with Annotations**

- Complete annotated example records
- Detailed breakdown of single record anatomy
- Hover state demonstrations
- Text overflow examples
- Currency and date formatting
- Click behavior zones
- Information hierarchy analysis

**Read this for:** Seeing how everything works together with real data

---

## 🎯 Quick Reference

### The Golden Rules

1. **Zero top padding on Row 2 cells** - This creates tight vertical stacking
2. **No border between Row 1 and Row 2** - Maintains visual unity
3. **Border only after Row 2** - Separates record groups
4. **Synchronized hover states** - Both rows highlight together
5. **RowSpan cells use `verticalAlign: 'middle'`** - Centers content across both rows

### Critical Code Snippets

#### Row 1 Cell Padding
```typescript
padding: spacing[2]  // 8px all sides
```

#### Row 2 Cell Padding (THE KEY!)
```typescript
padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}`
//        ↑ Zero top padding creates tight stacking!
```

#### Border Pattern
```typescript
// Row 1
borderBottom: 'none'

// Row 2  
borderBottom: `1px solid ${borderColor}`
```

---

## 📊 At a Glance

### ContractsTable Pattern

```
╔═══════════════════════════════════════╗
║ Row 1: padding 8px all sides          ║
╟───────────────────────────────────────╢ ← No border, no gap
║ Row 2: padding 0 8px 8px 8px          ║ ← Zero top!
╚═══════════════════════════════════════╝ ← 1px border
```

### Total Height Per Record
```
Row 1:    ~44px (8px + content + 8px)
Row 2:    ~72px (0px + 64px + 8px)
Border:   1px
────────
Total:    ~117px
```

---

## 🔍 Key Files in Codebase

### Main Implementation
**File:** `frontend/src/components/features/contracts-explorer/ContractsTable.tsx`

**Critical Lines:**
- **206-389**: Two-row stacked body implementation
- **136-198**: Two-row header implementation
- **269-284**: Row 1 cell padding
- **355-387**: Row 2 cell padding (note the 0 top padding!)

### Design System
**File:** `frontend/src/design-system/spacing.ts`

**Values Used:**
- `spacing[1] = '0.25rem'` (4px)
- `spacing[2] = '0.5rem'` (8px) ← Primary spacing for ContractsTable
- `spacing[3] = '0.75rem'` (12px) ← Used by DataTable

---

## 🎨 Design Decisions

### Why Zero Top Padding on Row 2?

**Problem:** Standard padding creates visual gap between rows
```
Row 1 [padding: 8px]
     ↓ 8px gap
Row 2 [padding: 8px]
```

**Solution:** Remove top padding on Row 2
```
Row 1 [padding: 8px]
Row 2 [padding: 0 8px 8px 8px]  ← Seamless connection!
```

### Why No Border Between Rows?

Makes the two rows appear as a single visual unit rather than separate records.

### Why RowSpan Cells?

Provides visual "anchors" that tie both rows together, making it clear they represent a single record.

---

## 📋 Comparison: ContractsTable vs DataTable

| Aspect | ContractsTable | DataTable |
|--------|----------------|-----------|
| **Rows per record** | 2 (stacked) | 1 |
| **Cell padding** | 8px | 12px |
| **Row 2 top padding** | **0px** | N/A |
| **Border between rows** | None | N/A |
| **Border after record** | 1px solid | 1px solid |
| **RowSpan cells** | Yes | No |
| **Vertical alignment** | Mixed | Single |
| **Line height** | 2.0 | Default |
| **Fixed row height** | Yes (Row 2: 4em) | No |

---

## 💡 Use Case Scenarios

### When to Use Stacked Rows (ContractsTable Pattern)

✅ Complex records with 10+ fields  
✅ Need to show summary + details  
✅ Desktop-first application  
✅ Data naturally splits into primary/secondary  
✅ Information density is important  

### When to Use Single Row (DataTable Pattern)

✅ Simple records with < 6 fields  
✅ Mobile-first or responsive design  
✅ Equal importance of all fields  
✅ Better accessibility required  
✅ Rapidly changing data  

---

## 🧪 Testing Scenarios

### Visual Testing

1. **No gap between Row 1 and Row 2**
   - Inspect spacing between rows
   - Should be seamless connection

2. **Synchronized hover**
   - Hover over Row 1 → Both rows highlight
   - Hover over Row 2 → Both rows highlight

3. **Border placement**
   - No border between Row 1 and Row 2
   - 1px border after Row 2

4. **RowSpan cells centered**
   - Content should be vertically centered
   - Should span exact height of both rows

### Functional Testing

1. **Click handlers work on both rows**
2. **Sort functionality updates both rows**
3. **Pagination maintains row pairing**
4. **Export includes all data from both rows**

---

## 🚀 Quick Start

### To understand the concept:
1. Read [TABLE_LINE_SPACING_ANALYSIS.md](./TABLE_LINE_SPACING_ANALYSIS.md)
2. Look at visual diagrams in [TABLE_SPACING_VISUAL_GUIDE.md](./TABLE_SPACING_VISUAL_GUIDE.md)

### To understand field layout:
1. Read [CONTRACTS_FIELD_LAYOUT_ANALYSIS.md](./CONTRACTS_FIELD_LAYOUT_ANALYSIS.md) for field details
2. View [CONTRACTS_FIELD_VISUAL_MAP.md](./CONTRACTS_FIELD_VISUAL_MAP.md) for visual diagrams
3. Check [CONTRACTS_ANNOTATED_EXAMPLE.md](./CONTRACTS_ANNOTATED_EXAMPLE.md) for real examples

### To implement a similar pattern:
1. Follow code examples in [STACKED_ROWS_IMPLEMENTATION_GUIDE.md](./STACKED_ROWS_IMPLEMENTATION_GUIDE.md)
2. Reference the actual implementation in `ContractsTable.tsx`

### To modify existing tables:
1. Check exact measurements in [TABLE_SPACING_VISUAL_GUIDE.md](./TABLE_SPACING_VISUAL_GUIDE.md)
2. Review field specifications in [CONTRACTS_FIELD_LAYOUT_ANALYSIS.md](./CONTRACTS_FIELD_LAYOUT_ANALYSIS.md)
3. Review common pitfalls in [STACKED_ROWS_IMPLEMENTATION_GUIDE.md](./STACKED_ROWS_IMPLEMENTATION_GUIDE.md)

---

## 📝 Summary of Key Findings

### The Secret to Tight Stacking

The seamless appearance of stacked rows is achieved through:

1. **Structural**: No border between Row 1 and Row 2
2. **Spatial**: Zero top padding on Row 2 cells
3. **Visual**: Same background color on both rows
4. **Interactive**: Synchronized hover effects
5. **Architectural**: RowSpan cells provide vertical anchors

### The Spacing Formula

```
Row 1 Bottom Padding: 8px
    ↓
[Zero gap - no border, no space]
    ↓
Row 2 Top Padding: 0px
    ↓
Row 2 Content: 64px (4em fixed height)
    ↓
Row 2 Bottom Padding: 8px
    ↓
Border: 1px solid
```

This creates approximately **117px total height** per contract record with **zero visible gap** between the two component rows.

---

## 🔗 Related Resources

### Design System Files
- `frontend/src/design-system/spacing.ts` - Spacing scale
- `frontend/src/design-system/typography.ts` - Font sizing
- `frontend/src/design-system/theme.ts` - Theme variables

### Component Files
- `frontend/src/components/features/contracts-explorer/ContractsTable.tsx` - Main implementation
- `frontend/src/components/features/shared/DataTable.tsx` - Comparison pattern
- `frontend/src/components/features/shared/EntitiesTable.tsx` - Uses DataTable

---

## ✅ Checklist for New Implementations

- [ ] Row 1 has `borderBottom: 'none'`
- [ ] Row 2 has `borderBottom: '1px solid'`
- [ ] Row 2 cells have zero top padding
- [ ] RowSpan cells use `verticalAlign: 'middle'`
- [ ] Regular cells use `verticalAlign: 'top'`
- [ ] Both rows wrapped in `React.Fragment`
- [ ] Both rows share same background color
- [ ] Hover handlers update sibling row
- [ ] Click handlers work on both rows
- [ ] Text overflow is handled with ellipsis
- [ ] Line height is consistent (2.0)
- [ ] Fixed height on Row 2 cells (4em)

---

## 📞 Questions or Issues?

If you encounter issues with stacked row implementation:

1. Check the **Common Pitfalls** section in `STACKED_ROWS_IMPLEMENTATION_GUIDE.md`
2. Verify all spacing values against `TABLE_SPACING_VISUAL_GUIDE.md`
3. Compare your implementation with `ContractsTable.tsx` lines 206-389
4. Ensure you're using `spacing[2]` (8px) not `spacing[3]` (12px)
5. Confirm Row 2 top padding is **exactly 0**

---

*Documentation Created: November 27, 2025*  
*DPWH Contracts Dashboard*  
*Version: 1.0*

