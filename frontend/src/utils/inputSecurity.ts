/**
 * Input Security Utilities for MentalVerse
 * Provides comprehensive input validation and sanitization for frontend forms
 * Prevents XSS, injection attacks, and ensures data integrity
 */

import DOMPurify from 'dompurify';

// Security configuration
const SECURITY_CONFIG = {
  MAX_TEXT_LENGTH: 10000,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
  MAX_PHONE_LENGTH: 20,
  MAX_MESSAGE_LENGTH: 5000,
  MAX_NOTES_LENGTH: 10000,
  ALLOWED_HTML_TAGS: [], // No HTML allowed in user inputs
  BLOCKED_PATTERNS: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
    /\$\{.*?\}/g, // Template literals
    /\{\{.*?\}\}/g, // Handlebars/Angular expressions
  ],
};

// Input types for validation
export type InputType = 
  | 'name'
  | 'email'
  | 'phone'
  | 'message'
  | 'chatMessage'
  | 'notes'
  | 'medicalHistory'
  | 'medications'
  | 'therapyGoals'
  | 'bio'
  | 'specialization'
  | 'licenseNumber'
  | 'emergencyContact'
  | 'age'
  | 'general';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
  warnings: string[];
}

/**
 * Sanitizes input by removing potentially dangerous content
 * @param input - Raw input string
 * @param allowBasicFormatting - Whether to allow basic formatting (bold, italic)
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, allowBasicFormatting = false): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove blocked patterns
  SECURITY_CONFIG.BLOCKED_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Use DOMPurify for HTML sanitization
  const purifyConfig = {
    ALLOWED_TAGS: allowBasicFormatting ? ['b', 'i', 'em', 'strong'] : [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  };

  sanitized = DOMPurify.sanitize(sanitized, purifyConfig);

  // Additional sanitization
  sanitized = sanitized
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .trim();

  return sanitized;
}

/**
 * Validates input based on type and security requirements
 * @param input - Input value to validate
 * @param type - Type of input for specific validation rules
 * @param required - Whether the field is required
 * @returns ValidationResult object
 */
export function validateInput(
  input: string,
  type: InputType,
  required = false
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    sanitizedValue: '',
    errors: [],
    warnings: [],
  };

  // Handle empty input
  if (!input || input.trim() === '') {
    if (required) {
      result.isValid = false;
      result.errors.push('This field is required');
    }
    result.sanitizedValue = '';
    return result;
  }

  // Sanitize input
  const allowFormatting = ['bio', 'medicalHistory', 'notes', 'therapyGoals'].includes(type);
  result.sanitizedValue = sanitizeInput(input, allowFormatting);

  // Check if sanitization removed content
  if (result.sanitizedValue !== input.trim()) {
    result.warnings.push('Some potentially unsafe content was removed');
  }

  // Type-specific validation
  switch (type) {
    case 'name':
      result.isValid = validateName(result.sanitizedValue, result.errors);
      break;
    case 'email':
      result.isValid = validateEmail(result.sanitizedValue, result.errors);
      break;
    case 'phone':
    case 'emergencyContact':
      result.isValid = validatePhone(result.sanitizedValue, result.errors);
      break;
    case 'age':
      result.isValid = validateAge(result.sanitizedValue, result.errors);
      break;
    case 'licenseNumber':
      result.isValid = validateLicenseNumber(result.sanitizedValue, result.errors);
      break;
    case 'message':
    case 'chatMessage':
      result.isValid = validateMessage(result.sanitizedValue, result.errors);
      break;
    case 'notes':
    case 'medicalHistory':
    case 'medications':
    case 'therapyGoals':
    case 'bio':
    case 'specialization':
      result.isValid = validateLongText(result.sanitizedValue, result.errors, type);
      break;
    case 'general':
    default:
      result.isValid = validateGeneral(result.sanitizedValue, result.errors);
      break;
  }

  return result;
}

/**
 * Validates name fields
 */
