# Styled Components

This directory contains styled-components and design system components used throughout the application.

## 📁 Components

This directory contains styled-components that provide consistent styling and theming across the dashboard application.

## 🎨 Design System Integration

### Theme Support
- **Light/Dark Mode**: Automatic theme switching support
- **Color Schemes**: Consistent color palettes for both themes
- **Typography**: Standardized font sizes, weights, and line heights
- **Spacing**: 4px base unit spacing system

### Component Categories

#### Layout Components
- Container and wrapper styled components
- Grid and flexbox layout utilities
- Responsive breakpoint components
- Section and panel layouts

#### Interactive Components  
- Button variants with consistent styling
- Form input styling and states
- Navigation component styles
- Interactive element hover states

#### Data Display Components
- Table styling with sorting indicators
- Card layouts for data presentation
- Badge and chip styling
- Status indicator components

#### Utility Components
- Loading spinner animations
- Error state styling
- Modal overlay and content styles
- Tooltip positioning and styling

## 🔧 Implementation Pattern

### Styled Components Structure
```typescript
// Example styled component pattern
export const StyledButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  ${({ theme, variant }) => css`
    background-color: ${theme.colors[variant]};
    color: ${theme.colors[`${variant}Text`]};
    padding: ${theme.spacing.md};
    border-radius: ${theme.borderRadius.md};
    
    &:hover {
      background-color: ${theme.colors[`${variant}Hover`]};
    }
  `}
`;
```

### Theme Integration
- Access to global theme variables
- Responsive design utilities
- Consistent spacing and color application
- Animation and transition definitions

## 🎯 Benefits

### Consistency
- Unified visual language across all components
- Automatic theme application
- Standardized interactive states
- Consistent spacing and typography

### Maintainability  
- Centralized styling definitions
- Type-safe theme integration
- Reusable component patterns
- Easy theme updates

### Performance
- CSS-in-JS optimization
- Component-scoped styling
- Automatic vendor prefixing
- Dead code elimination

## 🔗 Integration

### Used By
- All feature components for consistent styling
- Layout components for structural design
- Form components for input styling
- Data display components for table and card layouts

### Dependencies
- **styled-components**: CSS-in-JS library
- **Theme Provider**: Global theme context
- **Design System**: Color and spacing tokens

---

Part of the [Frontend Components](../) system providing consistent styling and theming across the dashboard.