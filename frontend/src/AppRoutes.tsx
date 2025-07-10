import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Login from '@/pages/Login'
import Logout from '@/pages/Logout'
import Settings from '@/pages/Settings'
import Chats from '@/pages/Chats'
import Medical from '@/pages/Medical'
import Doctors from '@/pages/Doctors'
import Appointments from '@/pages/Appointments'
import Claims from '@/pages/Claims'
import { cn } from './lib/utils';
import { useSidebar } from './components/ui/Sidebar';
import LandingPage  from '@/pages/LandingPage';

// @nfid/identitykit/react

interface RouteProps {
  // className?: string
}

export const AppRoutes: React.FC<RouteProps> = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <main className={cn(
      "min-h-screen",
      "transition-all duration-300 ease-in-out",
      "mt-24",
      isCollapsed 
        ? "lg:w-[calc(100vw-6.3rem)] md:w-[calc(100vw-6rem)] sm:w-[calc(100vw-1rem)]"
        : "lg:w-[calc(100vw-18rem)] sm:w-[calc(100vw-1rem)]",
      "max-sm:scrollbar-custom relative"
    )}>
      <div className='w-full max-w-full'>
        <Routes>
          {/* <Route path="/home" element={<LandingPage />} /> */}
          {/* <Route index element={<Home />} /> */}
          <Route path='/home' element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/chats" element={<Chats />} />
          <Route path='/claims' element={<Claims />} />
          <Route path="/medical" element={<Medical />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/appointments" element={<Appointments />} />
        </Routes>      
      </div>      
    </main>


  );
};
