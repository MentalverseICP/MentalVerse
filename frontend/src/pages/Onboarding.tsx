import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../App';
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
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { registerUser } = useAuth();
  const [formData, setFormData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: null,
    specialization: '',
    experience: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleSelect = (role: 'patient' | 'therapist') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role || !user?.authenticated) return;

    setIsSubmitting(true);
    
    // try {
    //   // Register user with backend using proper role mapping
    //   const backendRole = formData.role === 'therapist' ? 'doctor' : 'patient';
    //   const registrationResult = await registerUser(backendRole as 'patient' | 'doctor');

    //   if (!registrationResult.success) {
    //     throw new Error(registrationResult.message || 'Failed to register user');
    //   }

    //   // Store user data locally for immediate use
    //   localStorage.setItem('userRole', formData.role);
    //   localStorage.setItem('userProfile', JSON.stringify(formData));
      
    //   // Redirect based on role
      if (formData.role === 'therapist') {
        navigate('/therapist/home');
      } else {
        navigate('/patients/home');
      }
    // } catch (error) {
    //   console.error('Onboarding failed:', error);
    //   // Show error message to user
    //   alert(`Onboarding failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
    // } finally {
    //   setIsSubmitting(false);
    // }
  };
  const canProceed = formData.firstName && formData.lastName && formData.email;

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
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
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
                </div>
              </div>
            )}

            {/* Step 3: Therapist-specific Information */}
            {currentStep === 3 && formData.role === 'therapist' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
                    placeholder="e.g., Clinical Psychology, Psychiatry"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
                    placeholder="e.g., 5+ years"
                    required
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
                {currentStep < 3 || (currentStep === 3 && formData.role === 'patient') ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={currentStep === 1 ? !canProceed : (currentStep === 2 ? !formData.role : false)}
                    className="px-6 py-2 bg-[#18E614] text-white rounded-lg hover:bg-[#18E614]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <span>Continue</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!canProceed || !formData.role || isSubmitting}
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
