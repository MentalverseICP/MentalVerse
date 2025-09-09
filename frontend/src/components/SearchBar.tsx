import React, { useState } from 'react';
import { Search } from 'lucide-react'; 
import notification from '@/images/Notification Icon.svg'
import { useTheme } from "@/components/theme-provider"
import { cn } from '@/lib/utils';
import { Separator } from '@radix-ui/react-separator';
import userImg from '@/images/OIP (18).jpeg'
import { Link } from 'react-router-dom';

import mentalIcon from "@/images/mental_Icon.svg"
import mentalIconDark from "@/images/mental_Icon_dark.svg"
import mentalIconMobileLight from "@/images/mental_Icon_mobile_light.svg"
import mentalIconMobileDark from "@/images/mental_Icon_mobile_dark1.svg"

import { ThemeToggle } from './ThemeToggle';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearchChange: (value: string) => void; // Callback for handling input changes
  placeholder?: string; 
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchChange,
  className = "",
}) => {
  const { theme } = useTheme()
  const isLargeScreen = useMediaQuery('(min-width: 1023px)');
  const isSmallScreen = useMediaQuery('(min-width: 480px)')
  const [isOpen, setIsOpen] = useState(false);


  return (
    <div className={`dark:border-[#2f3339] border-2 rounded-b-3xl max-lg:rounded-bl-none h-24 mx-2 p-5 max-sm:p-3 grid xl:gap-8 lg:gap-6 md:gap-4 sm:gap-3 gap-2 grid-flow-col items-center justify-between z-20 overflow-hidden ${className}`}>

      <Link to={"/home"} className="flex items-center justify-start px-1 relative z-[52] flex-shrink-0">
        <img
          src={
            isLargeScreen 
              ? theme === 'dark' 
                ? mentalIconDark 
                : mentalIcon
              : theme === 'dark'
                ? mentalIconMobileDark  
                : mentalIconMobileLight 
          }
          alt="Mental Verse"
          className={cn("logo fill-mental transition max-h-12 w-auto")}
        />
      </Link>

      <div className={`flex xl:gap-4 lg:gap-3 sm:gap-2 gap-1 items-center justify-end flex-shrink-0`}>
        {/* Search */}
        <div className='flex items-center'>        
          {isOpen && (
            <motion.div className='flex-1 flex items-center rounded-md p-1 bg-[#f7f7f7f7] shadow-sm border overflow-hidden min-w-0 mx-2 h-10'>
              <Search className="h-4 w-4 flex-none text-gray-500 dark:text-gray-400 ml-3" />
              <input
                type="text"
                placeholder={isSmallScreen ? 'Search pathology results' : 'Search'}
                onChange={(e) => onSearchChange(e.target.value)} 
                className="flex-1 bg-transparent outline-none text-gray-500 dark:text-gray-500 py-2 px-3 text-sm min-w-0 placeholder:text-xs" 
                aria-label="Search"
              />
            </motion.div>              
          )}
          <motion.button 
            whileHover={{ scale: 0.92 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 bg-gradient-to-r from-[#18E614a1] to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
            aria-label={isOpen ? 'Close chat' : 'Open chat'}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SearchX size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SearchIcon size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>


        {/* Theme */}
        <ThemeToggle className='max-sm:hidden' />

        {/* Notification */}
        <button
          type="button"
          title='Notifications'
          className={cn("-ml-1 lg:w-10 w-7 lg:h-10 h-7 flex items-center justify-center hover:-translate-y-1 rounded-lg transition-all duration-300 hover:border-t hover:border-b flex-shrink-0", theme === 'dark' ? 'bg-background hover:bg-black hover:shadow-[0_2px_0_0_rgba(204,255,0,0.811)] hover:border-[#18E614]' : 'hover:bg-zinc-100 bg-white hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]')}
        >
          <div className="relative z-10">
            <img src={notification} alt="notification" />
          </div>
        </button>        

        <Separator orientation='vertical' className="w-px h-5 bg-gray-300 max-xs:hidden" />
        <div className="flex-shrink-0">
          {true ? (
            <div className='flex items-center gap-2 sm:mt-1'>
              <div className=' lg:w-12 lg:h-12 w-7 h-7 max-sm:w-10 max-sm:h-10 border border-[#18E614] rounded-full flex-shrink-0'>
                <img src={userImg} alt="" className='rounded-full object-cover w-full h-full' />
              </div>
                <div className="flex flex-col justify-items-center max-sm:hidden min-w-0">
                  <span className='md:text-sm text-xs whitespace-nowrap overflow-hidden text-ellipsis'>U~Iriamuzu</span>
                  <span className='text-[10px] tracking-wider text-[#18E614] whitespace-nowrap'>PATIENT</span>
                </div>
            </div>
          ) : ( 
            <button title='Profile' className='cursor-default' type='button'>
              <Bot  className='text-[#18E614]' />
            </button>
          )}
        </div>

      </div>

    </div>

  );
};

export default SearchBar;