function validateName(value: string, errors: string[]): boolean {
  if (value.length > SECURITY_CONFIG.MAX_NAME_LENGTH) {
    errors.push(`Name must be less than ${SECURITY_CONFIG.MAX_NAME_LENGTH} characters`);
    return false;
  }

  if (!/^[a-zA-Z\s\-'.,]+$/.test(value)) {
    errors.push('Name contains invalid characters');
    return false;
  }

  if (value.length < 1) {
    errors.push('Name is too short');
    return false;
  }

  return true;
}

/**
 * Validates email addresses
 */
function validateEmail(value: string, errors: string[]): boolean {
  if (value.length > SECURITY_CONFIG.MAX_EMAIL_LENGTH) {
    errors.push(`Email must be less than ${SECURITY_CONFIG.MAX_EMAIL_LENGTH} characters`);
    return false;
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(value)) {
    errors.push('Please enter a valid email address');
    return false;
  }

  return true;
}

/**
 * Validates phone numbers
 */
function validatePhone(value: string, errors: string[]): boolean {
  if (value.length > SECURITY_CONFIG.MAX_PHONE_LENGTH) {
    errors.push(`Phone number must be less than ${SECURITY_CONFIG.MAX_PHONE_LENGTH} characters`);
    return false;
  }

  // Remove common phone formatting characters for validation
  const cleanPhone = value.replace(/[\s\-\(\)\+\.]/g, '');
  
  if (!/^\d{7,15}$/.test(cleanPhone)) {
    errors.push('Please enter a valid phone number');
    return false;
  }

  return true;
}

/**
 * Validates age input
 */
function validateAge(value: string, errors: string[]): boolean {
  const age = parseInt(value, 10);
  
  if (isNaN(age) || age < 13 || age > 120) {
    errors.push('Please enter a valid age between 13 and 120');
    return false;
  }

  return true;
}

/**
 * Validates license numbers
 */
function validateLicenseNumber(value: string, errors: string[]): boolean {
  if (value.length < 3 || value.length > 50) {
    errors.push('License number must be between 3 and 50 characters');
    return false;
  }

  if (!/^[a-zA-Z0-9\-\.\s]+$/.test(value)) {
    errors.push('License number contains invalid characters');
    return false;
  }

  return true;
}

/**
 * Validates chat messages
 */
function validateMessage(value: string, errors: string[]): boolean {
  if (value.length > SECURITY_CONFIG.MAX_MESSAGE_LENGTH) {
    errors.push(`Message must be less than ${SECURITY_CONFIG.MAX_MESSAGE_LENGTH} characters`);
    return false;
  }

  if (value.length < 1) {
    errors.push('Message cannot be empty');
    return false;
  }

  return true;
}

/**
 * Validates long text fields (notes, medical history, etc.)
 */
function validateLongText(value: string, errors: string[], type: InputType): boolean {
  const maxLength = type === 'notes' || type === 'medicalHistory' 
    ? SECURITY_CONFIG.MAX_NOTES_LENGTH 
    : SECURITY_CONFIG.MAX_TEXT_LENGTH;

  if (value.length > maxLength) {
    errors.push(`Text must be less than ${maxLength} characters`);
    return false;
  }

  return true;
}

/**
 * Validates general text input
 */
function validateGeneral(value: string, errors: string[]): boolean {
  if (value.length > SECURITY_CONFIG.MAX_TEXT_LENGTH) {
    errors.push(`Input must be less than ${SECURITY_CONFIG.MAX_TEXT_LENGTH} characters`);
    return false;
  }

  return true;
}

/**
 * Validates multiple inputs at once
 * @param inputs - Object with field names as keys and input values
 * @param schema - Validation schema defining rules for each field
 * @returns Object with validation results for each field
 */
export function validateForm(
  inputs: Record<string, string>,
  schema: Record<string, { type: InputType; required?: boolean }>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  Object.entries(schema).forEach(([fieldName, rules]) => {
    const value = inputs[fieldName] || '';
    results[fieldName] = validateInput(value, rules.type, rules.required);
  });

  return results;
}

/**
 * Checks if form validation results are all valid
 * @param results - Validation results from validateForm
 * @returns True if all fields are valid
 */
export function isFormValid(results: Record<string, ValidationResult>): boolean {
  return Object.values(results).every(result => result.isValid);
}

/**
 * Gets all error messages from form validation results
 * @param results - Validation results from validateForm
 * @returns Array of error messages
 */
export function getFormErrors(results: Record<string, ValidationResult>): string[] {
  const errors: string[] = [];
  
  Object.entries(results).forEach(([fieldName, result]) => {
    if (!result.isValid) {
      result.errors.forEach(error => {
        errors.push(`${fieldName}: ${error}`);
      });
    }
  });

  return errors;
}

/**
 * Rate limiting for input validation (prevents spam)
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts = 100;
  private readonly windowMs = 60000; // 1 minute

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }
}

export const inputRateLimiter = new RateLimiter();

/**
 * Security audit logging for suspicious input patterns
 */
export function auditSuspiciousInput(input: string, fieldType: InputType, userId?: string): void {
  const suspiciousPatterns = [
    /script/gi,
    /javascript/gi,
    /eval\(/gi,
    /document\./gi,
    /window\./gi,
    /<.*>/gi,
    /\$\{.*\}/gi,
  ];

  const foundPatterns = suspiciousPatterns.filter(pattern => pattern.test(input));
  
  if (foundPatterns.length > 0) {
    console.warn('Suspicious input detected:', {
      userId: userId || 'anonymous',
      fieldType,
      patterns: foundPatterns.map(p => p.source),
      timestamp: new Date().toISOString(),
      input: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
    });
    
    // In production, this should be sent to a security monitoring service
    // Example: securityMonitor.logSuspiciousActivity({...})
  }
}