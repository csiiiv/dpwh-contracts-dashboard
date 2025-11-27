# Contracts Row Layout - Field-by-Field Analysis

Complete breakdown of how each contract field is positioned and styled in the two-row stacked layout.

---

## Table Structure Overview

The ContractsTable displays **11 data fields** across **7 column positions** using a two-row layout:
- **4 fields** use `rowSpan={2}` (span both rows)
- **3 fields** appear only in Row 1
- **3 fields** appear only in Row 2
- **1 field** is a special action button

---

## Field Distribution Map

```
COLUMN:    1        2             3              4         5          6               7
         ┌────┬─────────────┬──────────────┬─────────┬─────────┬────────────────┬─────────────┐
HEADER 1: │    │ Contract ID │ Contractors  │ Region  │ Status  │ Effectivity    │ Contract    │
         │ 🔍 │             │              │         │         │ Date           │ Price       │
HEADER 2: │    │             │ Description  │         │         │ Expiry Date    │             │
         ├────┼─────────────┼──────────────┼─────────┼─────────┼────────────────┼─────────────┤
         │    │             │              │         │         │                │             │
ROW 1:   │ 🔍 │ CONTRACT-ID │ Contractor A │ Region  │ ◉ Badge │ 2024-01-15     │ ₱1,000,000  │
         │    │             │ Contractor B │ NCR     │         │                │             │
         ├────┤             ├──────────────┴─────────┴─────────┴────────────────┤             │
ROW 2:   │    │             │ Long contract description text   │ DPWH Office    │ 2025-01-15  │             │
         │    │             │ that can span multiple lines...  │                │             │             │
         └────┴─────────────┴──────────────────────────────────┴────────────────┴─────────────┘
```

---

## Field Details by Column

### COLUMN 1: Action Button (rowSpan)

**Field Type:** Interactive button  
**Data Source:** Component-generated (not from contract data)  
**Position:** Spans both Row 1 and Row 2

#### Styling Details
```typescript
// Lines 227-255
rowSpan: 2
width: '40px'
padding: spacing[2]              // 8px all sides
textAlign: 'center'
verticalAlign: 'middle'          // Centered across both rows
borderBottom: `1px solid ${borderColor}`

Button:
  fontSize: '16px'
  opacity: 0.7 (1.0 on hover)
  icon: '🔍'
  title: "View details"
```

#### Behavior
- **Click**: Stops propagation and triggers `onViewContractDetails(contract)`
- **Hover**: Opacity changes from 0.7 to 1.0
- **Purpose**: Opens detailed contract modal

**Visual Characteristics:**
- Small fixed width (40px)
- Always centered
- Icon-only interface
- Subtle hover effect

---

### COLUMN 2: Contract ID (rowSpan)

**Field Type:** Text - Primary identifier  
**Data Source:** `contract.contract_id`  
**Position:** Spans both Row 1 and Row 2

#### Styling Details
```typescript
// Lines 256-268
rowSpan: 2
padding: spacing[2]              // 8px all sides
fontSize: typography.fontSize.sm // 14px
color: textPrimary               // High contrast
fontWeight: 600                  // Bold/Semibold
verticalAlign: 'middle'          // Centered
borderBottom: `1px solid ${borderColor}`
```

#### Data Format
- Raw string display (no formatting)
- Fallback: `'N/A'` if null/undefined

**Visual Characteristics:**
- Bold and prominent
- High contrast color
- Vertically centered
- Key identifier for the record

**Example Values:**
- `"2024-0123-ABC"`
- `"DPWH-NCR-001"`
- `"CONTRACT-2023-456"`

---

### COLUMN 3A: Contractors (Row 1 only)

**Field Type:** Text - Multiple values concatenated  
**Data Source:** `contract.contractor_name_1` through `contractor_name_4`  
**Position:** Row 1 only

#### Styling Details
```typescript
// Lines 269-284
padding: spacing[2]              // 8px all sides
fontSize: typography.fontSize.sm // 14px
color: textPrimary               // High contrast
maxWidth: '400px'                // Constrain width
lineHeight: '2.0'                // Double line height
verticalAlign: 'top'             // Align to top
overflow: 'hidden'
textOverflow: 'ellipsis'
display: '-webkit-box'
WebkitLineClamp: 2               // Max 2 lines
WebkitBoxOrient: 'vertical'
wordBreak: 'break-word'
```

