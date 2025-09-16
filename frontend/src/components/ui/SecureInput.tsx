/**
 * Secure Input Component for MentalVerse
 * Provides input validation, sanitization, and security features
 * Used across all forms to ensure consistent security standards
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { 
  validateInput, 
  InputType, 
  ValidationResult, 
  auditSuspiciousInput, 
  inputRateLimiter 
} from '../../utils/inputSecurity';
import { useAuth } from '../../contexts/AuthContext';

interface SecureInputProps {
  id?: string;
  name?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'textarea';
  inputType: InputType;
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  onValidationChange?: (result: ValidationResult) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  showValidation?: boolean;
  maxLength?: number;
  rows?: number; // For textarea
  autoComplete?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const SecureInput: React.FC<SecureInputProps> = ({
  id,
  name,
  type = 'text',
  inputType,
  value,
  onChange,
  onValidationChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  label,
  showValidation = true,
  maxLength,
  rows = 3,
  autoComplete,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    sanitizedValue: '',
    errors: [],
    warnings: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [lastValidationTime, setLastValidationTime] = useState(0);
  const { user } = useAuth();

  // Debounced validation
  const validateWithDebounce = useCallback(
    (inputValue: string) => {
      const now = Date.now();
      
      // Rate limiting check
      const userId = user?.toString() || 'anonymous';
      if (!inputRateLimiter.isAllowed(userId)) {
        console.warn('Rate limit exceeded for input validation');
        return;
      }

      // Debounce validation (300ms)
      if (now - lastValidationTime < 300) {
        return;
      }

      setLastValidationTime(now);

      // Perform validation
      const result = validateInput(inputValue, inputType, required);
      setValidationResult(result);
      
      // Audit suspicious input
      if (inputValue.trim()) {
        auditSuspiciousInput(inputValue, inputType, userId);
      }

      // Notify parent components
      onChange(result.sanitizedValue, result.isValid);
      onValidationChange?.(result);
    },
    [inputType, required, onChange, onValidationChange, user, lastValidationTime]
  );

  // Validate on value change
  useEffect(() => {
    if (value !== undefined) {
      validateWithDebounce(value);
    }
  }, [value, validateWithDebounce]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Apply maxLength if specified
    if (maxLength && newValue.length > maxLength) {
      return;
    }

    validateWithDebounce(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Final validation on blur
    if (value) {
      validateWithDebounce(value);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine input styling based on validation state
  const getInputStyling = () => {
    const baseClasses = `
      w-full px-3 py-2 border rounded-lg bg-background text-foreground 
      focus:outline-none focus:ring-2 focus:border-transparent 
      transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
      ${isFocused ? 'ring-2' : ''}
    `;

    let borderClasses = 'border-input';
    let focusClasses = 'focus:ring-[#18E614]/50 focus:border-[#18E614]';

    if (showValidation && value) {
      if (!validationResult.isValid) {
        borderClasses = 'border-red-500';
        focusClasses = 'focus:ring-red-500/50 focus:border-red-500';
      } else if (validationResult.warnings.length > 0) {
        borderClasses = 'border-yellow-500';
        focusClasses = 'focus:ring-yellow-500/50 focus:border-yellow-500';
      } else {
        borderClasses = 'border-green-500';
        focusClasses = 'focus:ring-green-500/50 focus:border-green-500';
      }
    }

    return `${baseClasses} ${borderClasses} ${focusClasses} ${className}`;
  };

  // Generate unique IDs for accessibility
  const inputId = id || `secure-input-${name || inputType}`;
  const errorId = `${inputId}-error`;
  const warningId = `${inputId}-warning`;
  const helpId = `${inputId}-help`;

  // Build aria-describedby
  const ariaDescribedByIds = [];
  if (ariaDescribedBy) ariaDescribedByIds.push(ariaDescribedBy);
  if (showValidation && validationResult.errors.length > 0) ariaDescribedByIds.push(errorId);
  if (showValidation && validationResult.warnings.length > 0) ariaDescribedByIds.push(warningId);
  if (label) ariaDescribedByIds.push(helpId);

  const commonProps = {
    id: inputId,
    name: name || inputType,
    value: value,
    onChange: handleInputChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    placeholder: placeholder,
    required: required,
    disabled: disabled,
    className: getInputStyling(),
    maxLength: maxLength,
    autoComplete: autoComplete,
    'aria-label': ariaLabel || label,
    'aria-describedby': ariaDescribedByIds.length > 0 ? ariaDescribedByIds.join(' ') : undefined,
    'aria-invalid': showValidation && !validationResult.isValid,
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Input Field */}
        {type === 'textarea' ? (
          <textarea
            {...commonProps}
            rows={rows}
            style={{ resize: 'vertical', minHeight: `${rows * 1.5}rem` }}
          />
        ) : (
          <input
            {...commonProps}
            type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          />
        )}

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {/* Validation Icon */}
        {showValidation && value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {!validationResult.isValid ? (
              <AlertTriangle size={16} className="text-red-500" aria-hidden="true" />
            ) : validationResult.warnings.length > 0 ? (
              <Info size={16} className="text-yellow-500" aria-hidden="true" />
            ) : (
              <CheckCircle size={16} className="text-green-500" aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      {/* Character Count */}
      {maxLength && (
        <div className="text-xs text-muted-foreground text-right">
          {value.length}/{maxLength}
        </div>
      )}

      {/* Validation Messages */}
      {showValidation && (
        <div className="space-y-1">
          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div id={errorId} className="space-y-1" role="alert">
              {validationResult.errors.map((error, index) => (
                <p key={index} className="text-red-500 text-xs flex items-center gap-1">
                  <AlertTriangle size={12} aria-hidden="true" />
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div id={warningId} className="space-y-1">
              {validationResult.warnings.map((warning, index) => (
                <p key={index} className="text-yellow-600 text-xs flex items-center gap-1">
                  <Info size={12} aria-hidden="true" />
                  {warning}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {label && (
        <div id={helpId} className="sr-only">
          {`Enter your ${label.toLowerCase()}${required ? ' (required)' : ''}`}
        </div>
      )}
    </div>
  );
};

export default SecureInput;

// Export validation hook for advanced use cases
export const useInputValidation = (inputType: InputType, required = false) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    sanitizedValue: '',
    errors: [],
    warnings: [],
  });

  const validate = useCallback(
    (value: string) => {
      const result = validateInput(value, inputType, required);
      setValidationResult(result);
      return result;
    },
    [inputType, required]
  );

  return { validationResult, validate };
};