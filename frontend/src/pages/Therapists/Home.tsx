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
        className={`grid grid-cols-12 h-screen max-sm:ml-[4.5rem] max-lg:ml-20 mt-4 mb-4 mr-2 ${
          isCollapsed
            ? "gap-2 lg:gap-3 xl:gap-4 w-full max-md:w-fit md:pr-4 md:pl-2"
            : "gap-2 lg:gap-3 xl:gap-4 px-2"
        }`}
      >
        {/* Left Column - Appointments (3 columns) */}
        <div className="col-span-12 lg:col-span-3 rounded-3xl shadow-lg dark:border-[#2f3339] border-2 bg-transparent p-4 flex flex-col gap-4 overflow-hidden">
          <AppointmentsChart className="w-full h-1/3 flex-shrink-0" />
          <div className="flex-1 overflow-hidden">
            <AppointmentList className="w-full h-full overflow-y-auto scrollbar-custom" />
          </div>
        </div>

        {/* Main Content Grid - Right Side */}
        <div className="col-span-12 lg:col-span-9 grid grid-cols-3 gap-2 lg:gap-3 xl:gap-4 overflow-y-auto scrollbar-custom">
          <DiagnosticsChart className="col-start-1 col-span-3 max-xl:col-span-4 max-lg:col-span-6 max-md:col-span-12 max-sm:col-span-full dark:border-[#2f3339] border-2 bg-transparent h-80" />
          
          <PatientsChart className="col-start-1 col-span-3 max-xl:col-span-4 max-lg:col-span-6 max-md:col-span-12 max-sm:col-span-full dark:border-[#2f3339] border-2 bg-transparent h-80" />
          
          <HealthIndexChart className="col-start-1 col-span-3 max-xl:col-span-4 max-lg:col-span-6 max-md:col-span-12 max-sm:col-span-full dark:border-[#2f3339] border-2 bg-transparent h-80" />
          
          <MapComponent className="col-start-1 col-span-2 max-lg:col-span-full max-md:col-span-12 max-sm:col-span-full dark:border-[#2f3339] border-2 h-96" />
          
          <CompanyGrowthChart className="col-span-1 max-lg:col-span-full max-md:col-span-12 max-sm:col-span-full dark:border-[#2f3339] border-2 bg-transparent h-96" />
          
          <PatientList className="col-start-1 col-span-3 max-lg:col-span-full max-md:col-span-12 max-sm:col-span-full dark:border-[#2f3339] border-2" />
        </div>
      </div>
    </>
  );
}
