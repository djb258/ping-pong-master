/**
 * Centralized Error Handling System
 * 
 * Barton Doctrine: Centralized error handling with clear separation of concerns,
 * consistent error types, and proper error propagation.
 */

import { APP_CONFIG } from './config.js';

/**
 * Base Error Class for Application Errors
 */
export class AppError extends Error {
  constructor(message, code, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * LLM Provider Error
 */
export class LLMError extends AppError {
  constructor(message, provider, details = null) {
    super(message, 'LLM_ERROR', 503, details);
    this.name = 'LLMError';
    this.provider = provider;
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message, field, details = null) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Configuration Error
 */
export class ConfigurationError extends AppError {
  constructor(message, configKey, details = null) {
    super(message, 'CONFIGURATION_ERROR', 500, details);
    this.name = 'ConfigurationError';
    this.configKey = configKey;
  }
}

/**
 * Checklist Error
 */
export class ChecklistError extends AppError {
  constructor(message, altitude, mode, details = null) {
    super(message, 'CHECKLIST_ERROR', 500, details);
    this.name = 'ChecklistError';
    this.altitude = altitude;
    this.mode = mode;
  }
}

/**
 * Drift Detection Error
 */
export class DriftDetectionError extends AppError {
  constructor(message, altitude, details = null) {
    super(message, 'DRIFT_DETECTION_ERROR', 500, details);
    this.name = 'DriftDetectionError';
    this.altitude = altitude;
  }
}

/**
 * Error Handler Class
 */
export class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 1000;
  }

  /**
   * Handle and log an error
   */
  handleError(error, context = {}) {
    // Create standardized error object
    const errorInfo = this.createErrorInfo(error, context);
    
    // Log the error
    this.logError(errorInfo);
    
    // Return appropriate response based on environment
    return this.createErrorResponse(errorInfo);
  }

  /**
   * Create standardized error information
   */
  createErrorInfo(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name || 'UnknownError',
        message: error.message || 'An unknown error occurred',
        stack: APP_CONFIG.debug ? error.stack : undefined,
        code: error.code || 'UNKNOWN_ERROR',
        statusCode: error.statusCode || 500
      },
      context: {
        environment: APP_CONFIG.environment,
        ...context
      }
    };

    // Add specific error details based on error type
    if (error instanceof LLMError) {
      errorInfo.error.provider = error.provider;
    } else if (error instanceof ValidationError) {
      errorInfo.error.field = error.field;
    } else if (error instanceof ConfigurationError) {
      errorInfo.error.configKey = error.configKey;
    } else if (error instanceof ChecklistError) {
      errorInfo.error.altitude = error.altitude;
      errorInfo.error.mode = error.mode;
    } else if (error instanceof DriftDetectionError) {
      errorInfo.error.altitude = error.altitude;
    }

    return errorInfo;
  }

  /**
   * Log error information
   */
  logError(errorInfo) {
    // Add to in-memory log
    this.errorLog.push(errorInfo);
    
    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Console logging based on environment
    if (APP_CONFIG.debug) {
      console.error('🚨 Application Error:', errorInfo);
    } else {
      console.error('🚨 Error:', errorInfo.error.message, errorInfo.error.code);
    }

    // In production, you might want to send to external logging service
    if (APP_CONFIG.environment === 'production') {
      this.sendToLoggingService(errorInfo);
    }
  }

  /**
   * Create error response for API endpoints
   */
  createErrorResponse(errorInfo) {
    const { error } = errorInfo;
    
    // Base response structure
    const response = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        timestamp: errorInfo.timestamp
      }
    };

    // Add details in development
    if (APP_CONFIG.debug) {
      response.error.details = errorInfo;
    }

    // Add specific error information
    if (error.field) {
      response.error.field = error.field;
    }
    
    if (error.provider) {
      response.error.provider = error.provider;
    }

    return {
      statusCode: error.statusCode,
      body: response
    };
  }

  /**
   * Send error to external logging service (placeholder)
   */
  sendToLoggingService(errorInfo) {
    // In a real application, this would send to a service like Sentry, LogRocket, etc.
    // For now, we'll just log to console in production
    console.error('Production Error Log:', JSON.stringify(errorInfo, null, 2));
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      totalErrors: this.errorLog.length,
      errorTypes: {},
      recentErrors: this.errorLog.slice(-10)
    };

    // Count error types
    this.errorLog.forEach(log => {
      const errorType = log.error.code;
      stats.errorTypes[errorType] = (stats.errorTypes[errorType] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }
}

/**
 * Global error handler instance
 */
export const globalErrorHandler = new ErrorHandler();

/**
 * Async error wrapper for API handlers
 */
export function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      const errorResponse = globalErrorHandler.handleError(error, {
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent']
      });

      res.status(errorResponse.statusCode).json(errorResponse.body);
    }
  };
}

/**
 * Error wrapper for React components
 */
export function withComponentErrorHandling(Component) {
  return function ErrorBoundaryWrapper(props) {
    try {
      return <Component {...props} />;
    } catch (error) {
      globalErrorHandler.handleError(error, {
        component: Component.name,
        props: Object.keys(props)
      });

      // Return fallback UI
      return (
        <div style={{ 
          padding: '20px', 
          border: '1px solid #e74c3c', 
          borderRadius: '4px',
          backgroundColor: '#fdf2f2',
          color: '#c53030'
        }}>
          <h3>Something went wrong</h3>
          <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
          {APP_CONFIG.debug && (
            <details style={{ marginTop: '10px' }}>
              <summary>Error Details</summary>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }
  };
}

/**
 * Error wrapper for utility functions
 */
export function withFunctionErrorHandling(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      globalErrorHandler.handleError(error, {
        function: fn.name,
        ...context
      });
      throw error; // Re-throw to allow calling code to handle
    }
  };
}

/**
 * Create user-friendly error messages
 */
export function createUserFriendlyMessage(error) {
  const userMessages = {
    'LLM_ERROR': 'We\'re having trouble connecting to our AI service. Please try again in a moment.',
    'VALIDATION_ERROR': 'Please check your input and try again.',
    'CONFIGURATION_ERROR': 'There\'s a configuration issue. Please contact support.',
    'CHECKLIST_ERROR': 'We\'re having trouble loading the checklist. Please refresh the page.',
    'DRIFT_DETECTION_ERROR': 'We\'re having trouble analyzing your progress. Please continue anyway.',
    'NETWORK_ERROR': 'Please check your internet connection and try again.',
    'TIMEOUT_ERROR': 'The request is taking longer than expected. Please try again.',
    'UNKNOWN_ERROR': 'Something unexpected happened. Please try again.'
  };

  return userMessages[error.code] || userMessages['UNKNOWN_ERROR'];
}

/**
 * Error recovery strategies
 */
export const ErrorRecovery = {
  /**
   * Retry with exponential backoff
   */
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  /**
   * Fallback to alternative provider
   */
  async withProviderFallback(primaryFn, fallbackFn) {
    try {
      return await primaryFn();
    } catch (error) {
      if (error instanceof LLMError) {
        console.log('Primary LLM provider failed, trying fallback...');
        return await fallbackFn();
      }
      throw error;
    }
  },

  /**
   * Graceful degradation
   */
  async withGracefulDegradation(fn, fallbackValue) {
    try {
      return await fn();
    } catch (error) {
      globalErrorHandler.handleError(error, { context: 'graceful_degradation' });
      return fallbackValue;
    }
  }
}; 