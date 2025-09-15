import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Stethoscope, ArrowUpRight, CheckCircle } from 'lucide-react';

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

  const handleInputChange = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
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

    if (step === 1) {
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
        throw new Error(registrationResult.message || 'Failed to register user');
      }

      // Store user data locally for immediate use
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
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent ${
                        validationErrors.firstName ? 'border-red-500' : 'border-input'
                      }`}
                      placeholder="Enter first name"
                      required
                    />
                    {validationErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent ${
                        validationErrors.lastName ? 'border-red-500' : 'border-input'
                      }`}
                      placeholder="Enter last name"
                      required
                    />
                    {validationErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent ${
                      validationErrors.email ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="Enter email address"
                    required
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent ${
                      validationErrors.specialization ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="e.g., Clinical Psychology, Psychiatry"
                    required
                  />
                  {validationErrors.specialization && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.specialization}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent ${
                      validationErrors.experience ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="e.g., 5"
                    min="0"
                    required
                  />
                  {validationErrors.experience && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.experience}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    License Number *
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent ${
                      validationErrors.licenseNumber ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="Enter your professional license number"
                    required
                  />
                  {validationErrors.licenseNumber && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.licenseNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
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
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
                    placeholder="Tell us about your professional background and approach to therapy..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && formData.role === 'patient' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent ${
                      validationErrors.age ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="Enter your age"
                    min="13"
                    max="120"
                    required
                  />
                  {validationErrors.age && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.age}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent ${
                      validationErrors.phoneNumber ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                  {validationErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.phoneNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Emergency Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent ${
                      validationErrors.emergencyContact ? 'border-red-500' : 'border-input'
                    }`}
                    placeholder="+1 (555) 987-6543"
                    required
                  />
                  {validationErrors.emergencyContact && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.emergencyContact}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Medical History (Optional)
                  </label>
                  <textarea
                    value={formData.medicalHistory}
                    onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
                    placeholder="Any relevant medical history or conditions..."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Current Medications (Optional)
                  </label>
                  <textarea
                    value={formData.currentMedications}
                    onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
                    placeholder="List any current medications..."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Therapy Goals (Optional)
                  </label>
                  <textarea
                    value={formData.therapyGoals}
                    onChange={(e) => handleInputChange('therapyGoals', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
                    placeholder="What do you hope to achieve through therapy?"
                    rows={2}
                  />
                </div>
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
