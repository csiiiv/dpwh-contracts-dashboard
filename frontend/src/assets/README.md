# Static Assets

This directory contains static assets used throughout the frontend application.

## 📁 Files

- **`react.svg`** - React logo SVG for branding and loading states

## 🖼️ Asset Categories

### Brand Assets
- **React Logo**: Official React.js logo used in loading states, about pages, and development references
- **Project Icons**: Application-specific icons and logos (may be added in future)
- **Favicon Assets**: Browser tab icons and PWA icons (typically in public folder)

### Image Assets
- **Illustrations**: Decorative images for empty states, onboarding, or feature highlights
- **Icons**: Custom SVG icons not available in icon libraries
- **Screenshots**: Documentation images showing features or UI examples
- **Logos**: Third-party logos for integrations or acknowledgments

## 🎯 Asset Management Strategy

### File Organization
```
assets/
├── icons/          # Custom SVG icons
├── images/         # Raster images (PNG, JPG)
├── logos/          # Brand and partner logos
├── illustrations/  # Decorative graphics
└── react.svg       # Framework assets
```

### Naming Conventions
- **Kebab-case**: All filenames use lowercase with hyphens
- **Descriptive Names**: Clear indication of asset purpose
- **Size Indicators**: Include dimensions for multiple sizes (e.g., `logo-small.svg`, `logo-large.svg`)
- **Format Extensions**: Appropriate file extensions (.svg, .png, .jpg, .webp)

## 🔧 Usage Patterns

### Import Strategy
```typescript
// Static imports for bundling
import ReactLogo from '../assets/react.svg';
import CustomIcon from '../assets/icons/custom-icon.svg';

// Dynamic imports for code splitting
const loadIcon = async (iconName: string) => {
  return await import(`../assets/icons/${iconName}.svg`);
};
```

### Component Integration
```typescript
const LoadingSpinner = () => (
  <SpinnerContainer>
    <img src={ReactLogo} alt="Loading..." width={32} height={32} />
    <LoadingText>Processing data...</LoadingText>
  </SpinnerContainer>
);
```

## 📐 Asset Optimization

### SVG Assets
- **Optimized Files**: Run through SVGO for size reduction
- **Accessible Markup**: Include title and description elements
- **Scalable Design**: Vector graphics that work at any size
- **Theme Compatibility**: Colors that work with light/dark themes

### Raster Images
- **Multiple Formats**: WebP with PNG/JPG fallbacks
- **Responsive Images**: Multiple sizes for different screen densities
- **Compression**: Optimized file sizes without quality loss
- **Lazy Loading**: Load images only when needed

## 🎨 Design System Integration

### Icon System
```typescript
// Custom icon component
interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, color, className }) => {
  const IconComponent = React.lazy(() => import(`../assets/icons/${name}.svg`));
  
  return (
    <Suspense fallback={<div style={{ width: size, height: size }} />}>
      <IconComponent 
        width={size} 
        height={size} 
        fill={color}
        className={className}
      />
    </Suspense>
  );
};
```

### Theme-Aware Assets
```css
/* SVG icons that adapt to theme */
.icon {
  fill: var(--color-text);
  transition: fill 0.2s ease;
}

[data-theme="dark"] .icon {
  fill: var(--color-text-dark);
}
```

## ⚡ Performance Considerations

### Bundle Size Impact
- **Asset Bundling**: Small assets bundled with JavaScript
- **External Assets**: Large assets served separately
- **Code Splitting**: Assets loaded only when needed
- **Caching Strategy**: Long-term caching for static assets

### Loading Optimization
- **Preloading**: Critical assets loaded early
- **Lazy Loading**: Non-critical assets loaded on demand
- **Progressive Enhancement**: Fallbacks for slow connections
- **Compression**: Server-side compression for asset delivery

## 🔗 Build Integration

### Vite Asset Handling
```typescript
// Vite automatically processes assets
import logo from './assets/logo.svg'; // Returns URL string
import logoUrl from './assets/logo.svg?url'; // Explicit URL import
import logoRaw from './assets/logo.svg?raw'; // Raw SVG content
```

### Asset Pipeline
- **Development**: Assets served directly by Vite dev server
- **Production**: Assets processed, optimized, and cached
- **CDN Integration**: Assets can be deployed to CDN for global distribution
- **Version Hashing**: Automatic cache-busting through filename hashing

## 📱 Responsive Assets

### Multi-Resolution Support
```typescript
// Responsive image component
const ResponsiveImage = ({ src, alt, sizes }) => (
  <picture>
    <source 
      media="(min-width: 768px)" 
      srcSet={`${src}-large.webp 1x, ${src}-large@2x.webp 2x`} 
    />
    <source 
      srcSet={`${src}-small.webp 1x, ${src}-small@2x.webp 2x`} 
    />
    <img src={`${src}-small.jpg`} alt={alt} />
  </picture>
);
```

---

Part of the [Frontend Source](../) providing static assets, images, icons, and media files used throughout the React application.