#### Data Format
```typescript
getContractorNames(contract).join(' | ')
// Returns: "Contractor A | Contractor B | Contractor C"
```

**Processing:**
1. Extract up to 4 contractor names from contract object
2. Filter out null/undefined values
3. Join with ` | ` separator
4. Fallback: `'N/A'` if no contractors

**Visual Characteristics:**
- Can display multiple contractors
- Separated by pipe `|` character
- Truncates with ellipsis after 2 lines
- Word-wrapping enabled
- Takes up significant horizontal space (max 400px)

**Example Values:**
- `"ABC Construction Co."`
- `"XYZ Builders | ABC Engineering"`
- `"Main Contractor | Sub 1 | Sub 2 | Sub 3"`

---

### COLUMN 3B: Description (Row 2 only)

**Field Type:** Text - Long form description  
**Data Source:** `contract.description`  
**Position:** Row 2 only (aligned under Contractors)

#### Styling Details
```typescript
// Lines 355-370
padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}` // 0 8px 8px 8px
fontSize: typography.fontSize.xs // 12px (smaller!)
color: textSecondary             // Lower contrast
maxWidth: '400px'
height: '4em'                    // Fixed 64px height
lineHeight: '2.0'
verticalAlign: 'top'
overflow: 'hidden'
textOverflow: 'ellipsis'
display: '-webkit-box'
WebkitLineClamp: 2               // Max 2 lines
WebkitBoxOrient: 'vertical'
wordBreak: 'break-word'
```

#### Key Differences from Row 1 Contractors
- **Zero top padding** (0px vs 8px)
- **Smaller font** (12px vs 14px)
- **Secondary color** (lower contrast)
- **Fixed height** (4em = 64px)

**Visual Characteristics:**
- Secondary information style
- Truncates long descriptions
- Fixed height prevents layout shifts
- Tightly stacked under contractors field
- Same width constraint (400px)

**Example Values:**
- `"Construction of road infrastructure"`
- `"Repair and rehabilitation of bridge structure along highway"`
- `"Supply and installation of drainage system for flood control project"`

---

### COLUMN 4A: Region (Row 1 only)

**Field Type:** Text - Geographic identifier  
**Data Source:** `contract.region`  
**Position:** Row 1 only

#### Styling Details
```typescript
// Lines 285-291
padding: spacing[2]              // 8px all sides
fontSize: typography.fontSize.sm // 14px
color: textPrimary               // High contrast
```

#### Data Format
- Raw string display
- Fallback: `'N/A'`

**Visual Characteristics:**
- Simple text display
- No special formatting
- Standard padding
- Moderate width

**Example Values:**
- `"NCR"` (National Capital Region)
- `"Region III"`
- `"Region VII"`
- `"CAR"` (Cordillera Administrative Region)
- `"BARMM"`

---

### COLUMN 4B: Implementing Office (Row 2 only)

**Field Type:** Text - Office name  
**Data Source:** `contract.implementing_office`  
**Position:** Row 2 only (aligned under Region)

#### Styling Details
```typescript
// Lines 372-379
padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}` // 0 8px 8px 8px
fontSize: typography.fontSize.xs // 12px (smaller!)
color: textSecondary             // Lower contrast
height: '4em'                    // Fixed 64px height
```

#### Key Differences from Row 1 Region
- **Zero top padding**
- **Smaller font**
- **Secondary color**
- **Fixed height**

**Visual Characteristics:**
- Secondary information
- Compact display
- Aligned under region
- Fixed height for consistency

**Example Values:**
- `"DPWH - NCR"`
- `"Regional Office III"`
- `"Central Office"`
- `"District Engineering Office"`

---

### COLUMN 5: Status (rowSpan)

**Field Type:** Badge/Pill component  
**Data Source:** `contract.status`  
**Position:** Spans both Row 1 and Row 2

#### Styling Details
```typescript
// Lines 292-311
Container (td):
  rowSpan: 2
  padding: spacing[2]              // 8px all sides
  fontSize: typography.fontSize.xs // 12px
  verticalAlign: 'middle'          // Centered
  borderBottom: `1px solid ${borderColor}`

Badge (span):
  padding: '4px 8px'
  borderRadius: '12px'
  backgroundColor: `${getStatusColor(status)}20`  // 20% opacity
  color: getStatusColor(status)
  border: `1px solid ${getStatusColor(status)}40` // 40% opacity
  fontWeight: 600
```

