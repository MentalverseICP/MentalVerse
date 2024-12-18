import { Route, Routes as RouterRoutes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Logout from './pages/Logout'
import Settings from './pages/Settings'
import Chats from './pages/Chats'
import PathologyResults from './pages/PathologyResults'
import Doctors from './pages/Doctors'
import Appointments from './pages/Appointments'

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/chats" element={<Chats />} />
      <Route path="/pathology-results" element={<PathologyResults />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/appointments" element={<Appointments />} />
    </RouterRoutes>
  )
} 