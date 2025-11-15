# Design System

This directory contains the design system foundation for the PHILGEPS Awards Data Explorer, providing consistent styling, theming, and design tokens across the application.

## 📁 Directory Structure

### Core Design Files
- **`index.ts`** - Main export file for all design system modules
- **`theme.ts`** - Theme configuration with light/dark mode support
- **`colors.ts`** - Color palettes and color utilities
- **`typography.ts`** - Font scales, weights, and text styling
- **`spacing.ts`** - Spacing scale and layout utilities
- **`animations.ts`** - Animation definitions and timing functions

## 🎨 Design System Components

### Theme System (`theme.ts`)
Comprehensive theming system with light and dark mode support.

#### Features
- **Dynamic Theme Switching** - Seamless switching between light and dark modes
- **Color Palettes** - Consistent color schemes for both themes
- **Component Theming** - Theme-aware component styling
- **CSS Variables** - CSS custom properties for dynamic theming

#### Usage
```typescript
import { getThemeColors } from './design-system/theme'

const MyComponent = ({ isDark }: { isDark: boolean }) => {
  const theme = getThemeColors(isDark)
  
  return (
    <div style={{ 
      backgroundColor: theme.background.primary,
      color: theme.text.primary 
    }}>
      Themed content
    </div>
  )
}
```

### Color System (`colors.ts`)
Comprehensive color palette with semantic naming.

#### Color Categories
- **Primary Colors** - Brand colors and main UI elements
- **Background Colors** - Background variations for different UI levels
- **Text Colors** - Text colors with proper contrast ratios
- **Border Colors** - Border colors for different UI states
- **Status Colors** - Success, warning, error, and info colors

#### Usage
```typescript
import { colors } from './design-system/colors'

const styles = {
  primary: colors.blue[600],
  background: colors.gray[50],
  text: colors.gray[900]
}
```

### Typography (`typography.ts`)
Typography scale and text styling utilities.

#### Features
- **Font Scales** - Consistent font size progression
- **Font Weights** - Font weight definitions
- **Line Heights** - Line height calculations
- **Text Styles** - Predefined text styles for common use cases

#### Usage
```typescript
import { typography } from './design-system/typography'

const styles = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  lineHeight: typography.lineHeight.relaxed
}
```

### Spacing System (`spacing.ts`)
Consistent spacing scale for layout and component spacing.

#### Features
- **Spacing Scale** - Consistent spacing values (4px base unit)
- **Layout Utilities** - Common spacing patterns
- **Responsive Spacing** - Responsive spacing utilities

#### Usage
```typescript
import { spacing } from './design-system/spacing'

const styles = {
  padding: spacing[4], // 16px
  margin: spacing[2],  // 8px
  gap: spacing[3]      // 12px
}
```

### Animations (`animations.ts`)
Animation definitions and timing functions for smooth interactions.

#### Features
- **Timing Functions** - Easing functions for natural motion
- **Duration Scales** - Consistent animation durations
- **Animation Presets** - Common animation patterns
- **Transition Utilities** - CSS transition helpers

#### Usage
```typescript
import { animations } from './design-system/animations'

const styles = {
  transition: `all ${animations.duration.fast} ${animations.easing.easeInOut}`
}
```


#### Usage
```typescript
import { accessibility } from './design-system/accessibility'

const ariaProps = accessibility.getAriaProps('button', { 
  expanded: true, 
  controls: 'menu' 
})
```

## 🎯 Design Principles

### Consistency
All design tokens follow consistent naming conventions and scales.


### Scalability
Design system is built to scale with the application's growth.

### Maintainability
Clear organization and documentation make the design system easy to maintain.

### Performance
Optimized for performance with minimal runtime overhead.

## 🔧 Usage Guidelines

### Importing Design Tokens
```typescript
import { getThemeColors, spacing, typography } from './design-system'
```

### Theme-Aware Components
Always use theme-aware styling for components that need to support both light and dark modes.

### Consistent Spacing
Use the spacing scale for all layout and component spacing.

### Typography Hierarchy
Follow the typography scale for consistent text styling.

### Color Semantics
Use semantic color names rather than specific color values.

## 📝 Documentation

Each design system module includes:
- Comprehensive JSDoc comments
- Usage examples
- Performance notes
- Migration guides for updates
