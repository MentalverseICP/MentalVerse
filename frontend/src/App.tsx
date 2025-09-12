import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/Sidebar"
import { ThemeProvider } from './components/shared/theme-provider'
import { SearchProvider } from './contexts/SearchContext'
import { AppSidebar } from './components/patients/AppSidebar'
import { DoctorSidebar } from './components/therapists/DoctorSidebar'
import { AppRoutes } from './AppRoutes'
import SearchBar from './components/shared/SearchBar'
import LandingPage from '@/pages/LandingPage'
import Onboarding from '@/pages/Onboarding'
import { AuthClient } from '@dfinity/auth-client'
import { createContext, useContext } from 'react'
import Loader from './components/shared/Loader'

interface SubAppProps {
  onSearchChange: (value: string) => void;
}

interface User {
  authenticated: boolean;
}

// Simple auth context
export const AuthContext = createContext<{ user: User | null; login: () => void; logout: () => void }>({ 
  user: null, 
  login: () => {}, 
  logout: () => {} 
})

function App() {
  const [user, setUser] = useState<User | null>(null)
  
  const login = async () => {
    const authClient = await AuthClient.create()
    await authClient.login({
      identityProvider: 'https://identity.ic0.app/#authorize',
      onSuccess: () => {
        setUser({ authenticated: true })
      }
    })
  }
  
  const logout = async () => {
    const authClient = await AuthClient.create()
    await authClient.logout()
    setUser(null)
  }
  
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <SearchProvider>
        <AuthContext.Provider value={{ user, login, logout }}>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </AuthContext.Provider>
      </SearchProvider>
    </ThemeProvider>
  )
}

function AppRouter() {
  const { user } = useContext(AuthContext)
  const authenticated = !!user
  const [isLoading, setIsLoading] = useState(true)
  const [, setSearchTerm] = useState('')

  // Loader state
  const [showLoader, setShowLoader] = useState(false)
  const loaderTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (authenticated) {
      setShowLoader(true)
      loaderTimeout.current = setTimeout(() => setShowLoader(false), 2000)
    } else {
      setShowLoader(false)
    }
    return () => {
      if (loaderTimeout.current) clearTimeout(loaderTimeout.current)
    }
  }, [authenticated])

  const handleWalletDisconnect = () => {
    console.log('Wallet disconnected')
  }

  const handleSearchChange = (value: string) => setSearchTerm(value)

  if (isLoading) return <Loader />
  if (showLoader) return <Loader />

  return (
    <Routes>
      <Route
        path="/"
        element={
          !authenticated ? (
            <LandingPage onWalletDisconnect={handleWalletDisconnect} />
          ) : (
            <Navigate to="/onboarding" replace />
          )
        }
      />
      <Route
        path="/onboarding"
        element={
          authenticated ? (
            <Onboarding />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/*"
        element={
          authenticated ? (
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
  // Check if user has completed onboarding
  const userRole = localStorage.getItem('userRole');
  const hasCompletedOnboarding = !!userRole;

  // If user hasn't completed onboarding, redirect to onboarding
  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Determine which sidebar to show based on user role
  const isDoctor = userRole === 'therapist';

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