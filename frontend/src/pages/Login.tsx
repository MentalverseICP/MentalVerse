import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Login = () => {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [principalId, setPrincipalId] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);

  const handleAdminLogin = () => {
    if (!principalId.trim()) {
      alert('Please enter a valid Principal ID');
      return;
    }
    
    // Check if the principal ID matches the hardcoded admin principal
    const adminPrincipalId = 'rdmx6-jaaaa-aaaah-qcaiq-cai';
    
    if (principalId.trim() === adminPrincipalId) {
      // Success - set admin credentials
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('userOnboardingComplete', 'true');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/admin/dashboard');
    } else {
      alert('Invalid Principal ID. Access denied.');
    }
  };

  const handlePatientLogin = () => {
    localStorage.setItem('userRole', 'patient');
    localStorage.setItem('userType', 'patient');
    localStorage.setItem('userOnboardingComplete', 'true');
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/dashboard');
  };

  const handleTherapistLogin = () => {
    localStorage.setItem('userRole', 'therapist');
    localStorage.setItem('userType', 'therapist');
    localStorage.setItem('userOnboardingComplete', 'true');
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/doctor/dashboard');
  };

  return (
    <div className={`grid grid-cols-12 justify-evenly max-xs:ml-[4.5rem] max-md:ml-20 mt-4 mb-4 mr-2 w-fit max-sm:w-fit ${isCollapsed ? 'gap-5 w-fit md:pr-4 md:pl-2' : 'xl:gap-5 gap-5'}`}>
      <div className='col-span-12 space-y-4 p-8'>
        <h1 className='text-2xl font-bold mb-6'>Login as:</h1>
        <div className='space-y-3'>
          {!showAdminForm ? (
            <>
              <Button 
                onClick={() => setShowAdminForm(true)} 
                className='w-full bg-red-600 hover:bg-red-700'
              >
                Login as Admin
              </Button>
              <Button onClick={handlePatientLogin} className='w-full bg-blue-600 hover:bg-blue-700'>
                Login as Patient
              </Button>
              <Button onClick={handleTherapistLogin} className='w-full bg-green-600 hover:bg-green-700'>
                Login as Therapist
              </Button>
            </>
          ) : (
            <div className='space-y-3'>
              <h2 className='text-lg font-semibold'>Admin Login</h2>
              <Input
                type='text'
                placeholder='Enter Principal ID'
                value={principalId}
                onChange={(e) => setPrincipalId(e.target.value)}
                className='w-full'
              />
              <div className='flex space-x-2'>
                <Button 
                  onClick={handleAdminLogin} 
                  className='flex-1 bg-red-600 hover:bg-red-700'
                  disabled={isLoading}
                >
                  {isLoading ? 'Authenticating...' : 'Login'}
                </Button>
                <Button 
                  onClick={() => {
                    setShowAdminForm(false);
                    setPrincipalId('');
                  }} 
                  variant='outline'
                  className='flex-1'
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login