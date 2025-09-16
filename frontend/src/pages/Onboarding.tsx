import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Stethoscope, ArrowUpRight, CheckCircle } from 'lucide-react';
import SecureInput from '../components/ui/SecureInput';
import { ValidationResult } from '../utils/inputSecurity';

interface OnboardingFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'patient' | 'therapist' | null;
  phoneNumber?: string;
  specialization?: string;
  experience?: string;
  licenseNumber?: string;
  bio?: string;
  age?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  currentMedications?: string;
  therapyGoals?: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  specialization?: string;
  experience?: string;
  licenseNumber?: string;
  age?: string;
  emergencyContact?: string;
  role?: string; // Added for role validation
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, registerUser } = useAuth();
  const [formData, setFormData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: null,
    specialization: '',
    experience: '',
    phoneNumber: '',
    licenseNumber: '',
    age: '',
    emergencyContact: '',
    medicalHistory: '',
    currentMedications: '',
    therapyGoals: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [fieldValidations, setFieldValidations] = useState<Record<string, ValidationResult>>({});
  const [fieldValidityStates, setFieldValidityStates] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: keyof OnboardingFormData, value: string, isValid: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Track field validity for form submission logic
    setFieldValidityStates(prev => ({ ...prev, [field]: isValid }));
    // Clear validation error when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleValidationChange = (field: keyof OnboardingFormData) => (result: ValidationResult) => {
    setFieldValidations(prev => ({ ...prev, [field]: result }));
  };

  const handleRoleSelect = (role: 'patient' | 'therapist') => {
    setFormData(prev => ({ ...prev, role }));
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/; 
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateAge = (age: string): boolean => {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 13 && ageNum <= 120;
  };

  const validateRequired = (value: string): boolean => {
    return value.trim().length > 0;
  };

  // Change validateStep to return errors, not set state
  const validateStep = (step: number): ValidationErrors => {
    const errors: ValidationErrors = {};
    let stepFields: (keyof OnboardingFormData)[] = [];

    if (step === 1) {
      stepFields = ['firstName', 'lastName', 'email'];
      if (!validateRequired(formData.firstName)) {
        errors.firstName = 'First name is required';
      } else if (formData.firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters';
      }
      if (!validateRequired(formData.lastName)) {
        errors.lastName = 'Last name is required';
      } else if (formData.lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters';
      }
      if (!validateRequired(formData.email)) {
        errors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (step === 2) {
      if (!formData.role) {
        errors.role = 'Role is required';
      }
    }

    if (step === 3 && formData.role === 'therapist') {
      stepFields = ['specialization', 'experience', 'licenseNumber'];
      if (!validateRequired(formData.specialization || '')) {
        errors.specialization = 'Specialization is required';
      }
      if (!validateRequired(formData.experience || '')) {
        errors.experience = 'Years of experience is required';
      } else if (isNaN(parseInt(formData.experience || '0')) || parseInt(formData.experience || '0') < 0) {
        errors.experience = 'Please enter a valid number of years';
      }
      if (!validateRequired(formData.licenseNumber || '')) {
        errors.licenseNumber = 'License number is required';
      } else if ((formData.licenseNumber || '').length < 5) {
        errors.licenseNumber = 'License number must be at least 5 characters';
      }
    }

    if (step === 3 && formData.role === 'patient') {
      stepFields = ['age', 'phoneNumber', 'emergencyContact'];
      if (!validateRequired(formData.age || '')) {
        errors.age = 'Age is required';
      } else if (!validateAge(formData.age || '')) {
        errors.age = 'Please enter a valid age (13-120)';
      }
      if (!validateRequired(formData.phoneNumber || '')) {
        errors.phoneNumber = 'Phone number is required';
      } else if (!validatePhoneNumber(formData.phoneNumber || '')) {
        errors.phoneNumber = 'Please enter a valid phone number';
      }
      if (!validateRequired(formData.emergencyContact || '')) {
        errors.emergencyContact = 'Emergency contact is required';
      } else if (!validatePhoneNumber(formData.emergencyContact || '')) {
        errors.emergencyContact = 'Please enter a valid emergency contact number';
      }
    }

    // Check if all fields in current step are valid using fieldValidations and fieldValidityStates
    for (const field of stepFields) {
      const validation = fieldValidations[field];
      const isFieldValid = fieldValidityStates[field] !== false; // Default to true if not set
      
      if (validation && !validation.isValid) {
        errors[field as keyof ValidationErrors] = validation.errors[0] || `${field} is invalid`;
      } else if (!isFieldValid) {
        errors[field as keyof ValidationErrors] = `${field} validation failed`;
      }
    }

    return errors;
  };

  // Add handleContinue for step navigation
  const handleContinue = () => {
    const errors = validateStep(currentStep);
    setValidationErrors(errors);
    if (Object.keys(errors).length === 0) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateStep(currentStep);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!formData.role || !isAuthenticated) return;
    setIsSubmitting(true);
    
    try {
      // Register user with backend using complete user data
      const registrationResult = await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        userType: formData.role as 'patient' | 'therapist'
      });

      if (!registrationResult.success) {
        // Check if this is an existing user
        if (registrationResult.isExistingUser && registrationResult.userRole) {
          console.log('✅ User already registered, redirecting to dashboard');
          // User is already registered, redirect to their dashboard
          const userRole = registrationResult.userRole;
          localStorage.setItem('userRole', userRole);
          
          // Redirect based on existing user's role
          if (userRole === 'therapist') {
            navigate('/therapist/home');
          } else {
            navigate('/patients/home');
          }
          return;
        }
        throw new Error(registrationResult.message || 'Failed to register user');
      }

      // Store user data locally for immediate use (new user registration)
      localStorage.setItem('userRole', formData.role);
      localStorage.setItem('userProfile', JSON.stringify(formData));
      
      // Redirect based on role
      if (formData.role === 'therapist') {
        navigate('/therapist/home');
      } else {
        navigate('/patients/home');
      }
    } catch (error) {
      console.error('Onboarding failed:', error);
      // Show error message to user
      alert(`Onboarding failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rightSideMessages = [
    {
      icon: <User className="w-6 h-6 text-[#18E614]" />,
      title: "Welcome to MentalVerse",
      description: "Your journey to better mental health starts here. Connect with professionals and peers in a secure, decentralized environment."
    },
    {
      icon: <Stethoscope className="w-6 h-6 text-[#F80D38]" />,
      title: "Professional Care",
      description: "Access licensed therapists, psychiatrists, and mental health professionals from anywhere in the world."
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-[#18E614]" />,
      title: "Privacy First",
      description: "Your data is encrypted and stored on the blockchain, ensuring complete anonymity and security."
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Onboarding Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
            <p className="text-muted-foreground">Tell us about yourself to get started</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step <= currentStep 
                    ? 'bg-[#18E614]' 
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <SecureInput
                    inputType="name"
                    type="text"
                    label="First Name"
                    value={formData.firstName}
                    onChange={(value, isValid) => handleInputChange('firstName', value, isValid)}
                    onValidationChange={handleValidationChange('firstName')}
                    placeholder="Enter first name"
                    required
                    maxLength={50}
                    autoComplete="given-name"
                  />
                  <SecureInput
                    inputType="name"
                    type="text"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(value, isValid) => handleInputChange('lastName', value, isValid)}
                    onValidationChange={handleValidationChange('lastName')}
                    placeholder="Enter last name"
                    required
                    maxLength={50}
                    autoComplete="family-name"
                  />
                </div>
                <SecureInput
                  inputType="email"
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(value, isValid) => handleInputChange('email', value, isValid)}
                  onValidationChange={handleValidationChange('email')}
                  placeholder="Enter email address"
                  required
                  maxLength={100}
                  autoComplete="email"
                />
              </div>
            )}

            {/* Step 2: Role Selection */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-4 text-center">
                    I am registering as a:
                  </label>
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('patient')}
                      className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                        formData.role === 'patient'
                          ? 'border-[#18E614] bg-[#18E614]/10'
                          : 'border-input hover:border-[#18E614]/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <User className={`w-8 h-8 ${formData.role === 'patient' ? 'text-[#18E614]' : 'text-muted-foreground'}`} />
                        <div>
                          <h3 className="font-semibold text-foreground">Patient</h3>
                          <p className="text-sm text-muted-foreground">I need mental health support and care</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('therapist')}
                      className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                        formData.role === 'therapist'
                          ? 'border-[#18E614] bg-[#18E614]/10'
                          : 'border-input hover:border-[#18E614]/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Stethoscope className={`w-8 h-8 ${formData.role === 'therapist' ? 'text-[#18E614]' : 'text-muted-foreground'}`} />
                        <div>
                          <h3 className="font-semibold text-foreground">Therapist</h3>
                          <p className="text-sm text-muted-foreground">I provide mental health therapy services</p>
                        </div>
                      </div>
                    </button>
                  </div>
                  {validationErrors.role && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.role}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Role-specific Information */}
            {currentStep === 3 && formData.role === 'therapist' && (
              <div className="space-y-4">
                <SecureInput
                  inputType="specialization"
                  type="text"
                  label="Specialization"
                  value={formData.specialization || ''}
                  onChange={(value, isValid) => handleInputChange('specialization', value, isValid)}
                  onValidationChange={handleValidationChange('specialization')}
                  placeholder="e.g., Clinical Psychology, Psychiatry"
                  required
                  maxLength={100}
                />
                <SecureInput
                  inputType="age"
                  type="text"
                  label="Years of Experience"
                  value={formData.experience || ''}
                  onChange={(value, isValid) => handleInputChange('experience', value, isValid)}
                  onValidationChange={handleValidationChange('experience')}
                  placeholder="e.g., 5"
                  required
                  maxLength={2}
                />
                <SecureInput
                  inputType="licenseNumber"
                  type="text"
                  label="License Number"
                  value={formData.licenseNumber || ''}
                  onChange={(value, isValid) => handleInputChange('licenseNumber', value, isValid)}
                  onValidationChange={handleValidationChange('licenseNumber')}
                  placeholder="Enter your professional license number"
                  required
                  maxLength={50}
                />
                {validationErrors.licenseNumber && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.licenseNumber}</p>
                )}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value, true)}
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent ${
                      validationErrors.phoneNumber ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {validationErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.phoneNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value, true)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
                    placeholder="Tell us about your professional background and approach to therapy..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && formData.role === 'patient' && (
              <div className="space-y-4">
                <SecureInput
                  inputType="age"
                  type="text"
                  label="Age"
                  value={formData.age || ''}
                  onChange={(value, isValid) => handleInputChange('age', value, isValid)}
                  onValidationChange={handleValidationChange('age')}
                  placeholder="Enter your age (13-120)"
                  required
                  maxLength={3}
                />
                <SecureInput
                  inputType="phone"
                  type="tel"
                  label="Phone Number"
                  value={formData.phoneNumber || ''}
                  onChange={(value, isValid) => handleInputChange('phoneNumber', value, isValid)}
                  onValidationChange={handleValidationChange('phoneNumber')}
                  placeholder="+1 (555) 123-4567"
                  required
                  maxLength={20}
                  autoComplete="tel"
                />
                <SecureInput
                  inputType="phone"
                  type="tel"
                  label="Emergency Contact Number"
                  value={formData.emergencyContact || ''}
                  onChange={(value, isValid) => handleInputChange('emergencyContact', value, isValid)}
                  onValidationChange={handleValidationChange('emergencyContact')}
                  placeholder="+1 (555) 987-6543"
                  required
                  maxLength={20}
                  autoComplete="tel"
                />
                <SecureInput
                  inputType="medicalHistory"
                  type="textarea"
                  label="Medical History (Optional)"
                  value={formData.medicalHistory || ''}
                  onChange={(value, isValid) => handleInputChange('medicalHistory', value, isValid)}
                  onValidationChange={handleValidationChange('medicalHistory')}
                  placeholder="Any relevant medical history or conditions..."
                  maxLength={1000}
                  rows={3}
                />
                <SecureInput
                  inputType="medications"
                  type="textarea"
                  label="Current Medications (Optional)"
                  value={formData.currentMedications || ''}
                  onChange={(value, isValid) => handleInputChange('currentMedications', value, isValid)}
                  onValidationChange={handleValidationChange('currentMedications')}
                  placeholder="List any current medications..."
                  maxLength={1000}
                  rows={3}
                />
                <SecureInput
                  inputType="therapyGoals"
                  type="textarea"
                  label="Therapy Goals (Optional)"
                  value={formData.therapyGoals || ''}
                  onChange={(value, isValid) => handleInputChange('therapyGoals', value, isValid)}
                  onValidationChange={handleValidationChange('therapyGoals')}
                  placeholder="What do you hope to achieve through therapy?"
                  maxLength={1000}
                  rows={3}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-6 py-2 text-foreground hover:text-[#18E614] transition-colors"
                >
                  Back
                </button>
              )}
              
              <div className="ml-auto">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="px-6 py-2 bg-[#18E614] text-white rounded-lg hover:bg-[#18E614]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <span>Continue</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#18E614] text-white rounded-lg hover:bg-[#18E614]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Setting up...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Setup</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Messages (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#18E614]/10 via-[#F80D38]/5 to-[#18E614]/10 items-center justify-center p-8">
        <div className="max-w-md space-y-8">
          {rightSideMessages.map((message, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {message.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {message.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {message.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
