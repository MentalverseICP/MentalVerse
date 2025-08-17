import React from 'react';
import { Bar } from 'react-chartjs-2';
import { chartOptions, chartData } from '@/components/ui/chartConfig';
import { ArrowUpFromDot } from 'lucide-react';
import { useTheme } from "@/components/theme-provider"
import { useSidebar } from '../ui/Sidebar';

interface prop {
  className?: string;
}

export const StackedBarLineChart: React.FC<prop> = ({ className }) => {
  const { theme } = useTheme()
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed'

  return (
    <div className={`rounded-3xl shadow-md pt-2 relative overflow-hidden border h-full ${className}`}>
      <div className='absolute p-5 max-lg:relative max-md:absolute max-lg:ml-3 max-sm:p-3 max-[400px]:p-2'>
        <h2 className="uppercase font-bold text-xs max-lg:text-md">Health Index</h2>
        <div className='flex items-center max-lg:mt-12 max-sm:mt-6 max-[400px]:mt-4'>
          <span className={`text-[#18E614] text-4xl max-lg:text-[50px] max-sm:text-3xl max-[400px]:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#18E614]'}`} >75%</span>
          <ArrowUpFromDot className="text-[#F80D38] w-10 h-10 max-sm:w-8 max-sm:h-8 max-[400px]:w-6 max-[400px]:h-6 font-extrabold text-3xl" />
        </div>
        <div className='flex flex-col items-start mt-3 max-sm:mt-2 max-[400px]:mt-1'>
          <span className={`text-[10px] max-lg:text-[18px] max-sm:text-[12px] max-[400px]:text-[10px] pb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Patience health rate</span>
          <span className={`text-[10px] max-lg:text-[18px] max-sm:text-[12px] max-[400px]:text-[10px] ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>from Jan to Dec.</span>
        </div>
      </div>
      <div className={`max-lg:h-72 h-64 max-sm:h-48 max-[400px]:h-40 lg:mt-[24px] ${isCollapsed ? ' max-md:mt-32 mt-10 max-sm:mt-20 max-[400px]:mt-16' : 'lg:mt-20 md:-mt-28 mt-32 max-sm:mt-24 max-[400px]:mt-20 relative lg:-bottom-16'}`}>
        <Bar options={chartOptions} data={chartData} className='h-[10rem] max-sm:h-[8rem] max-[400px]:h-[6rem] -m-8 max-sm:-m-4 max-[400px:-m-2]' />
      </div>
    </div>
  );
};