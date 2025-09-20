/**
 * Centralized Error Handling and Logging System for MentalVerse
 * 
 * This module provides comprehensive error handling, logging, and user notification
 * capabilities for authentication, messaging, and other critical operations.
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  MESSAGING = 'messaging',
  NETWORK = 'network',
  CANISTER = 'canister',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  SYSTEM = 'system'
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  canisterId?: string;
  operation?: string;
  conversationId?: string;
  timestamp?: Date;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
}

export interface MentalVerseError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  originalError?: Error;
  context?: ErrorContext;
  timestamp: Date;
  stack?: string;
  userMessage?: string;
  actionable?: boolean;
  retryable?: boolean;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: MentalVerseError[] = [];
  private maxLogSize = 1000;
  private notificationCallback?: (error: MentalVerseError) => void;

  private constructor() {
    // Setup global error handlers
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Set callback for user notifications
   */
  public setNotificationCallback(callback: (error: MentalVerseError) => void): void {
    this.notificationCallback = callback;
  }

  /**
   * Handle and log an error
   */
  public handleError(
    error: Error | string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext,
    userMessage?: string
  ): MentalVerseError {
    const mentalVerseError: MentalVerseError = {
      id: this.generateErrorId(),
      message: typeof error === 'string' ? error : error.message,
      category,
      severity,
      originalError: typeof error === 'string' ? undefined : error,
      context: {
        ...context,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      timestamp: new Date(),
      stack: typeof error === 'string' ? undefined : error.stack,
      userMessage: userMessage || this.generateUserMessage(category, severity),
      actionable: this.isActionable(category, severity),
      retryable: this.isRetryable(category)
    };

    // Log the error
    this.logError(mentalVerseError);

    // Console logging based on severity
    this.consoleLog(mentalVerseError);

    // Notify user if necessary
    if (this.shouldNotifyUser(severity) && this.notificationCallback) {
      this.notificationCallback(mentalVerseError);
    }

    // Send to analytics/monitoring (if configured)
    this.sendToMonitoring(mentalVerseError);

    return mentalVerseError;
  }

  /**
   * Handle authentication errors specifically
   */
  public handleAuthError(
    error: Error | string,
    operation: string,
    context?: Partial<ErrorContext>
  ): MentalVerseError {
    return this.handleError(
      error,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      {
        ...context,
        operation
      },
      'Authentication failed. Please try logging in again.'
    );
  }

  /**
   * Handle messaging errors specifically
   */
  public handleMessagingError(
    error: Error | string,
    operation: string,
    context?: Partial<ErrorContext>
  ): MentalVerseError {
    return this.handleError(
      error,
      ErrorCategory.MESSAGING,
      ErrorSeverity.MEDIUM,
      {
        ...context,
        operation
      },
      'Messaging operation failed. Please try again.'
    );
  }

  /**
   * Handle network errors specifically
   */
  public handleNetworkError(
    error: Error | string,
    operation: string,
    context?: Partial<ErrorContext>
  ): MentalVerseError {
    return this.handleError(
      error,
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      {
        ...context,
        operation
      },
      'Network connection issue. Please check your internet connection and try again.'
    );
  }

  /**
   * Handle canister errors specifically
   */
  public handleCanisterError(
    error: Error | string,
    canisterId: string,
    operation: string,
    context?: Partial<ErrorContext>
  ): MentalVerseError {
    return this.handleError(
      error,
      ErrorCategory.CANISTER,
      ErrorSeverity.HIGH,
      {
        ...context,
        canisterId,
        operation
      },
      'Service temporarily unavailable. Please try again in a moment.'
    );
  }

  /**
   * Get error logs
   */
  public getErrorLogs(category?: ErrorCategory, severity?: ErrorSeverity): MentalVerseError[] {
    let logs = [...this.errorLog];

    if (category) {
      logs = logs.filter(log => log.category === category);
    }

    if (severity) {
      logs = logs.filter(log => log.severity === severity);
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear error logs
   */
  public clearLogs(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    Object.values(ErrorCategory).forEach(category => {
      stats[category] = this.errorLog.filter(log => log.category === category).length;
    });

    Object.values(ErrorSeverity).forEach(severity => {
      stats[`severity_${severity}`] = this.errorLog.filter(log => log.severity === severity).length;
    });

    return stats;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        event.reason,
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        { operation: 'unhandled_promise_rejection' },
        'An unexpected error occurred. The development team has been notified.'
      );
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(
        event.error || event.message,
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        {
          operation: 'global_error',
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        },
        'An unexpected error occurred. Please refresh the page and try again.'
      );
    });
  }

  private logError(error: MentalVerseError): void {
    this.errorLog.push(error);

    // Maintain log size limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Store in localStorage for persistence
    try {
      const recentErrors = this.errorLog.slice(-100); // Keep last 100 errors
      localStorage.setItem('mentalverse_error_log', JSON.stringify(recentErrors));
    } catch (e) {
      console.warn('Could not store error log in localStorage:', e);
    }
  }

  private consoleLog(error: MentalVerseError): void {
    const logData = {
      id: error.id,
      message: error.message,
      category: error.category,
      severity: error.severity,
      context: error.context,
      timestamp: error.timestamp.toISOString()
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error('🚨 MentalVerse Error:', logData);
        if (error.stack) {
          console.error('Stack trace:', error.stack);
        }
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️ MentalVerse Warning:', logData);
        break;
      case ErrorSeverity.LOW:
        console.info('ℹ️ MentalVerse Info:', logData);
        break;
    }
  }

  private generateErrorId(): string {
    return `mv_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUserMessage(category: ErrorCategory, severity: ErrorSeverity): string {
    const messages = {
      [ErrorCategory.AUTHENTICATION]: {
        [ErrorSeverity.LOW]: 'Authentication issue detected.',
        [ErrorSeverity.MEDIUM]: 'Please check your login credentials.',
        [ErrorSeverity.HIGH]: 'Authentication failed. Please try logging in again.',
        [ErrorSeverity.CRITICAL]: 'Critical authentication error. Please contact support.'
      },
      [ErrorCategory.MESSAGING]: {
        [ErrorSeverity.LOW]: 'Minor messaging issue.',
        [ErrorSeverity.MEDIUM]: 'Message could not be sent. Please try again.',
        [ErrorSeverity.HIGH]: 'Messaging service temporarily unavailable.',
        [ErrorSeverity.CRITICAL]: 'Critical messaging error. Please contact support.'
      },
      [ErrorCategory.NETWORK]: {
        [ErrorSeverity.LOW]: 'Minor network issue.',
        [ErrorSeverity.MEDIUM]: 'Network connection issue. Please check your internet.',
        [ErrorSeverity.HIGH]: 'Network error. Please try again later.',
        [ErrorSeverity.CRITICAL]: 'Critical network error. Please contact support.'
      },
      [ErrorCategory.CANISTER]: {
        [ErrorSeverity.LOW]: 'Minor service issue.',
        [ErrorSeverity.MEDIUM]: 'Service temporarily unavailable.',
        [ErrorSeverity.HIGH]: 'Service error. Please try again later.',
        [ErrorSeverity.CRITICAL]: 'Critical service error. Please contact support.'
      },
      [ErrorCategory.VALIDATION]: {
        [ErrorSeverity.LOW]: 'Input validation issue.',
        [ErrorSeverity.MEDIUM]: 'Please check your input and try again.',
        [ErrorSeverity.HIGH]: 'Invalid data provided.',
        [ErrorSeverity.CRITICAL]: 'Critical validation error.'
      },
      [ErrorCategory.PERMISSION]: {
        [ErrorSeverity.LOW]: 'Permission issue detected.',
        [ErrorSeverity.MEDIUM]: 'You do not have permission for this action.',
        [ErrorSeverity.HIGH]: 'Access denied. Please check your permissions.',
        [ErrorSeverity.CRITICAL]: 'Critical permission error. Please contact support.'
      },
      [ErrorCategory.SYSTEM]: {
        [ErrorSeverity.LOW]: 'Minor system issue.',
        [ErrorSeverity.MEDIUM]: 'System error occurred. Please try again.',
        [ErrorSeverity.HIGH]: 'System error. Please refresh and try again.',
        [ErrorSeverity.CRITICAL]: 'Critical system error. Please contact support.'
      }
    };

    return messages[category]?.[severity] || 'An unexpected error occurred.';
  }

  private isActionable(category: ErrorCategory, severity: ErrorSeverity): boolean {
    // Determine if the error requires user action
    return [
      ErrorCategory.AUTHENTICATION,
      ErrorCategory.VALIDATION,
      ErrorCategory.PERMISSION
    ].includes(category) || severity === ErrorSeverity.CRITICAL;
  }

  private isRetryable(category: ErrorCategory): boolean {
    // Determine if the operation can be retried
    return [
      ErrorCategory.NETWORK,
      ErrorCategory.CANISTER,
      ErrorCategory.MESSAGING
    ].includes(category);
  }

  private shouldNotifyUser(severity: ErrorSeverity): boolean {
    // Determine if user should be notified
    return [ErrorSeverity.MEDIUM, ErrorSeverity.HIGH, ErrorSeverity.CRITICAL].includes(severity);
  }

  private sendToMonitoring(error: MentalVerseError): void {
    // Send to external monitoring service (implement as needed)
    // This could be Sentry, LogRocket, or custom analytics
    if ((globalThis as any).PROD && error.severity === ErrorSeverity.CRITICAL) {
      // Example: Send to monitoring service
      console.log('Sending critical error to monitoring service:', error.id);
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleAuthError = (error: Error | string, operation: string, context?: Partial<ErrorContext>) => 
  errorHandler.handleAuthError(error, operation, context);

export const handleMessagingError = (error: Error | string, operation: string, context?: Partial<ErrorContext>) => 
  errorHandler.handleMessagingError(error, operation, context);

export const handleNetworkError = (error: Error | string, operation: string, context?: Partial<ErrorContext>) => 
  errorHandler.handleNetworkError(error, operation, context);

export const handleCanisterError = (error: Error | string, canisterId: string, operation: string, context?: Partial<ErrorContext>) => 
  errorHandler.handleCanisterError(error, canisterId, operation, context);

export const getErrorLogs = (category?: ErrorCategory, severity?: ErrorSeverity) => 
  errorHandler.getErrorLogs(category, severity);

export const getErrorStats = () => errorHandler.getErrorStats();

export const clearErrorLogs = () => errorHandler.clearLogs();

export const setErrorNotificationCallback = (callback: (error: MentalVerseError) => void) => 
  errorHandler.setNotificationCallback(callback);