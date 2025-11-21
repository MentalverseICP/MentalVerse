import DiagnosticsChart from "@/components/charts/DiagnosticsChart";
import PatientsChart from "@/components/charts/PatientsChart";
import HealthIndexChart from "@/components/charts/HealthIndexChart";
import AppointmentsChart from "@/components/charts/AppointmentsChart";
import MapComponent from "@/components/charts/MapComponent";
import { ChartRadar } from "@/components/patients/Chart-radar-dots";
import DoctorList from "@/components/patients/DoctorList";
import AppointmentList from "@/components/patients/AppointmentList";
import { motion } from "framer-motion";
import { useTheme } from "@/components/shared/theme-provider";
import { useSidebar } from "@/components/ui/Sidebar";

export default function Home() {
  const { theme } = useTheme();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen ${isCollapsed ? "md:w-full" : ""} max-sm:ml-[4.5rem] max-lg:ml-20 -ml-2 mt-4 mb-4 mr-2 px-2`}
    >
      <div className="grid grid-cols-12 gap-2">
        {/* Left Column */}
        <div className="col-span-12 xl:col-span-9 flex flex-col">
          <div className="space-y-3 lg:space-y-2">
            {/* Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="h-80"
              >
                <DiagnosticsChart
                  className={`h-full rounded-3xl ${
                    theme === "dark"
                      ? "bg-[#0B0B0C]/60 border border-white/10"
                      : "bg-white/60 border border-black/10"
                  } backdrop-blur-xl`}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="h-80"
              >
                <PatientsChart
                  className={`h-full rounded-3xl ${
                    theme === "dark"
                      ? "bg-[#0B0B0C]/60 border border-white/10"
                      : "bg-white/60 border border-black/10"
                  } backdrop-blur-xl`}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="h-80 max-md:col-span-1 max-lg:col-span-2"
              >
                <HealthIndexChart
                  className={`h-full rounded-3xl ${
                    theme === "dark"
                      ? "bg-[#0B0B0C]/60 border border-white/10"
                      : "bg-white/60 border border-black/10"
                  } backdrop-blur-xl`}
                />
              </motion.div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 h-96"
              >
                <MapComponent
                  className={`h-full rounded-3xl ${
                    theme === "dark"
                      ? "bg-[#0B0B0C]/60 border border-white/10"
                      : "bg-white/60 border border-black/10"
                  } backdrop-blur-xl`}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="h-96"
              >
                <ChartRadar
                  className={`h-full rounded-3xl ${
                    theme === "dark"
                      ? "bg-[#0B0B0C]/60 border border-white/10"
                      : "bg-white/60 border border-black/10"
                  } backdrop-blur-xl`}
                />
              </motion.div>
            </div>

            {/* Bottom Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full"
            >
              <DoctorList
                className={`rounded-3xl ${
                  theme === "dark"
                    ? "bg-[#0B0B0C]/60 border border-white/10"
                    : "bg-white/60 border border-black/10"
                } backdrop-blur-xl`}
              />
            </motion.div>
          </div>
        </div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="col-span-12 xl:col-span-3 rounded-3xl relative overflow-hidden flex flex-col self-start lg:sticky lg:top-4"
        >
          <div
            className={`absolute inset-0 rounded-3 ${
              theme === "dark" ? "bg-[#0B0B0C]/60 border border-white/10" : "bg-white/60 border border-black/10"
            } backdrop-blur-xl`}
          />
          <div className="absolute inset-0 rounded-3xl border border-white/10" />
      
      {/* Corner glows */}
      <div className="absolute top-0 -left-8 w-40 h-40 bg-[#F80D38]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-8 w-40 h-40 bg-[#FECA57]/10 rounded-full blur-3xl" />
      
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="relative p-4 flex flex-col gap-4 h-[77rem]">
            <AppointmentsChart className="w-full h-1/3 flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
              <AppointmentList className="w-full h-full overflow-y-auto scrollbar-custom" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}