import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { SidebarProvider } from "@/components/ui/Sidebar"
import { ThemeProvider } from './components/theme-provider'
import { AppSidebar } from './components/AppSidebar'
import { Routes } from './Routes'

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <BrowserRouter>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
              <Routes />
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
