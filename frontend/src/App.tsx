import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/Sidebar"
import { ThemeProvider } from './components/shared/theme-provider'
import { SearchProvider } from './contexts/SearchContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppSidebar } from './components/patients/AppSidebar'
import { DoctorSidebar } from './components/therapists/DoctorSidebar'
import { AdminSidebar } from './components/admin/AdminSidebar'
import { AppRoutes } from './AppRoutes'
import SearchBar from './components/shared/SearchBar'
import LandingPage from '@/pages/LandingPage'
import Onboarding from '@/pages/Onboarding'
import Loader from './components/shared/Loader'
import { authService } from './services/backend'
import Waitlist from './components/waitlist/waitlist'

interface SubAppProps {
  onSearchChange: (value: string) => void;
}

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <SearchProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </AuthProvider>
      </SearchProvider>
    </ThemeProvider>
  )
}

function AppRouter() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [, setSearchTerm] = useState('')
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const checkingUserRef = useRef(false)

  // Loader state
  const [showLoader, setShowLoader] = useState(false)
  const loaderTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Check if user exists and has profile when authenticated
  useEffect(() => {
    const checkUserAndProfile = async () => {
      if (!isAuthenticated) {
        setUserExists(null);
        setHasProfile(null);
        checkingUserRef.current = false;
        return;
      }
      
      if (checkingUserRef.current) return; // Prevent multiple simultaneous calls
      
      checkingUserRef.current = true;
      try {
        // First check if user exists (is registered)
        const userResult = await authService.checkUserExists();
        console.log('User existence check result:', userResult);
        setUserExists(userResult.exists);
        
        if (userResult.exists) {
          console.log('✅ User exists with role:', userResult.userRole);
          
          // Then check if user has a complete profile
          const profileResult = await authService.checkUserProfile();
          setHasProfile(profileResult.hasProfile);
          
          if (profileResult.hasProfile) {
             console.log('✅ User has complete profile');
             // Store user role and mark onboarding as complete for users with complete profiles
             if (userResult.userRole) {
               localStorage.setItem('userRole', userResult.userRole);
               localStorage.setItem('userOnboardingComplete', 'true');
             }
          } else {
            console.log('❌ User exists but no complete profile found');
          }
        } else {
          console.log('❌ User does not exist or no role found');
          setHasProfile(false);
        }
      } catch (error) {
        console.error('Failed to check user existence and profile:', error);
        // On error, assume user doesn't exist to trigger onboarding
        setUserExists(false);
        setHasProfile(false);
      } finally {
        checkingUserRef.current = false;
      }
    };

    checkUserAndProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setShowLoader(true)
      loaderTimeout.current = setTimeout(() => setShowLoader(false), 2000)
    } else {
      setShowLoader(false)
      // Reset user existence check when not authenticated
      setUserExists(null)
      checkingUserRef.current = false
    }
    return () => {
      if (loaderTimeout.current) clearTimeout(loaderTimeout.current)
    }
  }, [isAuthenticated])

  const handleWalletDisconnect = () => {
    console.log('Wallet disconnected')
  }

  const handleSearchChange = (value: string) => setSearchTerm(value)

  if (isLoading || authLoading || (isAuthenticated && checkingUserRef.current)) return <Loader />
  if (showLoader) return <Loader />

  return (
    <Routes>
      <Route
        path="/"
        element={
          // <LandingPage onWalletDisconnect={handleWalletDisconnect} />
          <Waitlist />
        }
      />
      <Route
        path="/app"
        element={
          !isAuthenticated ? (
            <Navigate to="/" replace />
          ) : userExists === true && hasProfile === true ? (
            // Existing user with complete profile - go to dashboard
            <Navigate to="/dashboard" replace />
          ) : userExists === true && hasProfile === false ? (
            // Existing user without complete profile - go to onboarding
            <Navigate to="/onboarding" replace />
          ) : userExists === false ? (
            // New user - go to onboarding
            <Navigate to="/onboarding" replace />
          ) : (
            // Still checking user status
            <Loader />
          )
        }
      />
      <Route
        path="/onboarding"
        element={
          isAuthenticated ? (
            userExists === false || (userExists === true && hasProfile === false) ? (
              // New users or existing users without complete profile should access onboarding
              <Onboarding />
            ) : userExists === true && hasProfile === true ? (
              // Existing users with complete profile should be redirected to dashboard
              <Navigate to="/dashboard" replace />
            ) : (
              // Still checking user status
              <Loader />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <SubApp
              onSearchChange={handleSearchChange}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  )
}

function SubApp({ onSearchChange }: SubAppProps) {
  // Check if user has completed onboarding with enhanced validation
  const userRole = localStorage.getItem('userRole');
  const onboardingComplete = localStorage.getItem('userOnboardingComplete');
  const hasCompletedOnboarding = !!userRole && onboardingComplete === 'true';

  // If user hasn't completed onboarding, redirect to appropriate page
  if (!hasCompletedOnboarding) {
    // Check if user exists but onboarding is incomplete
    if (userRole) {
      console.log('User role found but onboarding incomplete, redirecting to onboarding');
      return <Navigate to="/onboarding" replace />;
    } else {
      console.log('No user role found, redirecting to landing page');
      return <Navigate to="/" replace />;
    }
  }

  // Determine which sidebar to show based on user role
  const isDoctor = userRole === 'therapist';
  const isAdmin = userRole === 'admin';
  
  console.log('SubApp loaded for user role:', userRole, 'isDoctor:', isDoctor, 'isAdmin:', isAdmin);

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-40 h-16">
        <SearchBar
          onSearchChange={onSearchChange}
          className='flex items-center justify-between h-16 px-6 bg-background shadow-md max-md:mx-1 max-sm:mx-0 !bg-[#F7F7F7] dark:!bg-[#0B0B0C]'
        />
      </div>

      <div className="">
        <SidebarProvider defaultOpen={false}>
          <div className="grid grid-cols-[auto,1fr] w-full overflow-hidden">
            {isAdmin ? (
              <AdminSidebar className={'z-20 fixed lg:mt-12 lg:mb-20 max-lg:mt-8'} />
            ) : isDoctor ? (
              <DoctorSidebar className={'z-20 fixed lg:mt-12 lg:mb-20 max-lg:mt-8'} />
            ) : (
              <AppSidebar className={'z-20 fixed lg:mt-12 lg:mb-20 max-lg:mt-8'} />
            )}
            <AppRoutes />
          </div>
        </SidebarProvider>
      </div>
    </div>
  )
}
export default App