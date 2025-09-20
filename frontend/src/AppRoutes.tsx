import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from '@/pages/Patients/Home';
import Login from '@/pages/Login'
import Logout from '@/pages/Logout'
import Settings from '@/pages/Settings'
import Chats from '@/pages/Chats'
import Medical from '@/pages/Patients/Medical'
import Doctors from '@/pages/Patients/Doctors'
import Appointments from '@/pages/Patients/Appointments'
import Claims from '@/pages/Patients/Claims'
import TokenWallet from '@/pages/Patients/TokenWallet'
import TokenTransfer from '@/pages/Patients/TokenTransfer'
import TokenStaking from '@/pages/Patients/TokenStaking'
import TestnetFaucet from '@/pages/Patients/TestnetFaucet'
import Onboarding from '@/pages/Onboarding'
import DoctorHome from '@/pages/Therapists/Home'
import DoctorPatients from '@/pages/Therapists/Patients'
import DoctorAppointments from '@/pages/Therapists/Appointments'
import TherapySessions from '@/pages/Therapists/Sessions'
import TreatmentPlans from '@/pages/Therapists/TreatmentPlans'
import MentalHealthRecords from '@/pages/Therapists/Records'
import { cn } from './lib/utils';
import { useSidebar } from './components/ui/Sidebar';

interface RouteProps {
  // className?: string
}

// Dashboard redirect component
const DashboardRedirect: React.FC = () => {
  const userRole = localStorage.getItem('userRole');
  
  if (userRole === 'therapist') {
    return <Navigate to="/therapist/home" replace />;
  } else {
    return <Navigate to="/patients/home" replace />;
  }
};

export const AppRoutes: React.FC<RouteProps> = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <main className={cn(
      "transition-all duration-300 ease-in-out",
      "mt-24",
      isCollapsed 
        ? "lg:w-[calc(100vw-6.3rem)] md:w-[calc(100vw-6rem)] sm:w-[calc(100vw-1rem)]"
        : "lg:w-[calc(100vw-18rem)] sm:w-[calc(100vw-1rem)]",
      "max-sm:scrollbar-custom relative"
    )}>
      <div className='w-full max-w-full'>
        <Routes>
          {/* Dashboard Route */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          
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
          
          {/* Therapist Routes */}
          <Route path="/therapist/home" element={<DoctorHome />} />
          <Route path="/therapist/patients" element={<DoctorPatients />} />
          <Route path="/therapist/appointments" element={<DoctorAppointments />} />
          <Route path="/therapist/sessions" element={<TherapySessions />} />
          <Route path="/therapist/treatment-plans" element={<TreatmentPlans />} />
          <Route path="/therapist/records" element={<MentalHealthRecords />} />
          <Route path="/therapist/analytics" element={<DoctorHome />} />
          <Route path="/therapist/crisis-support" element={<DoctorHome />} />
          <Route path="/therapist/certifications" element={<DoctorHome />} />
          <Route path="/therapist/activity" element={<DoctorHome />} />
          
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
