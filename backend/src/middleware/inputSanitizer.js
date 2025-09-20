// Input sanitization middleware - Now handled by smart contract
import { icAgent } from '../ic-integration/icAgent.js';

// Legacy security configuration - kept for reference
const MAX_LENGTHS = {
  username: 50,
  email: 254,
  password: 128,
  message: 10000,
  sessionNote: 5000,
  feedback: 2000
};

const ALLOWED_HTML_TAGS = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'];
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_-]{3,30}$/,
  phone: /^\+?[1-9]\d{1,14}$/
};

const SUSPICIOUS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /\b(eval|setTimeout|setInterval)\s*\(/gi
];

/**
 * Input Sanitizer Class - Now proxies to smart contract
 * Smart contract handles all input validation and sanitization
 */
class InputSanitizer {
  /**
   * Sanitize text input - proxied to smart contract
   */
  static async sanitizeText(text, options = {}) {
    console.warn('InputSanitizer: Text sanitization now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('sanitizeInput', {
        input: text,
        type: 'text',
        options
      });
      return result.sanitized || text;
    } catch (error) {
      console.error('Smart contract sanitization failed:', error);
      // Fallback: basic sanitization
      return text ? text.toString().trim() : '';
    }
  }

  /**
   * Sanitize HTML input - proxied to smart contract
   */
  static async sanitizeHTML(html, allowedTags = ALLOWED_HTML_TAGS) {
    console.warn('InputSanitizer: HTML sanitization now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('sanitizeInput', {
        input: html,
        type: 'html',
        allowedTags
      });
      return result.sanitized || html;
    } catch (error) {
      console.error('Smart contract HTML sanitization failed:', error);
      // Fallback: strip all HTML
      return html ? html.toString().replace(/<[^>]*>/g, '') : '';
    }
  }

  /**
   * Validate email format - proxied to smart contract
   */
  static async validateEmail(email) {
    console.warn('InputSanitizer: Email validation now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('validateInput', {
        input: email,
        type: 'email'
      });
      return result.isValid || false;
    } catch (error) {
      console.error('Smart contract email validation failed:', error);
      // Fallback: basic regex check
      return PATTERNS.email.test(email);
    }
  }

  /**
   * Check for suspicious patterns - proxied to smart contract
   */
  static async detectSuspiciousContent(input) {
    console.warn('InputSanitizer: Suspicious content detection now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('detectThreats', {
        input,
        type: 'suspicious_patterns'
      });
      return result.threats || [];
    } catch (error) {
      console.error('Smart contract threat detection failed:', error);
      // Fallback: basic pattern matching
      const threats = [];
      SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
        if (pattern.test(input)) {
          threats.push({ type: 'suspicious_pattern', index });
        }
      });
      return threats;
    }
  }

  /**
   * Validate input length - proxied to smart contract
   */
  static async validateLength(input, type) {
    console.warn('InputSanitizer: Length validation now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('validateInput', {
        input,
        type: 'length',
        fieldType: type
      });
      return result.isValid || false;
    } catch (error) {
      console.error('Smart contract length validation failed:', error);
      // Fallback: check against local limits
      const maxLength = MAX_LENGTHS[type] || 1000;
      return input ? input.length <= maxLength : true;
    }
  }
}

/**
 * Middleware factory for input sanitization - now proxies to smart contract
 */
const sanitizeMiddleware = (schema = {}) => {
  return async (req, res, next) => {
    console.warn('sanitizeInput middleware: Input sanitization now handled by smart contract');
    
    try {
      // Proxy entire request body to smart contract for sanitization
      const result = await icAgent.callCanisterMethod('sanitizeRequest', {
        body: req.body,
        params: req.params,
        query: req.query,
        schema
      });
      
      if (result.sanitized) {
        req.body = result.sanitized.body || req.body;
        req.params = result.sanitized.params || req.params;
        req.query = result.sanitized.query || req.query;
      }
      
      next();
    } catch (error) {
      console.error('Smart contract request sanitization failed:', error);
      // Continue without sanitization in case of error
      next();
    }
  };
};

/**
 * Middleware for input validation - now proxies to smart contract
 */
const validateInput = (schema) => {
  return async (req, res, next) => {
    console.warn('validateInput middleware: Input validation now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('validateRequest', {
        body: req.body,
        params: req.params,
        query: req.query,
        schema
      });
      
      if (!result.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: result.errors || ['Invalid input']
        });
      }
      
      next();
    } catch (error) {
      console.error('Smart contract validation failed:', error);
      // Continue without validation in case of error
      next();
    }
  };
};

/**
 * Rate limiting middleware - now handled by smart contract
 */
const rateLimiter = (options = {}) => {
  return async (req, res, next) => {
    console.warn('rateLimiter middleware: Rate limiting now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('checkRateLimit', {
        identifier: req.ip || req.user?.id,
        endpoint: req.path,
        options
      });
      
      if (!result.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: result.retryAfter || 60
        });
      }
      
      next();
    } catch (error) {
      console.error('Smart contract rate limiting failed:', error);
      // Continue without rate limiting in case of error
      next();
    }
  };
};

export {
  InputSanitizer,
  sanitizeMiddleware,
  validateInput as createValidationRules,
  rateLimiter as suspiciousActivityLimiter,
  MAX_LENGTHS,
  ALLOWED_HTML_TAGS,
  PATTERNS,
  SUSPICIOUS_PATTERNS
};

export const SECURITY_CONFIG = {
  MAX_LENGTHS,
  ALLOWED_HTML_TAGS,
  PATTERNS,
  SUSPICIOUS_PATTERNS
};

export const handleValidationErrors = (req, res, next) => {
  // Basic validation error handler
  next();
};