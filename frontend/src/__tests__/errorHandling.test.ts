import { ErrorHandler, errorHandler, handleAsyncError, withErrorHandling } from '../utils/errorHandling'
import { AppError } from '../types/DataExplorer'

describe('ErrorHandler', () => {
  let errorHandlerInstance: ErrorHandler

  beforeEach(() => {
    errorHandlerInstance = new ErrorHandler()
  })

  describe('createError', () => {
    it('creates a proper error object', () => {
      const error = errorHandlerInstance.createError('Test error', 'TEST_ERROR', { field: 'test' })
      
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.details).toEqual({ field: 'test' })
      expect(error.timestamp).toBeInstanceOf(Date)
    })

    it('creates error without optional parameters', () => {
      const error = errorHandlerInstance.createError('Simple error')
      
      expect(error.message).toBe('Simple error')
      expect(error.code).toBeUndefined()
      expect(error.details).toBeUndefined()
      expect(error.timestamp).toBeInstanceOf(Date)
    })
  })

  describe('handleApiError', () => {
    it('handles Error objects', () => {
      const mockError = new Error('API Error')
      const handledError = errorHandlerInstance.handleApiError(mockError)
      
      expect(handledError.message).toBe('API Error')
      expect(handledError.code).toBe('API_ERROR')
      expect(handledError.details).toEqual({ originalError: mockError })
    })

    it('handles string errors', () => {
      const handledError = errorHandlerInstance.handleApiError('String error')
      
      expect(handledError.message).toBe('String error')
      expect(handledError.code).toBe('API_ERROR')
    })

    it('handles objects with message property', () => {
      const mockError = { message: 'Object error', status: 500 }
      const handledError = errorHandlerInstance.handleApiError(mockError)
      
      expect(handledError.message).toBe('Object error')
      expect(handledError.code).toBe('API_ERROR')
      expect(handledError.details).toEqual(mockError)
    })

    it('handles unknown errors', () => {
      const handledError = errorHandlerInstance.handleApiError(null)
      
      expect(handledError.message).toBe('An unknown error occurred')
      expect(handledError.code).toBe('UNKNOWN_ERROR')
    })
  })

  describe('handleNetworkError', () => {
    it('handles fetch errors', () => {
      const fetchError = new TypeError('Failed to fetch')
      const handledError = errorHandlerInstance.handleNetworkError(fetchError)
      
      expect(handledError.message).toBe('Unable to connect to the server. Please check your internet connection.')
      expect(handledError.code).toBe('NETWORK_ERROR')
    })

    it('handles other network errors', () => {
      const networkError = new Error('Network timeout')
      const handledError = errorHandlerInstance.handleNetworkError(networkError)
      
      expect(handledError.message).toBe('Network error occurred. Please try again.')
      expect(handledError.code).toBe('NETWORK_ERROR')
    })
  })

  describe('handleValidationError', () => {
    it('creates validation error with field', () => {
      const error = errorHandlerInstance.handleValidationError('Invalid input', 'email')
      
      expect(error.message).toBe('Invalid input')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.details).toEqual({ field: 'email' })
    })

    it('creates validation error without field', () => {
      const error = errorHandlerInstance.handleValidationError('Invalid input')
      
      expect(error.message).toBe('Invalid input')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.details).toEqual({ field: undefined })
    })
  })

  describe('handleTimeoutError', () => {
    it('creates timeout error', () => {
      const error = errorHandlerInstance.handleTimeoutError()
      
      expect(error.message).toBe('Request timed out. Please try again.')
      expect(error.code).toBe('TIMEOUT_ERROR')
    })
  })

  describe('logError', () => {
    it('logs error and maintains log size', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const error = errorHandlerInstance.createError('Test error')
      errorHandlerInstance.logError(error)
      
      expect(consoleSpy).toHaveBeenCalledWith('Logged Error:', error)
      expect(errorHandlerInstance.getRecentErrors()).toHaveLength(1)
      
      consoleSpy.mockRestore()
    })

    it('maintains maximum log size', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      // Add more than 100 errors
      for (let i = 0; i < 105; i++) {
        const error = errorHandlerInstance.createError(`Error ${i}`)
        errorHandlerInstance.logError(error)
      }
      
      expect(errorHandlerInstance.getRecentErrors()).toHaveLength(100)
      expect(errorHandlerInstance.getRecentErrors()[0].message).toBe('Error 5') // First 5 should be removed
      
      consoleSpy.mockRestore()
    })
  })

  describe('getUserFriendlyMessage', () => {
    it('returns appropriate message for NETWORK_ERROR', () => {
      const error: AppError = {
        message: 'Network error',
        code: 'NETWORK_ERROR',
        timestamp: new Date()
      }
      
      const message = errorHandlerInstance.getUserFriendlyMessage(error)
      expect(message).toBe('Unable to connect to the server. Please check your internet connection and try again.')
    })

    it('returns appropriate message for API_ERROR', () => {
      const error: AppError = {
        message: 'API error',
        code: 'API_ERROR',
        timestamp: new Date()
      }
      
      const message = errorHandlerInstance.getUserFriendlyMessage(error)
      expect(message).toBe('API error')
    })

    it('returns appropriate message for VALIDATION_ERROR', () => {
      const error: AppError = {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        timestamp: new Date()
      }
      
      const message = errorHandlerInstance.getUserFriendlyMessage(error)
      expect(message).toBe('Validation error')
    })

    it('returns appropriate message for TIMEOUT_ERROR', () => {
      const error: AppError = {
        message: 'Timeout error',
        code: 'TIMEOUT_ERROR',
        timestamp: new Date()
      }
      
      const message = errorHandlerInstance.getUserFriendlyMessage(error)
      expect(message).toBe('The request is taking longer than expected. Please try again.')
    })

    it('returns appropriate message for UNKNOWN_ERROR', () => {
      const error: AppError = {
        message: 'Unknown error',
        code: 'UNKNOWN_ERROR',
        timestamp: new Date()
      }
      
      const message = errorHandlerInstance.getUserFriendlyMessage(error)
      expect(message).toBe('An unexpected error occurred. Please refresh the page and try again.')
    })

    it('returns error message for unknown code', () => {
      const error: AppError = {
        message: 'Custom error',
        code: 'CUSTOM_ERROR',
        timestamp: new Date()
      }
      
      const message = errorHandlerInstance.getUserFriendlyMessage(error)
      expect(message).toBe('Custom error')
    })

    it('returns fallback message when no message provided', () => {
      const error: AppError = {
        message: '',
        timestamp: new Date()
      }
      
      const message = errorHandlerInstance.getUserFriendlyMessage(error)
      expect(message).toBe('An error occurred. Please try again.')
    })
  })
})

