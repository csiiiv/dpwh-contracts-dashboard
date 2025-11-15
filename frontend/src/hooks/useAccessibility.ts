import { useState, useEffect, useCallback, useRef } from 'react'
import { accessibility, focusManagement, keyboardNavigation, screenReader, reducedMotion } from '../design-system/accessibility'

interface UseAccessibilityOptions {
  enableFocusManagement?: boolean
  enableKeyboardNavigation?: boolean
  enableScreenReader?: boolean
  enableReducedMotion?: boolean
}

interface UseAccessibilityReturn {
  // Focus management
  focusFirst: (element: HTMLElement) => void
  trapFocus: (element: HTMLElement) => () => void
  restoreFocus: (element: HTMLElement) => () => void
  
  // Keyboard navigation
  handleArrowKeys: (e: KeyboardEvent, items: HTMLElement[], currentIndex: number) => number
  handleEscape: (e: KeyboardEvent, callback: () => void) => void
  handleActivation: (e: KeyboardEvent, callback: () => void) => void
  
  // Screen reader
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  createHiddenText: (text: string) => HTMLElement
  
  // Reduced motion
  prefersReducedMotion: boolean
  getAnimation: (normalAnimation: string, reducedAnimation?: string) => string
  getTransition: (normalTransition: string, reducedTransition?: string) => string
  
  // High contrast mode
  isHighContrast: boolean
  
  // Focus state
  isFocused: boolean
  setFocused: (focused: boolean) => void
}

export const useAccessibility = (options: UseAccessibilityOptions = {}): UseAccessibilityReturn => {
  const {
    enableFocusManagement = true,
    enableKeyboardNavigation = true,
    enableScreenReader = true,
    enableReducedMotion = true,
  } = options

  const [isHighContrast, setIsHighContrast] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const focusRef = useRef<HTMLElement | null>(null)

  // Check for high contrast mode
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkHighContrast = () => {
      const isHighContrastMode = window.matchMedia('(prefers-contrast: high)').matches
      setIsHighContrast(isHighContrastMode)
    }

    checkHighContrast()
    
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    mediaQuery.addEventListener('change', checkHighContrast)
    
    return () => mediaQuery.removeEventListener('change', checkHighContrast)
  }, [])

  // Check for reduced motion preference
  useEffect(() => {
    if (!enableReducedMotion || typeof window === 'undefined') return

    const checkReducedMotion = () => {
      const prefersReduced = reducedMotion.prefersReducedMotion()
      setPrefersReducedMotion(prefersReduced)
    }

    checkReducedMotion()
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', checkReducedMotion)
    
    return () => mediaQuery.removeEventListener('change', checkReducedMotion)
  }, [enableReducedMotion])

  // Focus management functions
  const focusFirst = useCallback((element: HTMLElement) => {
    if (!enableFocusManagement) return
    focusManagement.focusFirst(element)
  }, [enableFocusManagement])

  const trapFocus = useCallback((element: HTMLElement) => {
    if (!enableFocusManagement) return () => {}
    return focusManagement.trapFocus(element)
  }, [enableFocusManagement])

  const restoreFocus = useCallback((element: HTMLElement) => {
    if (!enableFocusManagement) return () => {}
    return focusManagement.restoreFocus(element)
  }, [enableFocusManagement])

  // Keyboard navigation functions
  const handleArrowKeys = useCallback((e: KeyboardEvent, items: HTMLElement[], currentIndex: number) => {
    if (!enableKeyboardNavigation) return currentIndex
    return keyboardNavigation.handleArrowKeys(e, items, currentIndex)
  }, [enableKeyboardNavigation])

  const handleEscape = useCallback((e: KeyboardEvent, callback: () => void) => {
    if (!enableKeyboardNavigation) return
    keyboardNavigation.handleEscape(e, callback)
  }, [enableKeyboardNavigation])

  const handleActivation = useCallback((e: KeyboardEvent, callback: () => void) => {
    if (!enableKeyboardNavigation) return
    keyboardNavigation.handleActivation(e, callback)
  }, [enableKeyboardNavigation])

  // Screen reader functions
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableScreenReader) return
    screenReader.announce(message, priority)
  }, [enableScreenReader])

  const createHiddenText = useCallback((text: string) => {
    if (!enableScreenReader) return document.createElement('span')
    return screenReader.createHiddenText(text)
  }, [enableScreenReader])

  // Reduced motion functions
  const getAnimation = useCallback((normalAnimation: string, reducedAnimation: string = 'none') => {
    if (!enableReducedMotion) return normalAnimation
    return reducedMotion.getAnimation(normalAnimation, reducedAnimation)
  }, [enableReducedMotion])

  const getTransition = useCallback((normalTransition: string, reducedTransition: string = 'none') => {
    if (!enableReducedMotion) return normalTransition
    return reducedMotion.getTransition(normalTransition, reducedTransition)
  }, [enableReducedMotion])

  // Focus state management
  const setFocused = useCallback((focused: boolean) => {
    setIsFocused(focused)
  }, [])

  return {
    // Focus management
    focusFirst,
    trapFocus,
    restoreFocus,
    
    // Keyboard navigation
    handleArrowKeys,
    handleEscape,
    handleActivation,
    
    // Screen reader
    announce,
    createHiddenText,
    
    // Reduced motion
    prefersReducedMotion,
    getAnimation,
    getTransition,
    
    // High contrast mode
    isHighContrast,
    
    // Focus state
    isFocused,
    setFocused,
  }
}

