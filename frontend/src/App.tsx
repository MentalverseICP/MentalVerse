import './App.css'
import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/Sidebar"
import { ThemeProvider } from './components/theme-provider'
import { AppSidebar } from './components/AppSidebar'
import { AppRoutes } from './AppRoutes'
import SearchBar from './components/SearchBar'
import { ThemeToggle } from './components/ThemeToggle'

function App() {

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Add your search logic here
  };

  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <BrowserRouter>
        <SidebarProvider defaultOpen={false}>
          <div className="flex min-h-screen">
            <AppSidebar className={''} />
            <main className="flex-1 flex flex-col gap-32 overflow-hidden">
              <SearchBar onSearchChange={handleSearchChange} className='max-md:ml-24 max-sm:ml-16 fixed top-3' />
              <div className='max-md:ml-24 max-sm:ml-16 fixed top-32 flex items-center justify-between z-10'>
                <h1>time</h1>
                <ThemeToggle />
              </div>
              <AppRoutes />
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