#### Status Color Mapping
```typescript
// Lines 74-81
'completed' → #10b981 (Green)
'ongoing' / 'on-going' → #3b82f6 (Blue)
'terminated' / 'cancelled' → #ef4444 (Red)
default → #6b7280 (Gray)
```

**Visual Characteristics:**
- Pill-shaped badge with rounded corners
- Color-coded by status type
- Semi-transparent background (20% opacity)
- Colored border (40% opacity)
- Bold text
- Vertically centered across both rows

**Status Badge Visual Examples:**
```
┌─────────────┐
│ ● Completed │  Green tint
└─────────────┘

┌─────────────┐
│ ● Ongoing   │  Blue tint
└─────────────┘

┌─────────────┐
│ ● Terminated│  Red tint
└─────────────┘
```

**Example Values:**
- `"Completed"`
- `"Ongoing"`
- `"On-going"`
- `"Terminated"`
- `"Cancelled"`

---

### COLUMN 6A: Effectivity Date (Row 1 only)

**Field Type:** Date - Contract start  
**Data Source:** `contract.effectivity_date`  
**Position:** Row 1 only

#### Styling Details
```typescript
// Lines 312-318
padding: spacing[2]              // 8px all sides
fontSize: typography.fontSize.sm // 14px
color: textPrimary               // High contrast
```

#### Date Formatting
```typescript
// Lines 56-67
new Date(dateString).toLocaleDateString('en-PH', {
  year: 'numeric',    // 2024
  month: 'short',     // Jan, Feb, Mar...
  day: 'numeric'      // 1-31
})
// Output: "Jan 15, 2024"
```

**Fallback:** `'N/A'` for null/invalid dates

**Visual Characteristics:**
- Compact date format
- Localized to Philippine format
- Standard text styling
- No special icons or decorations

**Example Values:**
- `"Jan 15, 2024"`
- `"Dec 1, 2023"`
- `"Mar 20, 2025"`
- `"N/A"`

---

### COLUMN 6B: Expiry Date (Row 2 only)

**Field Type:** Date - Contract end  
**Data Source:** `contract.expiry_date`  
**Position:** Row 2 only (aligned under Effectivity Date)

#### Styling Details
```typescript
// Lines 380-387
padding: `0 ${spacing[2]} ${spacing[2]} ${spacing[2]}` // 0 8px 8px 8px
fontSize: typography.fontSize.xs // 12px (smaller!)
color: textSecondary             // Lower contrast
height: '4em'                    // Fixed 64px height
```

#### Date Formatting
Same as Effectivity Date:
```typescript
// "Jan 15, 2024" or "N/A"
```

#### Key Differences from Row 1 Effectivity Date
- **Zero top padding**
- **Smaller font** (12px vs 14px)
- **Secondary color**
- **Fixed height**

**Visual Characteristics:**
- Aligned directly under effectivity date
- De-emphasized with secondary color
- Same date format
- Fixed height for alignment

**Visual Relationship:**
```
Effectivity: Jan 15, 2024  (darker, 14px)
                ↓
Expiry:      Jan 14, 2025  (lighter, 12px)
```

---

### COLUMN 7: Contract Price (rowSpan)

**Field Type:** Currency - PHP amount  
**Data Source:** `contract.cost_php`  
**Position:** Spans both Row 1 and Row 2

#### Styling Details
```typescript
// Lines 319-333
rowSpan: 2
padding: spacing[2]              // 8px all sides
fontSize: typography.fontSize.sm // 14px
color: textPrimary               // High contrast
textAlign: 'right'               // Right-aligned
fontFamily: 'monospace'          // Fixed-width font
fontWeight: 600                  // Bold
verticalAlign: 'middle'          // Centered
borderBottom: `1px solid ${borderColor}`
```

#### Currency Formatting
```typescript
// Lines 46-54
new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).format(amount)
// Output: "₱1,234,567"
```

**Fallback:** `'N/A'` for null amounts

**Visual Characteristics:**
- Right-aligned for numerical comparison
- Monospace font for digit alignment
- Bold weight for prominence
- No decimal places (whole numbers only)
- PHP peso symbol (₱)
- Thousand separators (commas)
- Vertically centered