// Hook for managing focus within a component
export const useFocusManagement = (elementRef: React.RefObject<HTMLElement>) => {
  const [isFocused, setIsFocused] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)

  const focusableElements = useRef<HTMLElement[]>([])

  // Update focusable elements when component mounts or updates
  useEffect(() => {
    if (!elementRef.current) return

    const elements = Array.from(
      elementRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[]

    focusableElements.current = elements
  }, [elementRef])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { key } = e
    const elements = focusableElements.current

    if (elements.length === 0) return

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        setFocusIndex(prev => Math.min(prev + 1, elements.length - 1))
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        setFocusIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        setFocusIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusIndex(elements.length - 1)
        break
      case 'Tab':
        // Let default tab behavior handle this
        break
    }
  }, [])

  // Focus the current element
  useEffect(() => {
    const elements = focusableElements.current
    if (elements[focusIndex]) {
      elements[focusIndex].focus()
    }
  }, [focusIndex])

  // Add keyboard event listener
  useEffect(() => {
    if (!elementRef.current) return

    elementRef.current.addEventListener('keydown', handleKeyDown)
    return () => {
      elementRef.current?.removeEventListener('keydown', handleKeyDown)
    }
  }, [elementRef, handleKeyDown])

  return {
    isFocused,
    focusIndex,
    setFocusIndex,
    focusableElements: focusableElements.current,
  }
}

// Hook for managing ARIA attributes
export const useAriaAttributes = (baseProps: Record<string, any> = {}) => {
  const [ariaAttributes, setAriaAttributes] = useState<Record<string, any>>(baseProps)

  const updateAriaAttribute = useCallback((key: string, value: any) => {
    setAriaAttributes(prev => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const removeAriaAttribute = useCallback((key: string) => {
    setAriaAttributes(prev => {
      const { [key]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const getAriaProps = useCallback(() => {
    return Object.entries(ariaAttributes).reduce((props, [key, value]) => {
      if (key.startsWith('aria-') || key.startsWith('data-')) {
        props[key] = value
      }
      return props
    }, {} as Record<string, any>)
  }, [ariaAttributes])

  return {
    ariaAttributes,
    updateAriaAttribute,
    removeAriaAttribute,
    getAriaProps,
  }
}
