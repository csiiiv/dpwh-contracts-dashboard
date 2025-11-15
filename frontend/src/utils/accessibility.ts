// Accessibility utilities and helpers

import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Hook for managing focus within a component
 */
export const useFocusManagement = () => {
  const focusableElementsRef = useRef<HTMLElement[]>([])
  const currentFocusIndexRef = useRef<number>(-1)

  const updateFocusableElements = useCallback((container: HTMLElement) => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    focusableElementsRef.current = Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[]
  }, [])

  const focusNext = useCallback(() => {
    if (focusableElementsRef.current.length === 0) return

    currentFocusIndexRef.current = (currentFocusIndexRef.current + 1) % focusableElementsRef.current.length
    focusableElementsRef.current[currentFocusIndexRef.current]?.focus()
  }, [])

  const focusPrevious = useCallback(() => {
    if (focusableElementsRef.current.length === 0) return

    currentFocusIndexRef.current = currentFocusIndexRef.current <= 0 
      ? focusableElementsRef.current.length - 1 
      : currentFocusIndexRef.current - 1
    focusableElementsRef.current[currentFocusIndexRef.current]?.focus()
  }, [])

  const focusFirst = useCallback(() => {
    if (focusableElementsRef.current.length === 0) return

    currentFocusIndexRef.current = 0
    focusableElementsRef.current[0]?.focus()
  }, [])

  const focusLast = useCallback(() => {
    if (focusableElementsRef.current.length === 0) return

    currentFocusIndexRef.current = focusableElementsRef.current.length - 1
    focusableElementsRef.current[currentFocusIndexRef.current]?.focus()
  }, [])

  return {
    updateFocusableElements,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast
  }
}

/**
 * Hook for keyboard navigation
 */
export const useKeyboardNavigation = (
  onEscape?: () => void,
  onEnter?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void
) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        onEscape?.()
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onEnter?.()
        break
      case 'ArrowUp':
        event.preventDefault()
        onArrowUp?.()
        break
      case 'ArrowDown':
        event.preventDefault()
        onArrowDown?.()
        break
      case 'ArrowLeft':
        event.preventDefault()
        onArrowLeft?.()
        break
      case 'ArrowRight':
        event.preventDefault()
        onArrowRight?.()
        break
    }
  }, [onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Hook for screen reader announcements
 */
export const useScreenReaderAnnouncements = () => {
  const announceRef = useRef<HTMLDivElement | null>(null)

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceRef.current) {
      // Create a live region if it doesn't exist
      const liveRegion = document.createElement('div')
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.style.position = 'absolute'
      liveRegion.style.left = '-10000px'
      liveRegion.style.width = '1px'
      liveRegion.style.height = '1px'
      liveRegion.style.overflow = 'hidden'
      document.body.appendChild(liveRegion)
      announceRef.current = liveRegion
    }

    announceRef.current.textContent = message
  }, [])

  const announceError = useCallback((message: string) => {
    announce(message, 'assertive')
  }, [announce])

  const announceSuccess = useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  const announceInfo = useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  return {
    announce,
    announceError,
    announceSuccess,
    announceInfo
  }
}

/**
 * Hook for managing ARIA attributes
 */
export const useAriaAttributes = () => {
  const setAriaLabel = useCallback((element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label)
  }, [])

  const setAriaDescribedBy = useCallback((element: HTMLElement, id: string) => {
    element.setAttribute('aria-describedby', id)
  }, [])

  const setAriaExpanded = useCallback((element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString())
  }, [])

  const setAriaSelected = useCallback((element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString())
  }, [])

  const setAriaHidden = useCallback((element: HTMLElement, hidden: boolean) => {
    element.setAttribute('aria-hidden', hidden.toString())
  }, [])

  const setAriaLive = useCallback((element: HTMLElement, live: 'off' | 'polite' | 'assertive') => {
    element.setAttribute('aria-live', live)
  }, [])

  const setAriaAtomic = useCallback((element: HTMLElement, atomic: boolean) => {
    element.setAttribute('aria-atomic', atomic.toString())
  }, [])

  const setAriaRole = useCallback((element: HTMLElement, role: string) => {
    element.setAttribute('role', role)
  }, [])

  const setAriaControls = useCallback((element: HTMLElement, id: string) => {
    element.setAttribute('aria-controls', id)
  }, [])

  const setAriaOwns = useCallback((element: HTMLElement, id: string) => {
    element.setAttribute('aria-owns', id)
  }, [])

  return {
    setAriaLabel,
    setAriaDescribedBy,
    setAriaExpanded,
    setAriaSelected,
    setAriaHidden,
    setAriaLive,
    setAriaAtomic,
    setAriaRole,
    setAriaControls,
    setAriaOwns
  }
}

