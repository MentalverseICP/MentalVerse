import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/Sidebar"
import { ThemeProvider } from './components/shared/theme-provider'
import { SearchProvider } from './contexts/SearchContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppSidebar } from './components/patients/AppSidebar'
import { DoctorSidebar } from './components/therapists/DoctorSidebar'
import { AppRoutes } from './AppRoutes'
import SearchBar from './components/shared/SearchBar'
import LandingPage from '@/pages/LandingPage'
import Onboarding from '@/pages/Onboarding'
import Loader from './components/shared/Loader'
import { authService } from './services/backend'

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
  const [userExists, setUserExists] = useState<boolean | null>(null)
  const [checkingUser, setCheckingUser] = useState(false)

  // Loader state
  const [showLoader, setShowLoader] = useState(false)
  const loaderTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Check if user exists when authenticated
  useEffect(() => {
    const checkExistingUser = async () => {
      if (isAuthenticated && !checkingUser && userExists === null) {
        setCheckingUser(true)
        try {
          // Check if user already exists in backend
          const result = await authService.getActor()?.getCurrentUser()
          if (result && 'Ok' in result && result.Ok) {
            // User exists, store their role and mark as existing
            const userRole = result.Ok.role
            localStorage.setItem('userRole', userRole)
            localStorage.setItem('userOnboardingComplete', 'true')
            setUserExists(true)
            console.log('Existing user detected with role:', userRole)
          } else {
            // User doesn't exist, needs onboarding
            setUserExists(false)
            localStorage.removeItem('userRole')
            localStorage.removeItem('userOnboardingComplete')
            console.log('New user detected, needs onboarding')
          }
        } catch (error) {
          console.error('Error checking existing user:', error)
          // On error, assume new user to be safe
          setUserExists(false)
          localStorage.removeItem('userRole')
          localStorage.removeItem('userOnboardingComplete')
        } finally {
          setCheckingUser(false)
        }
      }
    }

    checkExistingUser()
  }, [isAuthenticated, checkingUser, userExists])

  useEffect(() => {
    if (isAuthenticated) {
      setShowLoader(true)
      loaderTimeout.current = setTimeout(() => setShowLoader(false), 2000)
    } else {
      setShowLoader(false)
      // Reset user existence check when not authenticated
      setUserExists(null)
      setCheckingUser(false)
    }
    return () => {
      if (loaderTimeout.current) clearTimeout(loaderTimeout.current)
    }
  }, [isAuthenticated])

  const handleWalletDisconnect = () => {
    console.log('Wallet disconnected')
  }

  const handleSearchChange = (value: string) => setSearchTerm(value)

  if (isLoading || authLoading || (isAuthenticated && checkingUser)) return <Loader />
  if (showLoader) return <Loader />

  return (
    <Routes>
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <LandingPage onWalletDisconnect={handleWalletDisconnect} />
          ) : userExists === true ? (
            // Existing user - bypass onboarding and go to dashboard
            <Navigate to="/dashboard" replace />
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
            userExists === false ? (
              // Only new users should access onboarding
              <Onboarding />
            ) : userExists === true ? (
              // Existing users should be redirected to dashboard
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
  
  console.log('SubApp loaded for user role:', userRole, 'isDoctor:', isDoctor);

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
            {isDoctor ? (
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