import { renderHook, act } from '@testing-library/react'
import { useLoadingState } from '../hooks/useLoadingState'

describe('useLoadingState', () => {
  it('initializes with default loading state', () => {
    const { result } = renderHook(() => useLoadingState())
    
    expect(result.current.loading).toEqual({
      main: false,
      modal: false,
      dbInitializing: true,
      debouncing: false
    })
    expect(result.current.isLoading).toBe(true) // dbInitializing is true
  })

  it('initializes with custom initial state', () => {
    const initialState = {
      main: true,
      modal: false,
      dbInitializing: false,
      debouncing: true
    }
    
    const { result } = renderHook(() => useLoadingState(initialState))
    
    expect(result.current.loading).toEqual(initialState)
    expect(result.current.isLoading).toBe(true) // main is true
  })

  it('updates main loading state', () => {
    const { result } = renderHook(() => useLoadingState())
    
    act(() => {
      result.current.setMainLoading(true)
    })
    
    expect(result.current.loading.main).toBe(true)
    expect(result.current.isLoading).toBe(true)
    
    act(() => {
      result.current.setMainLoading(false)
    })
    
    expect(result.current.loading.main).toBe(false)
    expect(result.current.isLoading).toBe(true) // dbInitializing is still true
  })

  it('updates modal loading state', () => {
    const { result } = renderHook(() => useLoadingState())
    
    act(() => {
      result.current.setModalLoading(true)
    })
    
    expect(result.current.loading.modal).toBe(true)
    expect(result.current.isLoading).toBe(true)
    
    act(() => {
      result.current.setModalLoading(false)
    })
    
    expect(result.current.loading.modal).toBe(false)
    expect(result.current.isLoading).toBe(true) // dbInitializing is still true
  })

  it('updates db initializing state', () => {
    const { result } = renderHook(() => useLoadingState())
    
    expect(result.current.loading.dbInitializing).toBe(true)
    expect(result.current.isLoading).toBe(true)
    
    act(() => {
      result.current.setDbInitializing(false)
    })
    
    expect(result.current.loading.dbInitializing).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('updates debouncing state', () => {
    const { result } = renderHook(() => useLoadingState())
    
    act(() => {
      result.current.setDebouncing(true)
    })
    
    expect(result.current.loading.debouncing).toBe(true)
    expect(result.current.isLoading).toBe(true) // dbInitializing is still true
    
    act(() => {
      result.current.setDebouncing(false)
    })
    
    expect(result.current.loading.debouncing).toBe(false)
    expect(result.current.isLoading).toBe(true) // dbInitializing is still true
  })

  it('sets all loading states', () => {
    const { result } = renderHook(() => useLoadingState())
    
    act(() => {
      result.current.setAllLoading(true)
    })
    
    expect(result.current.loading.main).toBe(true)
    expect(result.current.loading.modal).toBe(true)
    expect(result.current.loading.dbInitializing).toBe(true) // unchanged
    expect(result.current.loading.debouncing).toBe(false) // unchanged
    expect(result.current.isLoading).toBe(true)
    
    act(() => {
      result.current.setAllLoading(false)
    })
    
    expect(result.current.loading.main).toBe(false)
    expect(result.current.loading.modal).toBe(false)
    expect(result.current.loading.dbInitializing).toBe(true) // unchanged
    expect(result.current.loading.debouncing).toBe(false) // unchanged
    expect(result.current.isLoading).toBe(true) // dbInitializing is still true
  })

  it('resets all loading states', () => {
    const { result } = renderHook(() => useLoadingState())
    
    // Set some loading states
    act(() => {
      result.current.setMainLoading(true)
      result.current.setModalLoading(true)
      result.current.setDebouncing(true)
    })
    
    expect(result.current.loading.main).toBe(true)
    expect(result.current.loading.modal).toBe(true)
    expect(result.current.loading.debouncing).toBe(true)
    expect(result.current.isLoading).toBe(true)
    
    // Reset all
    act(() => {
      result.current.resetLoading()
    })
    
    expect(result.current.loading).toEqual({
      main: false,
      modal: false,
      dbInitializing: false,
      debouncing: false
    })
    expect(result.current.isLoading).toBe(false)
  })

  it('correctly calculates isLoading when multiple states are true', () => {
    const { result } = renderHook(() => useLoadingState())
    
    act(() => {
      result.current.setMainLoading(true)
      result.current.setModalLoading(true)
      result.current.setDbInitializing(false)
      result.current.setDebouncing(true)
    })
    
    expect(result.current.isLoading).toBe(true)
    
    act(() => {
      result.current.setMainLoading(false)
      result.current.setModalLoading(false)
      result.current.setDebouncing(false)
    })
    
    expect(result.current.isLoading).toBe(false)
  })

  it('correctly calculates isLoading when only dbInitializing is true', () => {
    const { result } = renderHook(() => useLoadingState())
    
    expect(result.current.loading.dbInitializing).toBe(true)
    expect(result.current.isLoading).toBe(true)
    
    act(() => {
      result.current.setDbInitializing(false)
    })
    
    expect(result.current.isLoading).toBe(false)
  })

  it('maintains state independence between different loading types', () => {
    const { result } = renderHook(() => useLoadingState())
    
    act(() => {
      result.current.setMainLoading(true)
      result.current.setModalLoading(false)
      result.current.setDbInitializing(false)
      result.current.setDebouncing(true)
    })
    
    expect(result.current.loading.main).toBe(true)
    expect(result.current.loading.modal).toBe(false)
    expect(result.current.loading.dbInitializing).toBe(false)
    expect(result.current.loading.debouncing).toBe(true)
    expect(result.current.isLoading).toBe(true)
  })
})
