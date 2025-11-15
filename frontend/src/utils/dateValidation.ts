/**
 * Date validation utilities for custom date ranges
 */

export interface DateValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates if a date string is in valid YYYY-MM-DD format and represents a real date
 */
export const validateDateString = (dateString: string): DateValidationResult => {
  if (!dateString) {
    return { isValid: false, error: 'Date is required' }
  }

  // Check if it matches YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) {
    return { isValid: false, error: 'Date must be in YYYY-MM-DD format' }
  }

  // Parse the date and check if it's valid
  const date = new Date(dateString + 'T00:00:00.000Z')
  const [year, month, day] = dateString.split('-').map(Number)
  
  // Check if the parsed date matches the input (handles invalid dates like Feb 31)
  if (date.getUTCFullYear() !== year || 
      date.getUTCMonth() !== month - 1 || 
      date.getUTCDate() !== day) {
    return { isValid: false, error: 'Invalid date (e.g., February 31st does not exist)' }
  }

  // Check if date is within reasonable range for PHILGEPS data
  if (year < 2013 || year > 2025) {
    return { isValid: false, error: 'Date must be between 2013 and 2025' }
  }

  return { isValid: true }
}

/**
 * Validates a date range (start and end dates)
 */
export const validateDateRange = (startDate: string, endDate: string): DateValidationResult => {
  const startValidation = validateDateString(startDate)
  if (!startValidation.isValid) {
    return { isValid: false, error: `Start date: ${startValidation.error}` }
  }

  const endValidation = validateDateString(endDate)
  if (!endValidation.isValid) {
    return { isValid: false, error: `End date: ${endValidation.error}` }
  }

  // Check if start date is before end date
  const start = new Date(startDate + 'T00:00:00.000Z')
  const end = new Date(endDate + 'T00:00:00.000Z')
  
  if (start > end) {
    return { isValid: false, error: 'Start date must be before end date' }
  }

  return { isValid: true }
}

/**
 * Formats a date for display in error messages
 */
export const formatDateForDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString + 'T00:00:00.000Z')
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

/**
 * Gets the last day of a month for a given year and month
 */
export const getLastDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate()
}

/**
 * Checks if a date is valid by attempting to create a Date object
 */
export const isValidDate = (year: number, month: number, day: number): boolean => {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day
}

