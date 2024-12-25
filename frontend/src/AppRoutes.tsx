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

export const AppRoutes: React.FC = () => {
  return (
      <Routes>
        <Route index element={<Home />} />
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
  );
};
