/**
 * Sanitizes error messages to remove Hostkit/Hostaway specific information
 * and replace with generic, formal network error messages
 */

export const sanitizeErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  let errorMessage = '';
  
  // Extract message from different error formats
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error.message) {
    errorMessage = error.message;
  } else if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.response?.data?.error) {
    errorMessage = error.response.data.error;
  } else {
    return 'An unexpected error occurred. Please try again.';
  }
  
  // Convert to lowercase for case-insensitive matching
  const lowerMessage = errorMessage.toLowerCase();
  
  // Replace Hostkit/Hostaway specific errors with generic messages
  if (lowerMessage.includes('hostkit') || lowerMessage.includes('hostaway')) {
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
      return 'Network service is temporarily busy. Please try again in 1 minute.';
    }
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('invalid') || lowerMessage.includes('expired')) {
      return 'Network authentication failed. Please try again in 1 minute.';
    }
    if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
      return 'Requested resource not available. Please try again in 1 minute.';
    }
    if (lowerMessage.includes('timeout') || lowerMessage.includes('connection')) {
      return 'Network connection timeout. Please try again in 1 minute.';
    }
    if (lowerMessage.includes('server error') || lowerMessage.includes('500')) {
      return 'Network service temporarily unavailable. Please try again in 1 minute.';
    }
    if (lowerMessage.includes('api') && lowerMessage.includes('error')) {
      return 'Network service error. Please try again in 1 minute.';
    }
    // Generic fallback for any Hostkit/Hostaway related error
    return 'Network service temporarily unavailable. Please try again in 1 minute.';
  }
  
  // For non-Hostkit/Hostaway errors, return the original message
  return errorMessage;
};

/**
 * Sanitizes error messages specifically for user-facing displays
 * More formal and user-friendly than the generic sanitizer
 */
export const sanitizeUserErrorMessage = (error: any): string => {
  const sanitized = sanitizeErrorMessage(error);
  
  // If it's already a generic message, return as is
  if (sanitized.includes('Network service') || sanitized.includes('Please try again in 1 minute')) {
    return sanitized;
  }
  
  // For other errors, make them more formal
  if (sanitized.includes('failed') || sanitized.includes('error')) {
    return 'Operation failed. Please try again in 1 minute.';
  }
  
  return 'An unexpected error occurred. Please try again in 1 minute.';
};

/**
 * Checks if an error message contains Hostkit/Hostaway references
 */
export const containsHostkitHostawayReference = (error: any): boolean => {
  if (!error) return false;
  
  let errorMessage = '';
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error.message) {
    errorMessage = error.message;
  } else if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  }
  
  const lowerMessage = errorMessage.toLowerCase();
  return lowerMessage.includes('hostkit') || lowerMessage.includes('hostaway');
};