**Example Values:**
- `"₱1,234,567"`
- `"₱50,000,000"`
- `"₱125,450,000"`
- `"N/A"`

**Why Monospace?**
Aligning digits in a column:
```
   ₱1,234,567  ← Digits align vertically
  ₱50,000,000  ← Making comparisons easier
 ₱125,450,000  ← at a glance
```

---

## Field Categorization

### Primary Information (Row 1)
High-contrast, larger font, prominent display:
1. **Contract ID** (rowSpan) - Bold, 14px, centered
2. **Contractors** - 14px, can span 2 lines
3. **Region** - 14px, simple text
4. **Status** (rowSpan) - Colored badge, centered
5. **Effectivity Date** - 14px, formatted
6. **Contract Price** (rowSpan) - Bold, monospace, right-aligned

### Secondary Information (Row 2)
Lower-contrast, smaller font, detail display:
1. **Description** - 12px, secondary color, 2-line max
2. **Implementing Office** - 12px, secondary color
3. **Expiry Date** - 12px, secondary color

### Interactive Elements
1. **Action Button** (🔍) - Opens detail modal

---

## Typography Hierarchy

### Font Sizes
```
Action Button:  16px (icon)
Row 1 Fields:   14px (typography.fontSize.sm)
Row 2 Fields:   12px (typography.fontSize.xs)
Status Badge:   12px (typography.fontSize.xs)
```

### Font Weights
```
Normal:     400 (Row 1 Contractors, Region, Dates)
Semibold:   600 (Contract ID, Contract Price, Status)
```

### Font Families
```
Sans-serif: Default (most fields)
Monospace:  Contract Price (for digit alignment)
```

---

## Color Usage

### Primary Text (High Contrast)
Used for important Row 1 data:
- Contract ID
- Contractors
- Region
- Effectivity Date
- Contract Price

**Colors:**
- Light theme: `#111827` (near black)
- Dark theme: `#f3f4f6` (near white)

### Secondary Text (Lower Contrast)
Used for Row 2 detail data:
- Description
- Implementing Office
- Expiry Date

**Colors:**
- Light theme: `#6b7280` (gray)
- Dark theme: `#9ca3af` (light gray)

### Status Colors (Dynamic)
- **Completed**: `#10b981` (green)
- **Ongoing**: `#3b82f6` (blue)
- **Terminated**: `#ef4444` (red)
- **Default**: `#6b7280` (gray)

---

## Width and Overflow Handling

### Fixed Width Columns
```
Column 1 (Action): 40px (fixed)
Column 7 (Price): ~150px (content-based, right-aligned)
```

### Constrained Width Columns
```
Column 3A (Contractors): maxWidth 400px
Column 3B (Description): maxWidth 400px
```

### Flexible Width Columns
All other columns expand/contract based on content and available space.

### Overflow Strategy

#### Two-Line Truncation (Contractors, Description)
```typescript
overflow: 'hidden'
textOverflow: 'ellipsis'
display: '-webkit-box'
WebkitLineClamp: 2
WebkitBoxOrient: 'vertical'
lineHeight: '2.0'
wordBreak: 'break-word'
```

**Result:**
```
Long contractor name that goes on
and on will be truncated after t...
```

#### Single-Line Display (Other fields)
No special overflow handling - rely on cell width and natural wrapping.

---

## Alignment Strategy

### Horizontal Alignment
```
Left-aligned:   Most text fields (default)
Right-aligned:  Contract Price (for numerical comparison)
Center-aligned: Action Button
```

### Vertical Alignment
```
Middle:  RowSpan cells (Action, Contract ID, Status, Price)
Top:     All Row 1 and Row 2 regular cells
```

**Why "top" for regular cells?**
When text wraps to 2 lines, top alignment looks better than middle alignment:

```
GOOD (top):           BAD (middle):
┌──────────────┐     ┌──────────────┐
│First line    │     │              │
│Second line   │     │First line    │
└──────────────┘     │Second line   │
                     └──────────────┘
```

---

## Spacing Between Rows

### The Critical Zero-Top Pattern

**Row 1 Fields (bottom spacing):**
```
Contractors:       padding-bottom: 8px
Region:           padding-bottom: 8px (implicit)
Effectivity Date: padding-bottom: 8px (implicit)
```