describe('handleAsyncError', () => {
  it('returns data and null error on success', async () => {
    const mockData = { success: true }
    const asyncFn = jest.fn().mockResolvedValue(mockData)
    
    const result = await handleAsyncError(asyncFn)
    
    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('returns error and fallback data on failure', async () => {
    const mockError = new Error('Test error')
    const asyncFn = jest.fn().mockRejectedValue(mockError)
    const fallback = { fallback: true }
    
    const result = await handleAsyncError(asyncFn, fallback)
    
    expect(result.data).toEqual(fallback)
    expect(result.error).toBeDefined()
    expect(result.error?.message).toBe('Test error')
  })

  it('returns null data when no fallback provided', async () => {
    const mockError = new Error('Test error')
    const asyncFn = jest.fn().mockRejectedValue(mockError)
    
    const result = await handleAsyncError(asyncFn)
    
    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
  })
})

describe('withErrorHandling', () => {
  it('wraps function with error handling', async () => {
    const mockFn = jest.fn().mockResolvedValue('success')
    const wrappedFn = withErrorHandling(mockFn, 'Custom error message')
    
    const result = await wrappedFn('arg1', 'arg2')
    
    expect(result.data).toBe('success')
    expect(result.error).toBeNull()
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('handles errors in wrapped function', async () => {
    const mockError = new Error('Test error')
    const mockFn = jest.fn().mockRejectedValue(mockError)
    const wrappedFn = withErrorHandling(mockFn, 'Custom error message')
    
    const result = await wrappedFn('arg1', 'arg2')
    
    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
    expect(result.error?.message).toBe('Custom error message')
  })
})
