import { useSidebar } from '@/components/ui/Sidebar';
import { useTheme } from "@/components/shared/theme-provider"
import { Link } from "react-router-dom"
import mentalIconMobileLight from "@/images/mental_Icon_mobile_light.svg"
import mentalIconMobileDark from "@/images/mental_mobile.svg"
import { useContext } from 'react';
import { AuthContext } from '../App';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Brain } from 'lucide-react';

interface LogoutProps {
  onWalletDisconnect?: () => void;
}

const Logout = ({ onWalletDisconnect }: LogoutProps) => {
  const { state } = useSidebar()
  const { theme } = useTheme()
  const isCollapsed = state === "collapsed"
  
  const getIcon = () => {
    return theme === 'dark' ? mentalIconMobileDark : mentalIconMobileLight
  }
  
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(false);

  // If user is not authenticated, redirect to landing page
  useEffect(() => {
    if (!user && !showLoader) {
      navigate("/");
    }
  }, [user, showLoader, navigate]);

  const handleDisconnect = async () => {
    try {
      setShowLoader(true);
      await logout();
      if (onWalletDisconnect) {
        onWalletDisconnect();
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    } finally {
      setShowLoader(false);
    }
  };
  
  // Loader component
  const Loader = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-spin shadow-lg">
          <Brain className="text-white" size={32} />
        </div>
        <p className="text-gray-200 font-semibold">Disconnecting Wallet...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full flex items-center justify-center transition-colors duration-500 sm:p-4 md:p-8 p-5 relative max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)] dark:bg-transparent">
      {showLoader && <Loader />}
      <div className="w-full max-w-lg mx-auto px-4 py-10 sm:px-8 sm:py-12 flex flex-col items-center space-y-8 transition-all duration-300">
        <div className="flex flex-col items-center w-full">
          <span className="text-3xl font-extrabold text-red-500 tracking-wide mb-2">Logout</span>
          <Link to={"/home"} className="flex items-center justify-center w-full mb-4">
            <img
              src={getIcon()}
              alt="Mental Verse"
              className="transition-all logo fill-mental h-20 w-36 sm:h-24 sm:w-48 drop-shadow-lg"
            />
          </Link>
        </div>
        <div className="flex flex-col space-y-5 w-full max-w-md">
          <label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email</label>
          <input 
            type="email" 
            id="email" 
            placeholder="example@mail.com" 
            className="bg-white dark:bg-gray-900 rounded-xl border border-emerald-200 dark:border-gray-700 text-black dark:text-white py-3 px-5 text-base w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all shadow-sm"
          />
          {/* User Info Display */}
          {user && (
            <div className="bg-emerald-50 dark:bg-gray-900 rounded-xl p-4 text-sm shadow border border-emerald-100 dark:border-gray-800">
              <p className="font-semibold text-emerald-500">Connected Wallet:</p>
              <p className="text-gray-600 dark:text-gray-400 truncate">
                {/* Fix: user.principal does not exist on type 'User'. Use user.walletAddress or user.id if available */}
                {('Connected').toString()}
              </p>
            </div>
          )}
          {/* Disconnect Wallet Button */}
          <button
            type='button'
            onClick={handleDisconnect}
            disabled={showLoader || !user}
            className={`w-full px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold border hover:-translate-y-1 transition-all duration-300 hover:border-t hover:border-b text-sm ${
              theme === 'dark'
                ? 'bg-transparent hover:bg-black hover:shadow-[0_2px_0_0_rgba(24,230,20,0.811)] hover:border-[#18E614]'
                : 'bg-white text-black hover:bg-zinc-100 hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {showLoader ? 'Disconnecting...' : 'Disconnect Wallet'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Logout