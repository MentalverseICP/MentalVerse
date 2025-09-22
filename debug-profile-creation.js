// Debug script to test profile creation with detailed logging
// Run this in the browser console after authentication

// Test function to debug profile creation
window.debugProfileCreation = async function(testUserData = null) {
  console.log('🔍 === DEBUGGING PROFILE CREATION ===');
  
  // Use test data if not provided
  const userData = testUserData || {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'patient',
    phoneNumber: '+1234567890',
    age: '25',
    emergencyContact: 'Emergency Contact',
    medicalHistory: 'No significant history',
    currentMedications: 'None',
    therapyGoals: 'Improve mental health'
  };
  
  console.log('🔍 Input userData:', userData);
  
  try {
    // Check if authService is available
    if (typeof authService === 'undefined') {
      console.error('❌ authService not available. Make sure you are on the MentalVerse app page.');
      return;
    }
    
    // Check authentication status
    console.log('🔍 Authentication status:', authService.getIsAuthenticated());
    console.log('🔍 User principal:', authService.getUserPrincipal()?.toString());
    console.log('🔍 User role:', authService.getUserRole());
    
    if (!authService.getIsAuthenticated()) {
      console.error('❌ Not authenticated. Please log in first.');
      return;
    }
    
    // Test profile creation
    console.log('🔍 Calling createUserProfile...');
    const result = await authService.createUserProfile(userData);
    
    console.log('🔍 Profile creation result:', result);
    
    if (result.success) {
      console.log('✅ Profile creation successful!');
    } else {
      console.error('❌ Profile creation failed:', result.message);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error during profile creation test:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message };
  }
};

// Test function for different user types
window.testPatientProfile = () => debugProfileCreation({
  firstName: 'Test',
  lastName: 'Patient',
  email: 'patient@test.com',
  role: 'patient',
  phoneNumber: '+1234567890',
  age: '30',
  emergencyContact: 'Emergency Contact',
  medicalHistory: 'Test history',
  currentMedications: 'None',
  therapyGoals: 'Test goals'
});

window.testTherapistProfile = () => debugProfileCreation({
  firstName: 'Test',
  lastName: 'Therapist',
  email: 'therapist@test.com',
  role: 'therapist',
  phoneNumber: '+1234567890',
  specialization: 'Clinical Psychology',
  experience: '5 years',
  licenseNumber: 'TEST123',
  bio: 'Test therapist bio'
});

console.log('🔍 Debug functions loaded!');
console.log('🔍 Available functions:');
console.log('  - debugProfileCreation(userData) - Test profile creation with custom data');
console.log('  - testPatientProfile() - Test patient profile creation');
console.log('  - testTherapistProfile() - Test therapist profile creation');
console.log('🔍 Example usage: debugProfileCreation() or testPatientProfile()');