import React from 'react';
import { Bar } from 'react-chartjs-2';
import { chartOptions, chartData } from './chartConfig';
import { ArrowUpFromDot } from 'lucide-react';
import { useTheme } from "@/components/theme-provider"



const HealthIndexChart: React.FC = () => {

  const { theme } = useTheme()

  return (
    <div className=" rounded-3xl shadow-md py-6 h-[287px] w-[280px] relative overflow-hidden border">
      <div className='absolute p-5'>
        <h2 className="uppercase font-bold text-xs">Health Index</h2>
        <div className='flex items-center mt-4'>
          <span className={`text-[#18E614] text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#18E614]'}`} >75%</span>
          <ArrowUpFromDot className="text-[#F80D38] w-10 h-10 font-extrabold text-3xl" />
        </div>
        <div className='flex flex-col items-start'>
          <span className={`text-[10px] pb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Patience health rate</span>
          <span className={`text-[10px] ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>from Jan to Dec</span>
        </div>
      </div>
      <div className="h-64">
        <Bar options={chartOptions} data={chartData} className='h-[10rem] -m-8 -mt-[0px]' />
      </div>
    </div>
  );
};

export default HealthIndexChart;
