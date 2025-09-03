import React from 'react';
import { useSidebar } from "@/components/ui/Sidebar";
import ChartDonut from "@/components/doctorComp/Chart-pie-donut-text";
import { ChartInteractive } from "@/components/doctorComp/Chart-pie-interactive";
import { ChartRadar } from "@/components/doctorComp/Chart-radar-dots";
import HistogramChart from "@/components/doctorComp/HistogramChart";
import { StackedBarLineChart } from "@/components/doctorComp/StackedBarLineChart";
import MapComponent from "@/components/doctorComp/MapComponent";
import PatientList from "@/components/doctorComp/PatientList";
import AppointmentList from "@/components/doctorComp/AppointmentList";

export default function DoctorHome() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <div
        className={`grid grid-cols-12 justify-evenly max-sm:ml-[4.5rem] max-lg:ml-20 mt-4 mb-4 mr-2 w-fit max-sm:w-fit ${
          isCollapsed
            ? "gap-5 w-full max-md:w-fit md:pr-4 md:pl-2"
            : "xl:gap-x-5 gap-5 px-2"
        }`}
      >
        {/* Patient Distribution Chart */}
        <ChartDonut className="col-start-1 col-span-3 max-xl:col-span-4 max-lg:col-span-6 max-sm:col-span-full dark:border-[#2f3339] border-2 bg-transparent" />
        
        {/* Appointment Status Chart */}
        <ChartInteractive className="col-start-4 col-span-3 max-xl:col-start-5 max-xl:col-span-4 max-lg:col-start-7 max-lg:col-span-6 max-sm:col-start-1 max-sm:col-span-full dark:border-[#2f3339] border-2 bg-transparent" />
        
        {/* Revenue/Patient Growth Chart */}
        <StackedBarLineChart className="col-start-7 col-span-3 max-xl:col-start-9 max-xl:col-span-4 max-lg:col-start-1 max-lg:col-span-6 max-md:col-span-full dark:border-[#2f3339] border-2 bg-transparent" />
        
        {/* Right Side Panel - Patient Activity & Appointments */}
        <div className="col-start-10 col-span-3 max-xl:col-start-1 max-xl:col-span-full row-start-1 max-xl:row-start-6 row-span-3 max-xl:flex max-xl:flex-col max-sm:grid max-sm:col-start-1 max-sm:col-span-full rounded-3xl shadow-lg items-start dark:border-[#2f3339] border-2 ">
          <HistogramChart className="" />
          <AppointmentList className="max-xl:flex gap-5 max-xl:justify-evenly max-sm:flex-col " />
        </div>
        
        {/* Patient Geographic Distribution */}
        <MapComponent className="col-start-1 col-span-6 max-xl:col-span-8 row-span-1 max-lg:col-span-full max-sm:row-start-5 dark:border-[#2f3339] border-2 " />
        
        {/* Patient Satisfaction/Outcome Chart */}
        <ChartRadar className="row-span-1 col-start-7 col-span-3 max-xl:col-start-9 max-xl:col-span-4 max-lg:col-start-7 max-lg:row-start-2 max-lg:col-span-6 max-md:col-start-1 max-md:col-span-full max-md:row-start-3 dark:border-[#2f3339] border-2 bg-transparent" />
        
        {/* Patient List */}
        <PatientList className="col-start-1 col-span-9 max-xl:col-span-full dark:border-[#2f3339] border-2 " />
      </div>
    </>
  );
}
