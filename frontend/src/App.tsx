import './App.css'
import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/Sidebar"
import { ThemeProvider } from './components/theme-provider'
import { AppSidebar } from './components/AppSidebar'
import { AppRoutes } from './AppRoutes'
import SearchBar from './components/SearchBar'
import LandingPage from '@/pages/LandingPage'
import "@nfid/identitykit/react/styles.css"
import { IdentityKitProvider, useIdentityKit } from "@nfid/identitykit/react"
import { NFIDW, InternetIdentity, Stoic, OISY } from "@nfid/identitykit"
import { Brain } from 'lucide-react'

interface SubAppProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

function Loader() {
  return(
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-spin">
          <Brain className="text-white" size={32} />
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">Loading MentalVerse</h2>
        <p className="text-gray-400">Connecting to the blockchain...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <IdentityKitProvider
        signers={[NFIDW, InternetIdentity, Stoic, OISY]}
        authType="ACCOUNTS"
        windowOpenerFeatures="top=250rem,left=300px,width=280rem,height=500rem"
      >
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </IdentityKitProvider>
    </ThemeProvider>
  )
}

function AppRouter() {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const { user } = useIdentityKit()
  const authenticated = !!user
  const [isLoading, setIsLoading] = useState(true)

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
            <Navigate to="/home" replace />
          )
        }
      />
      <Route
        path="/*"
        element={
          authenticated ? (
            <SubApp
              searchTerm={searchTerm}
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

function SubApp({ searchTerm, onSearchChange }: SubAppProps) {
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
            <AppSidebar className={'z-20 fixed lg:mt-12 lg:mb-20 max-lg:mt-8'} />
            <AppRoutes />
          </div>
        </SidebarProvider>
      </div>
    </div>
  )
}

export default App