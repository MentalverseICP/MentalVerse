import React from 'react';
import { Bot, Search } from 'lucide-react'; 
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

  return (
    <div className={`dark:border-[#2f3339] border-2 dark:bg-[#0B0B0C] bg-[#f7f7f7f5] rounded-b-3xl max-lg:rounded-bl-none h-24 mx-2 p-5 max-sm:p-3 grid lg:gap-20 sm:gap-5 gap-3 grid-flow-col grid-cols-12 items-center justify-between z-20 overflow-hidden ${className}`}>

      <Link to={"/home"} className="sm:col-span-2 col-span-2 flex items-center justify-between px-1 relative z-[52]">
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
          className={cn("logo fill-mental transition")}
        />
      </Link>
      
      <div className={`xl:col-span-7 max-lg:col-span-6 max-sm:col-span-7 max-xs:col-span-5 max-xs:col-start-4 flex items-center rounded-md p-1 bg-[#f7f7f7f7] shadow-sm border overflow-hidden`}>
        <Search className="h-4 w-4 flex-none text-gray-500 dark:text-gray-400 ml-3" />
        <input
          type="text"
          placeholder={isSmallScreen ? 'Search pathology results' : 'Search'}
          onChange={(e) => onSearchChange(e.target.value)} // Handle input changes
          className="flex-1 bg-transparent outline-none text-gray-500 dark:text-gray-500 py-2 px-3 text-sm" 
          aria-label="Search"
        />
      </div>

      <div className={`xl:col-start-10 max-lg:col-start-9 max-sm:col-start-10 flex sm:gap-4 gap-2 w-64 items-center justify-start xl:justify-end`}>
        <ThemeToggle className='max-sm:hidden' />
        <button
          type="button"
          title='Notifications'
          className={cn("-ml-1 lg:w-10 w-7 lg:h-10 h-7 flex items-center justify-center hover:-translate-y-1 rounded-lg transition-all duration-300 hover:border-t hover:border-b", theme === 'dark' ? 'bg-background hover:bg-black hover:shadow-[0_2px_0_0_rgba(204,255,0,0.811)] hover:border-[#18E614]' : 'hover:bg-zinc-100 bg-white hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]')}
        >
          <div className="relative z-10">
            <img src={notification} alt="notification" />
          </div>
        </button>        
        <Separator orientation='vertical' className="w-px h-5 bg-gray-300 max-xs:hidden" />
        <div>
          {true ? (
            <div className='flex items-center gap-2 sm:mt-1'>
              <div className=' lg:w-12 lg:h-12 w-7 h-7 max-sm:w-10 max-sm:h-10 border border-[#18E614] rounded-full'>
                <img src={userImg} alt="" className='rounded-full object-cover' />
              </div>
              <div className="flex flex-col justify-items-center max-sm:hidden">
                <span className='md:text-sm text-xs'>U~Iriamuzu</span>
                <span className='text-[10px] tracking-wider text-[#18E614]'>PATIENT</span>
              </div>
            </div>
          ) : ( 
            <button title='Profile' className='cursor-default'>
              <Bot  className='text-[#18E614]' />
            </button>
          )}
        </div>

      </div>

    </div>

  );
};

export default SearchBar;