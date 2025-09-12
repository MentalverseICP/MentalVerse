import { useSidebar } from "@/components/ui/Sidebar";
import DiagnosticsChart from "@/components/charts/DiagnosticsChart";
import PatientsChart from "@/components/charts/PatientsChart";
import HealthIndexChart from "@/components/charts/HealthIndexChart";
import AppointmentsChart from "@/components/charts/AppointmentsChart";
import CompanyGrowthChart from "@/components/charts/CompanyGrowthChart";
import MapComponent from "@/components/charts/MapComponent";
import PatientList from "@/components/therapists/PatientList";
import AppointmentList from "@/components/therapists/AppointmentList";
import DoctorList from "@/components/patients/DoctorList";

export default function DoctorHome() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <div
        className={`grid grid-cols-12 justify-evenly max-sm:ml-[4.5rem] max-lg:ml-20 mt-4 mb-4 mr-2 w-fit max-sm:w-fit ${
          isCollapsed
            ? "gap-2 lg:gap-3 xl:gap-4 w-full max-md:w-fit md:pr-4 md:pl-2"
            : "gap-2 lg:gap-3 xl:gap-4 px-2"
        }`}
      >
        <DiagnosticsChart className="col-start-1 col-span-3 max-xl:col-span-4 max-lg:col-span-6 max-md:col-span-12 max-sm:col-span-full dark:border-[#2f3339] border-2 bg-transparent" />
        
        <PatientsChart className="col-start-4 col-span-3 max-xl:col-start-5 max-xl:col-span-4 max-lg:col-start-7 max-lg:col-span-6 max-md:col-span-12 max-sm:col-span-full dark:border-[#2f3339] border-2 bg-transparent" />
        
        <HealthIndexChart className="col-start-7 col-span-3 max-xl:col-start-9 max-xl:col-span-4 max-lg:col-start-1 max-lg:col-span-6 max-md:col-span-12 max-sm:col-span-full dark:border-[#2f3339] border-2 bg-transparent" />
        
        <div className="col-start-10 col-span-3 max-xl:col-start-1 max-xl:col-span-full row-start-1 max-xl:row-start-4 row-span-3 max-md:row-start-4 max-sm:col-start-1 max-sm:col-span-full rounded-3xl shadow-lg dark:border-[#2f3339] border-2 bg-transparent p-4 flex flex-col gap-4">
          <AppointmentsChart className="w-full" />
          <AppointmentList className="mt-20 w-full" />
        </div>
        
        <MapComponent className="col-start-1 col-span-6 max-xl:col-span-8 row-span-1 max-lg:col-span-full max-md:col-span-12 max-sm:row-start-7 dark:border-[#2f3339] border-2 " />
        
        <CompanyGrowthChart className="row-span-1 col-start-7 col-span-3 max-xl:col-start-9 max-xl:col-span-4 max-lg:col-start-7 max-lg:row-start-2 max-lg:col-span-6 max-md:col-span-12 max-sm:col-span-full dark:border-[#2f3339] border-2 bg-transparent" />
        
        <PatientList className="col-start-1 col-span-9 max-xl:col-span-9 max-lg:col-span-full max-md:col-span-12 max-sm:col-span-full dark:border-[#2f3339] border-2 " />

      </div>
    </>
  );
}