/**
 * Hook for color contrast checking
 */
export const useColorContrast = () => {
  const getContrastRatio = useCallback((color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      const rgb = color.match(/\d+/g)
      if (!rgb || rgb.length < 3) return 0

      const [r, g, b] = rgb.map(Number)
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  }, [])

  const isAccessibleContrast = useCallback((color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = getContrastRatio(color1, color2)
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7
  }, [getContrastRatio])

  const getContrastLevel = useCallback((color1: string, color2: string): 'AAA' | 'AA' | 'A' | 'Fail' => {
    const ratio = getContrastRatio(color1, color2)
    if (ratio >= 7) return 'AAA'
    if (ratio >= 4.5) return 'AA'
    if (ratio >= 3) return 'A'
    return 'Fail'
  }, [getContrastRatio])

  return {
    getContrastRatio,
    isAccessibleContrast,
    getContrastLevel
  }
}

/**
 * Hook for managing reduced motion preferences
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * Hook for managing high contrast mode
 */
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setIsHighContrast(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isHighContrast
}

/**
 * Hook for managing focus trap
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement | null>(null)
  const { updateFocusableElements, focusNext, focusPrevious } = useFocusManagement()

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    updateFocusableElements(containerRef.current)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        if (event.shiftKey) {
          focusPrevious()
        } else {
          focusNext()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, updateFocusableElements, focusNext, focusPrevious])

  return containerRef
}

/**
 * Utility for generating accessible IDs
 */
export const generateAccessibleId = (prefix: string, suffix?: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix}-${suffix || random}-${timestamp}`
}

/**
 * Utility for creating accessible button props
 */
export const createAccessibleButtonProps = (
  label: string,
  description?: string,
  pressed?: boolean,
  expanded?: boolean
) => {
  const id = generateAccessibleId('button')
  const describedBy = description ? generateAccessibleId('button-desc') : undefined

  return {
    id,
    'aria-label': label,
    'aria-describedby': describedBy,
    'aria-pressed': pressed,
    'aria-expanded': expanded,
    role: 'button',
    tabIndex: 0
  }
}

/**
 * Utility for creating accessible table props
 */
export const createAccessibleTableProps = (
  caption: string,
  rowCount: number,
  colCount: number
) => {
  return {
    role: 'table',
    'aria-label': caption,
    'aria-rowcount': rowCount,
    'aria-colcount': colCount
  }
}

/**
 * Utility for creating accessible form field props
 */
export const createAccessibleFormFieldProps = (
  label: string,
  description?: string,
  error?: string,
  required?: boolean
) => {
  const fieldId = generateAccessibleId('field')
  const labelId = generateAccessibleId('label')
  const describedBy = [description && generateAccessibleId('description'), error && generateAccessibleId('error')]
    .filter(Boolean)
    .join(' ')

  return {
    fieldId,
    labelId,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': !!error,
    'aria-required': required,
    'aria-labelledby': labelId
  }
}

export default {
  useFocusManagement,
  useKeyboardNavigation,
  useScreenReaderAnnouncements,
  useAriaAttributes,
  useColorContrast,
  useReducedMotion,
  useHighContrast,
  useFocusTrap,
  generateAccessibleId,
  createAccessibleButtonProps,
  createAccessibleTableProps,
  createAccessibleFormFieldProps
}
