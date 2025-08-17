import AppointmentList from "@/components/homeComp/AppointmentList";
import  ChartDonut  from "@/components/homeComp/Chart-pie-donut-text"
import { ChartInteractive } from "@/components/homeComp/Chart-pie-interactive"
import { ChartRadar } from "@/components/homeComp/Chart-radar-dots"
import HistogramChart from "@/components/homeComp/HistogramChart";
import { useSidebar } from '@/components/ui/Sidebar';
import { StackedBarLineChart } from "@/components/homeComp/StackedBarLineChart";
import MapComponent from "@/components/homeComp/MapComponent";
import DoctorList from "@/components/homeComp/DoctorList";



export default function Home() {

  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <>
      <div className={`grid grid-cols-12 justify-evenly max-sm:ml-[4.5rem] max-lg:ml-20 mt-4 mb-4 mr-2 w-fit max-sm:w-fit ${isCollapsed ? 'gap-5 w-full max-md:w-fit md:pr-4 md:pl-2' : 'xl:gap-x-5 gap-5 px-2'}`}>
        <ChartDonut className="col-start-1 col-span-3 max-xl:col-span-4 max-lg:col-span-6 max-sm:col-span-full dark:border-[#2f3339] border-2 bg-transparent" />
        <ChartInteractive className="col-start-4 col-span-3 max-xl:col-start-5 max-xl:col-span-4 max-lg:col-start-7 max-lg:col-span-6 max-sm:col-start-1 max-sm:col-span-full dark:border-[#2f3339] border-2 bg-transparent" />
        <StackedBarLineChart className='col-start-7 col-span-3 max-xl:col-start-9 max-xl:col-span-4 max-lg:col-start-1 max-lg:col-span-6 max-md:col-span-full dark:border-[#2f3339] border-2 bg-transparent' />
        <div className="col-start-10 col-span-3 max-xl:col-start-1 max-xl:col-span-full row-start-1 max-xl:row-start-6 row-span-3 max-xl:flex max-xl:flex-col max-sm:grid max-sm:col-start-1 max-sm:col-span-full rounded-3xl shadow-lg items-start dark:border-[#2f3339] border-2 ">
          <HistogramChart className="" />
          <AppointmentList className="max-xl:flex gap-5 max-xl:justify-evenly max-sm:flex-col " />
        </div>
        <MapComponent className="col-start-1 col-span-6 max-xl:col-span-8 row-span-1 max-lg:col-span-full max-sm:row-start-5 dark:border-[#2f3339] border-2 " />
        <ChartRadar className="row-span-1 col-start-7 col-span-3 max-xl:col-start-9 max-xl:col-span-4 max-lg:col-start-7 max-lg:row-start-2 max-lg:col-span-6 max-md:col-start-1 max-md:col-span-full max-md:row-start-3 dark:border-[#2f3339] border-2 bg-transparent" />
        <DoctorList className='col-start-1 col-span-9 max-xl:col-span-full dark:border-[#2f3339] border-2 '  />
      </div>
    </>
  )
}