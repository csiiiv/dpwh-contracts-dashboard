// Accessibility tokens and utilities
export const accessibility = {
  // Focus states
  focus: {
    ring: {
      width: '2px',
      offset: '2px',
      color: {
        light: '#3b82f6', // blue-500
        dark: '#60a5fa',  // blue-400
      },
    },
    outline: {
      width: '2px',
      style: 'solid',
      color: {
        light: '#3b82f6',
        dark: '#60a5fa',
      },
    },
    visible: {
      light: '0 0 0 2px #3b82f6',
      dark: '0 0 0 2px #60a5fa',
    },
  },
  
  // High contrast mode support
  highContrast: {
    enabled: false, // Will be set dynamically
    colors: {
      light: {
        background: '#ffffff',
        foreground: '#000000',
        primary: '#0000ff',
        secondary: '#800080',
        accent: '#ff0000',
        muted: '#808080',
      },
      dark: {
        background: '#000000',
        foreground: '#ffffff',
        primary: '#00ffff',
        secondary: '#ff00ff',
        accent: '#ffff00',
        muted: '#808080',
      },
    },
  },
  
  // Screen reader utilities
  screenReader: {
    only: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    },
    visible: {
      position: 'static',
      width: 'auto',
      height: 'auto',
      padding: '0',
      margin: '0',
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal',
    },
  },
  
  // ARIA states
  aria: {
    expanded: {
      true: 'true',
      false: 'false',
    },
    selected: {
      true: 'true',
      false: 'false',
    },
    checked: {
      true: 'true',
      false: 'false',
      mixed: 'mixed',
    },
    disabled: {
      true: 'true',
      false: 'false',
    },
    hidden: {
      true: 'true',
      false: 'false',
    },
    invalid: {
      true: 'true',
      false: 'false',
    },
    required: {
      true: 'true',
      false: 'false',
    },
  },
  
  // Color contrast ratios
  contrast: {
    // WCAG AA standards
    aa: {
      normal: 4.5,
      large: 3.0,
    },
    // WCAG AAA standards
    aaa: {
      normal: 7.0,
      large: 4.5,
    },
  },
  
  // Touch targets
  touchTarget: {
    minSize: '44px', // iOS and Android minimum
    recommendedSize: '48px', // Material Design recommended
  },
  
  // Spacing for accessibility
  spacing: {
    // Minimum spacing between interactive elements
    interactive: '8px',
    // Spacing for focus indicators
    focus: '4px',
    // Spacing for error messages
    error: '4px',
  },
}

// Focus management utilities
export const focusManagement = {
  // Focus trap for modals
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  },
  
  // Restore focus after modal closes
  restoreFocus: (element: HTMLElement) => {
    const previouslyFocused = document.activeElement as HTMLElement
    element.focus()
    
    return () => {
      previouslyFocused?.focus()
    }
  },
  
  // Focus first focusable element
  focusFirst: (element: HTMLElement) => {
    const focusableElement = element.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    focusableElement?.focus()
  },
}

// Color contrast utilities
export const colorContrast = {
  // Calculate relative luminance
  getLuminance: (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },
  
  // Calculate contrast ratio
  getContrastRatio: (color1: [number, number, number], color2: [number, number, number]) => {
    const lum1 = colorContrast.getLuminance(...color1)
    const lum2 = colorContrast.getLuminance(...color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)
  },
  
  // Check if contrast meets WCAG standards
  meetsWCAG: (color1: [number, number, number], color2: [number, number, number], level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal') => {
    const ratio = colorContrast.getContrastRatio(color1, color2)
    const required = level === 'AA' ? accessibility.contrast.aa[size] : accessibility.contrast.aaa[size]
    return ratio >= required
  },
}

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Arrow key navigation for lists
  handleArrowKeys: (e: KeyboardEvent, items: HTMLElement[], currentIndex: number) => {
    const { key } = e
    let newIndex = currentIndex

    switch (key) {
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + 1, items.length - 1)
        break
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - 1, 0)
        break
      case 'Home':
        newIndex = 0
        break
      case 'End':
        newIndex = items.length - 1
        break
      default:
        return currentIndex
    }

    e.preventDefault()
    items[newIndex]?.focus()
    return newIndex
  },
  
  // Escape key handler
  handleEscape: (e: KeyboardEvent, callback: () => void) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      callback()
    }
  },
  
  // Enter/Space key handler
  handleActivation: (e: KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      callback()
    }
  },
}

// Screen reader utilities
export const screenReader = {
  // Announce message to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },
  
  // Create visually hidden text
  createHiddenText: (text: string) => {
    const element = document.createElement('span')
    element.className = 'sr-only'
    element.textContent = text
    return element
  },
}

// Reduced motion utilities
export const reducedMotion = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },
  
  // Get animation with reduced motion support
  getAnimation: (normalAnimation: string, reducedAnimation: string = 'none') => {
    return reducedMotion.prefersReducedMotion() ? reducedAnimation : normalAnimation
  },
  
  // Get transition with reduced motion support
  getTransition: (normalTransition: string, reducedTransition: string = 'none') => {
    return reducedMotion.prefersReducedMotion() ? reducedTransition : normalTransition
  },
}
