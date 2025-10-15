/**
 * Error handling utilities for consistent error management across the application
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Parses API error responses and returns a user-friendly error message
 */
export function parseApiError(error: any): string {
  // Network errors
  if (!error || typeof error !== 'object') {
    return 'An unexpected error occurred. Please try again.';
  }

  // Fetch API errors (network issues)
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  // If it's already a string error message
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object with a message
  if (error.message) {
    return error.message;
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Maps HTTP status codes to user-friendly error messages
 */
export function getStatusErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource may already exist.';
    case 422:
      return 'Invalid data provided. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Service temporarily unavailable. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      if (status >= 500) {
        return 'Server error. Please try again later.';
      } else if (status >= 400) {
        return 'Request failed. Please check your input and try again.';
      }
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formats error messages for display
 */
export function formatErrorMessage(error: any, context?: string): string {
  const message = parseApiError(error);
  
  if (context) {
    return `${context}: ${message}`;
  }
  
  return message;
}

/**
 * Common error messages for different scenarios
 */
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
} as const;
