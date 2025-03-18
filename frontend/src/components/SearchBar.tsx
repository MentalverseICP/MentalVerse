import React from 'react';
import { Bot, Search } from 'lucide-react'; // Importing a search icon from lucide-react
import notification from '@/assets/Notification Icon.svg'
import { useSidebar } from './ui/Sidebar';
import { useTheme } from "@/components/theme-provider"
import { cn } from '@/lib/utils';
import { Separator } from '@radix-ui/react-separator';
import userImg from '@/assets/OIP (18).jpeg'

interface SearchBarProps {
  onSearchChange: (value: string) => void; // Callback for handling input changes
  placeholder?: string; // Optional placeholder text
  className?: string; // Optional additional Tailwind classes
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchChange,
  placeholder = "Search pathology results", // Default placeholder
  className = "",
}) => {

  const { state } = useSidebar()
  const { theme } = useTheme()
  const isCollapsed = state === "collapsed"

  return (
    <div className={cn(`bg-zinc-50 dark:bg-transparent border-[#d2d2d2ea] dark:border-[#3D3D3D] border rounded-3xl h-24 ml-2 mr-4 max-sm:mr-0 p-5 max-sm:p-3 grid grid-flow-col grid-cols-12 max-sm:grid-cols-6 items-center justify-between z-10 backdrop-blur-xl overflow-hidden ${className}`, isCollapsed ? 'xl:gap-20 lg:gap-10 max-md:gap-5 max-sm:gap-0' : 'xl:gap-14')}>
      <div className={`col-span-8 max-sm:col-span-4 max-xs:col-span-3 max-sm:col-start-1 flex items-center rounded-md p-1 bg-white  dark:border-[#2f3339] border-2 shadow-sm overflow-hidden`}>
        <Search className="h-4 w-4 flex-none text-gray-500 dark:text-gray-400 ml-3" />
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearchChange(e.target.value)} // Handle input changes
          className="flex-1 bg-transparent outline-none text-gray-500 dark:text-gray-500 py-2 px-3 text-sm" // Accessibility feature
          aria-label="Search"
        />
      </div>
      <div className={`col-start-10 max-xs:col-start-5 max-sm:col-start-6 flex sm:gap-4 gap-2 w-52 items-center justify-start xl:justify-end ${isCollapsed ? '' : ''}`}>
        <button
          type="button"
          title='Notifications'
          className={cn("-ml-1 w-7 h-7 flex items-center justify-center hover:-translate-y-1 rounded-lg transition-all duration-300 hover:border-t hover:border-b", theme === 'dark' ? 'bg-background hover:bg-black hover:shadow-[0_2px_0_0_rgba(204,255,0,0.811)] hover:border-[#18E614]' : 'hover:bg-zinc-100 bg-white hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]')}
        >
          <div className="relative z-10">
            <img src={notification} alt="notification" />
          </div>
        </button>        
        <Separator orientation='vertical' className="w-px h-5 bg-gray-300" />
        <div>
          {true ? (
            <div className='flex items-center lg:gap-2 lg:flex-row flex-col sm:mt-1'>
              <div className=' lg:w-10 lg:h-10 w-5 h-5 max-sm:w-8 max-sm:h-8 border border-[#18E614] rounded-full'>
                <img src={userImg} alt="" className='rounded-full object-cover' />
              </div>
              <div className="flex flex-col items-center justify-items-center max-sm:hidden">
                <span className='text-[10px]'>U~Iriamuzu</span>
                <span className='text-[8px] tracking-wider text-[#18E614]'>PATIENT</span>
              </div>
            </div>
          ) : ( 
            <button type='button' title='Profile' className='cursor-default'>
              <Bot  className='text-[#18E614]' />
            </button>
          )}
        </div>
      </div>

    </div>

  );
};

export default SearchBar; 