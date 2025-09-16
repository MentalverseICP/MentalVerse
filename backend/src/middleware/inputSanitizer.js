import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';

/**
 * Comprehensive Input Sanitization and Validation Middleware
 * Prevents XSS, SQL/NoSQL injection, command injection, and other security threats
 */

// Security configuration
const SECURITY_CONFIG = {
  // Maximum lengths for different input types
  MAX_LENGTHS: {
    message: 2000,
    name: 100,
    email: 254,
    phone: 20,
    sessionId: 50,
    principal: 100,
    medicalHistory: 5000,
    notes: 3000,
    specialization: 200,
    licenseNumber: 50
  },
  
  // Allowed HTML tags for rich text (very restrictive)
  ALLOWED_HTML_TAGS: ['p', 'br', 'strong', 'em', 'u'],
  
  // Patterns for different input types
  PATTERNS: {
    alphanumeric: /^[a-zA-Z0-9\s\-_.,!?]+$/,
    name: /^[a-zA-Z\s\-'.,]+$/,
    phone: /^[\+]?[1-9]?[0-9]{7,15}$/,
    sessionId: /^[a-zA-Z0-9\-_]+$/,
    principal: /^[a-zA-Z0-9\-_]+$/,
    licenseNumber: /^[a-zA-Z0-9\-_]+$/
  },
  
  // Suspicious patterns to detect potential attacks
  SUSPICIOUS_PATTERNS: [
    // XSS patterns
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    
    // SQL injection patterns
    /('|(\-\-)|(;)|(\||\|)|(\*|\*))/gi,
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)/gi,
    
    // NoSQL injection patterns
    /\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$regex/gi,
    
    // Command injection patterns (excluding JSON syntax)
    /(\||&|;|\$|`)/gi,
    /(rm|ls|cat|grep|wget|curl|nc|netcat|bash|sh|cmd|powershell)/gi,
    
    // Path traversal
    /\.\.\//gi,
    /\.\.\\\\|/gi
  ]
};

/**
 * Core sanitization functions
 */
class InputSanitizer {
  /**
   * Sanitize text input to prevent XSS and injection attacks
   */
  static sanitizeText(input, options = {}) {
    if (typeof input !== 'string') {
      return '';
    }
    
    const {
      maxLength = SECURITY_CONFIG.MAX_LENGTHS.message,
      allowHtml = false,
      pattern = null,
      strict = false
    } = options;
    
    // Trim and limit length
    let sanitized = input.trim().substring(0, maxLength);
    
    // Remove or escape HTML based on allowHtml flag
    if (allowHtml) {
      // Use DOMPurify for safe HTML sanitization
      sanitized = DOMPurify.sanitize(sanitized, {
        ALLOWED_TAGS: SECURITY_CONFIG.ALLOWED_HTML_TAGS,
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
      });
    } else {
      // Escape all HTML entities
      sanitized = validator.escape(sanitized);
    }
    
    // Apply pattern validation if provided
    if (pattern && !pattern.test(sanitized)) {
      if (strict) {
        throw new Error('Input contains invalid characters');
      }
      // Remove invalid characters
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.,!?]/g, '');
    }
    
    return sanitized;
  }
  
  /**
   * Sanitize email input
   */
  static sanitizeEmail(email) {
    if (typeof email !== 'string') {
      return '';
    }
    
    const sanitized = email.trim().toLowerCase().substring(0, SECURITY_CONFIG.MAX_LENGTHS.email);
    return validator.isEmail(sanitized) ? validator.normalizeEmail(sanitized) : '';
  }
  
  /**
   * Sanitize phone number
   */
  static sanitizePhone(phone) {
    if (typeof phone !== 'string') {
      return '';
    }
    
    // Remove all non-numeric characters except + and -
    const sanitized = phone.replace(/[^0-9+\-]/g, '').substring(0, SECURITY_CONFIG.MAX_LENGTHS.phone);
    return SECURITY_CONFIG.PATTERNS.phone.test(sanitized) ? sanitized : '';
  }
  
  /**
   * Sanitize name input (first name, last name, etc.)
   */
  static sanitizeName(name) {
    if (typeof name !== 'string') {
      return '';
    }
    
    return this.sanitizeText(name, {
      maxLength: SECURITY_CONFIG.MAX_LENGTHS.name,
      pattern: SECURITY_CONFIG.PATTERNS.name,
      strict: false
    });
  }
  
  /**
   * Sanitize session ID or principal ID
   */
  static sanitizeId(id, type = 'sessionId') {
    if (typeof id !== 'string') {
      return '';
    }
    
    const maxLength = SECURITY_CONFIG.MAX_LENGTHS[type] || SECURITY_CONFIG.MAX_LENGTHS.sessionId;
    const pattern = SECURITY_CONFIG.PATTERNS[type] || SECURITY_CONFIG.PATTERNS.sessionId;
    
    return this.sanitizeText(id, {
      maxLength,
      pattern,
      strict: true
    });
  }
  
  /**
   * Detect suspicious input patterns
   */
  static detectSuspiciousInput(input) {
    if (typeof input !== 'string') {
      return { isSuspicious: false, patterns: [] };
    }
    
    const detectedPatterns = [];
    
    for (const pattern of SECURITY_CONFIG.SUSPICIOUS_PATTERNS) {
      if (pattern.test(input)) {
        detectedPatterns.push(pattern.source);
      }
    }
    
    return {
      isSuspicious: detectedPatterns.length > 0,
      patterns: detectedPatterns,
      severity: detectedPatterns.length > 2 ? 'high' : detectedPatterns.length > 0 ? 'medium' : 'low'
    };
  }
  
  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj, schema = {}) {
    if (!obj || typeof obj !== 'object') {
      return {};
    }
    
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const fieldSchema = schema[key] || { type: 'text' };
      
      // Skip optional fields that are not provided or are empty
      if (fieldSchema.optional && (value === undefined || value === null || value === '')) {
        continue;
      }
      
      switch (fieldSchema.type) {
        case 'email':
          sanitized[key] = this.sanitizeEmail(value);
          break;
        case 'phone':
          sanitized[key] = this.sanitizePhone(value);
          break;
        case 'name':
          sanitized[key] = this.sanitizeName(value);
          break;
        case 'id':
          sanitized[key] = this.sanitizeId(value, fieldSchema.idType);
          break;
        case 'text':
        default:
          sanitized[key] = this.sanitizeText(value, fieldSchema.options || {});
          break;
      }
    }
    
    return sanitized;
  }
}

/**
 * Express middleware for input sanitization
 */
const sanitizeMiddleware = (schema = {}) => {
  return (req, res, next) => {
    try {
      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = InputSanitizer.sanitizeObject(req.body, schema.body || {});
        
        // Check for suspicious patterns in body
        const bodyString = JSON.stringify(req.body);
        const suspiciousCheck = InputSanitizer.detectSuspiciousInput(bodyString);
        
        if (suspiciousCheck.isSuspicious && suspiciousCheck.severity === 'high') {
          console.warn('Suspicious input detected:', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            patterns: suspiciousCheck.patterns,
            body: req.body
          });
          
          return res.status(400).json({
            error: 'Invalid input detected',
            message: 'Your input contains potentially harmful content'
          });
        }
      }
      
      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = InputSanitizer.sanitizeObject(req.query, schema.query || {});
      }
      
      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        req.params = InputSanitizer.sanitizeObject(req.params, schema.params || {});
      }
      
      next();
    } catch (error) {
      console.error('Input sanitization error:', error);
      res.status(400).json({
        error: 'Input validation failed',
        message: 'Invalid input format'
      });
    }
  };
};

/**
 * Validation schemas for different endpoints
 */
const VALIDATION_SCHEMAS = {
  // Chat message validation
  chatMessage: {
    body: {
      messages: { type: 'array' },
      sessionId: { type: 'id', idType: 'sessionId' }
    }
  },
  
  // User registration/onboarding validation
  userRegistration: {
    body: {
      firstName: { type: 'name' },
      lastName: { type: 'name' },
      email: { type: 'email' },
      phone: { type: 'phone' },
      role: { type: 'text', options: { pattern: /^(patient|therapist|admin)$/, strict: true } },
      specialization: { type: 'text', options: { maxLength: SECURITY_CONFIG.MAX_LENGTHS.specialization } },
      experience: { type: 'text', options: { pattern: /^[0-9]+$/, maxLength: 2 } },
      licenseNumber: { type: 'id', idType: 'licenseNumber' },
      medicalHistory: { type: 'text', options: { maxLength: SECURITY_CONFIG.MAX_LENGTHS.medicalHistory } },
      currentMedications: { type: 'text', options: { maxLength: SECURITY_CONFIG.MAX_LENGTHS.notes } },
      therapyGoals: { type: 'text', options: { maxLength: SECURITY_CONFIG.MAX_LENGTHS.notes } }
    }
  },
  
  // Appointment/session validation
  appointment: {
    body: {
      patientId: { type: 'id', idType: 'principal' },
      therapistId: { type: 'id', idType: 'principal' },
      notes: { type: 'text', options: { maxLength: SECURITY_CONFIG.MAX_LENGTHS.notes } },
      sessionType: { type: 'text', options: { pattern: /^(individual|group|family)$/, strict: true } }
    }
  },
  
  // Log interaction validation
  logInteraction: {
    body: {
      message: { type: 'text', options: { maxLength: SECURITY_CONFIG.MAX_LENGTHS.message } },
      emotionalTone: { type: 'text', options: { pattern: /^[a-zA-Z]+$/ } },
      sessionId: { type: 'id', idType: 'sessionId' }
    }
  }
};

/**
 * Express-validator rules for additional validation
 */
const createValidationRules = (schemaName) => {
  const schema = VALIDATION_SCHEMAS[schemaName];
  if (!schema) {
    return [];
  }
  
  const rules = [];
  
  // Create validation rules for body fields
  if (schema.body) {
    for (const [field, config] of Object.entries(schema.body)) {
      let rule = body(field);
      
      // Skip validation for optional fields when not provided
      if (config.optional) {
        rule = rule.optional();
      }
      
      switch (config.type) {
        case 'email':
          rule = rule.isEmail().withMessage(`${field} must be a valid email`);
          break;
        case 'phone':
          rule = rule.matches(SECURITY_CONFIG.PATTERNS.phone).withMessage(`${field} must be a valid phone number`);
          break;
        case 'name':
          rule = rule.matches(SECURITY_CONFIG.PATTERNS.name).withMessage(`${field} contains invalid characters`);
          break;
        case 'id':
          const pattern = SECURITY_CONFIG.PATTERNS[config.idType] || SECURITY_CONFIG.PATTERNS.sessionId;
          rule = rule.matches(pattern).withMessage(`${field} contains invalid characters`);
          break;
        case 'array':
          rule = rule.isArray().withMessage(`${field} must be an array`);
          break;
        case 'text':
        default:
          rule = rule.isString().withMessage(`${field} must be a string`);
          if (config.options?.maxLength) {
            rule = rule.isLength({ max: config.options.maxLength }).withMessage(`${field} is too long`);
          }
          if (config.options?.pattern) {
            rule = rule.matches(config.options.pattern).withMessage(`${field} contains invalid characters`);
          }
          break;
      }
      
      rules.push(rule);
    }
  }
  
  return rules;
};

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('Validation errors:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      errors: errors.array(),
      body: req.body
    });
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Rate limiting for suspicious activity
 */
const suspiciousActivityLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 suspicious requests per windowMs
  message: {
    error: 'Too many suspicious requests detected',
    message: 'Your IP has been temporarily blocked due to suspicious activity'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for non-suspicious requests
    const bodyString = JSON.stringify(req.body || {});
    const suspiciousCheck = InputSanitizer.detectSuspiciousInput(bodyString);
    return !suspiciousCheck.isSuspicious;
  }
});

export {
  InputSanitizer,
  sanitizeMiddleware,
  VALIDATION_SCHEMAS,
  createValidationRules,
  handleValidationErrors,
  suspiciousActivityLimiter,
  SECURITY_CONFIG
};