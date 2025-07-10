import './App.css'
import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/Sidebar"
import { ThemeProvider } from './components/theme-provider'
import { AppSidebar } from './components/AppSidebar'
import { AppRoutes } from './AppRoutes'
import SearchBar from './components/SearchBar'
import LandingPage  from '@/pages/LandingPage';


function App() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Add search logic 
  };

  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <BrowserRouter>
        <div className='min-h-screen dark:bg-black overflow-hidden'>
          <Routes>
                      <Route path="/" element={<LandingPage />} />
            
          </Routes>
{/* 
          <div className="fixed top-0 left-0 right-0 z-40 h-16">
            <main className="flex-1 flex flex-col gap-32">
              <SearchBar onSearchChange={handleSearchChange} className='flex items-center justify-between h-16 px-6 bg-background shadow-md max-md:mx-1 max-sm:mx-0 ' />
            </main>
          </div>        

          <div className="overflow-h">
            <SidebarProvider defaultOpen={false}>
              <div className="grid grid-cols-[auto,1fr] w-full">
                <AppSidebar className={'z-20 fixed lg:mt-12 lg:mb-20 max-lg:mt-8'} />
                <AppRoutes />
              </div>
            </SidebarProvider>                      
          </div> */}

        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
