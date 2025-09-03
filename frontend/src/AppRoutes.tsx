import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Patients/Home';
import Login from '@/pages/Login'
import Logout from '@/pages/Logout'
import Settings from '@/pages/Settings'
import Chats from '@/pages/Chats'
import Medical from '@/pages/Patients/Medical'
import Doctors from '@/pages/Patients/Doctors'
import Appointments from '@/pages/Appointments'
import Claims from '@/pages/Patients/Claims'
import TokenWallet from '@/pages/Patients/TokenWallet'
import TokenTransfer from '@/pages/Patients/TokenTransfer'
import TokenStaking from '@/pages/Patients/TokenStaking'
import TestnetFaucet from '@/pages/Patients/TestnetFaucet'
import Onboarding from '@/pages/Onboarding'
import DoctorHome from '@/pages/Doctors/Home'
import DoctorPatients from '@/pages/Doctors/Patients'
import DoctorAppointments from '@/pages/Doctors/Appointments'
import { cn } from './lib/utils';
import { useSidebar } from './components/ui/Sidebar';

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
          {/* Onboarding Route */}
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Patient Routes */}
          <Route index element={<Home />} />
          <Route path='/patients/home' element={<Home />} />
          <Route path='/patients/claims' element={<Claims />} />
          <Route path="/patients/medical" element={<Medical />} />
          <Route path="/patients/doctors" element={<Doctors />} />
          <Route path="/patients/token-wallet" element={<TokenWallet />} />
          <Route path="/patients/token-transfer" element={<TokenTransfer />} />
          <Route path="/patients/token-staking" element={<TokenStaking />} />
          <Route path="/patients/testnet-faucet" element={<TestnetFaucet />} />
          <Route path="/patients/token-wallet" element={<TokenWallet />} />
          <Route path="/patients/token-transfer" element={<TokenTransfer />} />
          <Route path="/patients/token-staking" element={<TokenStaking />} />
          
          {/* Doctor Routes */}
          <Route path="/doctor/home" element={<DoctorHome />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          
          {/* Shared Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/appointments" element={<Appointments />} />

        </Routes>
      </div>      
    </main>
  );
};
