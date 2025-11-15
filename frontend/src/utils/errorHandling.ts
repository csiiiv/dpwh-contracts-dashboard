// Error handling utilities for better user experience

import { AppError } from '../types/DataExplorer'

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Create a standardized error object
   */
  createError(message: string, code?: string, details?: any): AppError {
    return {
      message,
      code,
      details,
      timestamp: new Date()
    }
  }

  /**
   * Handle API errors with proper typing
   */
  handleApiError(error: unknown): AppError {
    console.error('API Error:', error)
    
    if (error instanceof Error) {
      return this.createError(
        error.message || 'An unexpected error occurred',
        'API_ERROR',
        { originalError: error }
      )
    }
    
    if (typeof error === 'string') {
      return this.createError(error, 'API_ERROR')
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return this.createError(
        String(error.message),
        'API_ERROR',
        error
      )
    }
    
    return this.createError('An unknown error occurred', 'UNKNOWN_ERROR')
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: unknown): AppError {
    console.error('Network Error:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.createError(
        'Unable to connect to the server. Please check your internet connection.',
        'NETWORK_ERROR'
      )
    }
    
    return this.createError(
      'Network error occurred. Please try again.',
      'NETWORK_ERROR',
      error
    )
  }

  /**
   * Handle validation errors
   */
  handleValidationError(message: string, field?: string): AppError {
    return this.createError(
      message,
      'VALIDATION_ERROR',
      { field }
    )
  }

  /**
   * Handle timeout errors
   */
  handleTimeoutError(): AppError {
    return this.createError(
      'Request timed out. Please try again.',
      'TIMEOUT_ERROR'
    )
  }

  /**
   * Log error for debugging
   */
  logError(error: AppError): void {
    this.errorLog.push(error)
    console.error('Logged Error:', error)
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(-count)
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: AppError): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection and try again.'
      
      case 'API_ERROR':
        return error.message || 'An error occurred while loading data. Please try again.'
      
      case 'VALIDATION_ERROR':
        return error.message || 'Please check your input and try again.'
      
      case 'TIMEOUT_ERROR':
        return 'The request is taking longer than expected. Please try again.'
      
      case 'UNKNOWN_ERROR':
        return 'An unexpected error occurred. Please refresh the page and try again.'
      
      default:
        return error.message || 'An error occurred. Please try again.'
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Utility functions for common error scenarios
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  fallback?: T
): Promise<{ data: T | null; error: AppError | null }> => {
  try {
    const data = await asyncFn()
    return { data, error: null }
  } catch (error) {
    const appError = errorHandler.handleApiError(error)
    errorHandler.logError(appError)
    return { data: fallback || null, error: appError }
  }
}

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorMessage?: string
) => {
  return async (...args: T): Promise<{ data: R | null; error: AppError | null }> => {
    try {
      const data = await fn(...args)
      return { data, error: null }
    } catch (error) {
      const appError = errorHandler.handleApiError(error)
      if (errorMessage) {
        appError.message = errorMessage
      }
      errorHandler.logError(appError)
      return { data: null, error: appError }
    }
  }
}

// Error boundary helper
export const createErrorBoundary = (error: Error): AppError => {
  return errorHandler.createError(
    error.message || 'Component error occurred',
    'COMPONENT_ERROR',
    { stack: error.stack }
  )
}
