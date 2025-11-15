# Global Styles

This directory contains global CSS styles and theme definitions.

## 📁 Files

- **`theme.css`** - Global CSS variables and theme definitions

## 🎨 Global Theme System

### Purpose
The `theme.css` file provides:
- **CSS Custom Properties**: Global CSS variables for consistent theming
- **Base Styles**: Foundational styles applied to the entire application
- **Theme Switching**: CSS variables that change based on theme selection
- **Responsive Utilities**: Global responsive design utilities

### CSS Variables Structure
```css
:root {
  /* Color System */
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #0f172a;
  
  /* Spacing System (4px base unit) */
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */
  
  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Border Radius */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### Dark Theme Variables
```css
[data-theme="dark"] {
  --color-primary: #3b82f6;
  --color-secondary: #94a3b8;
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f8fafc;
  /* ... additional dark theme variables */
}
```

## 🔧 Integration with Styled Components

### CSS Variable Usage
```typescript
const StyledButton = styled.button`
  background-color: var(--color-primary);
  color: var(--color-primary-text);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  
  &:hover {
    background-color: var(--color-primary-hover);
  }
`;
```

### Theme Context Integration
```typescript
// Styled components can also access theme context
const ThemedComponent = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  /* Fallback to CSS variables */
  background-color: var(--color-background);
`;
```

## 🎯 Global Styles

### Reset and Normalization
```css
/* Global resets */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.5;
  color: var(--color-text);
  background-color: var(--color-background);
}
```

### Utility Classes
```css
/* Common utility classes */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}
```

## 📱 Responsive Design

### Breakpoint System
```css
/* Responsive breakpoints */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* Media query utilities */
@media (min-width: 768px) {
  .container {
    padding: 0 var(--spacing-lg);
  }
}
```

### Mobile-First Approach
- Base styles target mobile devices
- Progressive enhancement for larger screens
- Touch-friendly sizing and spacing
- Responsive typography scaling

## ⚡ Performance Considerations

### CSS Loading Strategy
- **Critical CSS**: Essential styles loaded inline
- **Non-Critical CSS**: Loaded asynchronously
- **CSS Variables**: Efficient theme switching without re-painting
- **Minimal Specificity**: Avoid complex selectors for performance

### Bundle Optimization
- **Tree Shaking**: Remove unused CSS classes
- **Minification**: Compressed CSS output
- **Caching**: Optimal cache headers for CSS files
- **Compression**: Gzip/Brotli compression support

## 🎨 Theme Switching

### JavaScript Integration
```typescript
// Theme switching functionality
const setTheme = (theme: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

// System preference detection
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
```

### Smooth Transitions
```css
/* Theme transition animations */
* {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
```

---

Part of the [Frontend Source](../) providing global styling, theme management, and CSS architecture for the entire React application.