**Row 2 Fields (top spacing):**
```
Description:        padding-top: 0px  ← KEY!
Implementing Office: padding-top: 0px  ← KEY!
Expiry Date:        padding-top: 0px  ← KEY!
```

**Result:**
```
┌────────────────────┐
│ Contractors (8px)  │
│ (content)          │
│ (8px bottom pad)   │
├────────────────────┤ ← NO GAP
│ (0px top pad) ←──┐ │
│ Description       │ │ Tight stacking!
│ (content)         │ │
│ (8px bottom pad)  │ │
└────────────────────┘
```

---

## Responsive Behavior

### Minimum Table Width
```typescript
minWidth: '900px'
```

**Prevents excessive squeezing on mobile.**

### Scroll Container
```typescript
overflowX: 'auto'
WebkitOverflowScrolling: 'touch'
```

**Enables horizontal scrolling when viewport < 900px.**

### Column Priority (Most to Least Important)
1. Contract ID (always visible)
2. Contract Price (always visible)
3. Status (always visible)
4. Contractors / Description
5. Region / Office
6. Dates
7. Action Button

---

## Field Data Types Reference

Based on `Contract` interface:

| Column | Field Name | TypeScript Type | Nullable |
|--------|-----------|----------------|----------|
| 1 | Action Button | Component | N/A |
| 2 | `contract_id` | `string` | No |
| 3A | `contractor_name_1-4` | `string` | Yes |
| 3B | `description` | `string` | No |
| 4A | `region` | `string` | No |
| 4B | `implementing_office` | `string` | No |
| 5 | `status` | `string` | No |
| 6A | `effectivity_date` | `string \| null` | Yes |
| 6B | `expiry_date` | `string \| null` | Yes |
| 7 | `cost_php` | `number \| null` | Yes |

---

## Visual Example with Real Data

```
┏━━━━┯━━━━━━━━━━━━━━━┯━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┯━━━━━━━━━━━━┯━━━━━━━━━━━━┯━━━━━━━━━━━━━━━┯━━━━━━━━━━━━━━┓
┃ 🔍 │ DPWH-2024-001 │ ABC Construction Inc.         │ Region III │ ● Ongoing  │ Jan 15, 2024  │ ₱5,250,000   ┃
┃    │               │                               │            │            │               │              ┃
┠────┤               ├───────────────────────────────┴────────────┴────────────┴───────────────┤              ┃
┃    │               │ Construction and improvement  │ DPWH - Regional Office  │ Jan 14, 2025  │              ┃
┃    │               │ of national road              │ III                     │               │              ┃
┗━━━━┷━━━━━━━━━━━━━━━┷━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┷━━━━━━━━━━━━━━━━━━━━━━━━━┷━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## Summary Table: All Fields

| # | Field Name | Row | Type | Font Size | Color | Alignment | RowSpan | Special |
|---|-----------|-----|------|-----------|-------|-----------|---------|---------|
| 1 | Action Button | Both | Button | 16px icon | - | Center | ✓ | Interactive |
| 2 | Contract ID | Both | Text | 14px | Primary | Left | ✓ | Bold |
| 3 | Contractors | 1 | Text | 14px | Primary | Left | ✗ | 2-line max |
| 4 | Description | 2 | Text | 12px | Secondary | Left | ✗ | 2-line max, 0-top pad |
| 5 | Region | 1 | Text | 14px | Primary | Left | ✗ | - |
| 6 | Implementing Office | 2 | Text | 12px | Secondary | Left | ✗ | 0-top pad |
| 7 | Status | Both | Badge | 12px | Dynamic | Left | ✓ | Color-coded |
| 8 | Effectivity Date | 1 | Date | 14px | Primary | Left | ✗ | Formatted |
| 9 | Expiry Date | 2 | Date | 12px | Secondary | Left | ✗ | 0-top pad |
| 10 | Contract Price | Both | Currency | 14px | Primary | Right | ✓ | Bold, Monospace |

**Total Visible Fields:** 10 (11 including action button)  
**RowSpan Fields:** 4  
**Row 1 Only:** 3  
**Row 2 Only:** 3  

---

*Field Layout Analysis Created: November 27, 2025*  
*DPWH Contracts Dashboard - ContractsTable Component*

