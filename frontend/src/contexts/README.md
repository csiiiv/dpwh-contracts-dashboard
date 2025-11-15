# React Context Providers

This directory contains React Context providers for global state management and theming.

## 📁 Components

- **`ThemeContext.tsx`** - Theme provider for light/dark mode management

## 🎨 Theme Context

### Purpose
The ThemeContext provides centralized theme management for the entire application, supporting:
- **Light/Dark Mode Toggle** - User preference-based theme switching
- **Persistent Theme State** - Theme preference saved to localStorage
- **System Theme Detection** - Automatic theme based on OS preference
- **Smooth Transitions** - Animated theme switching

### Implementation
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
```

### Features
- **Theme Persistence**: Saves user preference to localStorage
- **System Integration**: Detects and respects OS dark mode preference
- **Provider Pattern**: Wraps entire application for global access
- **Type Safety**: Fully typed context with TypeScript

## 🔧 Context Architecture

### Provider Structure
```typescript
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Theme initialization and persistence logic
  useEffect(() => {
    // Load from localStorage or detect system preference
  }, []);
  
  const value = {
    theme,
    toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light'),
    setTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={themeConfig[theme]}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
```

### Custom Hook
```typescript
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

## 🎯 Theme Configuration

### Color Schemes
```typescript
const lightTheme = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    // ... additional colors
  },
  // ... spacing, typography, etc.
};

const darkTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    // ... additional colors
  },
  // ... spacing, typography, etc.
};
```

### Design Tokens
- **Colors**: Primary, secondary, background, surface, text variants
- **Spacing**: 4px base unit system (xs, sm, md, lg, xl)
- **Typography**: Font sizes, weights, line heights
- **Borders**: Radius values, border widths
- **Shadows**: Elevation levels for depth
- **Transitions**: Animation durations and easing

## 🔗 Integration

### Application Setup
```typescript
// In App.tsx or main.tsx
function App() {
  return (
    <ThemeProvider>
      <Router>
        <Dashboard />
      </Router>
    </ThemeProvider>
  );
}
```

### Component Usage
```typescript
// Using theme in components
const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <StyledContainer>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </button>
    </StyledContainer>
  );
};
```

## 🎨 Styled Components Integration

### Theme Access
```typescript
const StyledButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;
```

### Responsive Design
```typescript
const ResponsiveContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;
```

## ⚡ Performance Considerations

### Optimization Strategies
- **Memoization**: Theme object memoized to prevent unnecessary re-renders
- **Context Splitting**: Theme context separate from other global state
- **Selective Updates**: Only theme-dependent components re-render on theme change
- **CSS Variables**: Using CSS custom properties for smooth transitions

### Bundle Size
- **Tree Shaking**: Unused theme properties are eliminated
- **Code Splitting**: Theme-specific styles loaded on demand
- **Compression**: Theme objects optimized for minimal size

---

Part of the [Frontend Source](../) providing global theme management and context-based state sharing across the React application.