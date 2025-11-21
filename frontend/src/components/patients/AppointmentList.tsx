import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/shared/theme-provider";
import { Link } from "react-router-dom";

interface prop {
  className?: string;
}

type Appointment = {
  doctor: string;
  type: string;
  date: string;
  typeColor: string;
};

const upcomingAppointments: Appointment[] = [
  {
    doctor: "Dr. Sarah Johnson",
    type: "Video Call",
    date: "Mon, Dec 11",
    typeColor: "#18e614",
  },
  {
    doctor: "Dr. Michael Chen",
    type: "Phone Call",
    date: "Tues, Dec 12",
    typeColor: "#ffc107",
  },
  {
    doctor: "Dr. Emily Rodriguez",
    type: "In-Person",
    date: "Wed, Dec 13",
    typeColor: "#6366F1",
  },
  {
    doctor: "Dr. David Thompson",
    type: "Video Call",
    date: "Thurs, Dec 14",
    typeColor: "#18e614",
  },
  {
    doctor: "Dr. Lisa Wang",
    type: "Phone Call",
    date: "Fri, Dec 15",
    typeColor: "#ffc107",
  },
  {
    doctor: "Dr. Ibrahim Yekeni",
    type: "Emergency",
    date: "Tues, Oct 24",
    typeColor: "#18e614",
  },
  {
    doctor: "Dr. Ebuka Kelechi",
    type: "Examination",
    date: "Mon, Nov 2",
    typeColor: "#ffc107",
  },
  {
    doctor: "Dr. Bridget Olowojoje",
    type: "Consultation",
    date: "Fri, Nov 13",
    typeColor: "#129a1b",
  },
  {
    doctor: "Dr. Michael Stewart",
    type: "Routine Checkup",
    date: "Thurs, Dec 9",
    typeColor: "#ff0000",
  },
];

const previousAppointments: { [key: string]: Appointment[] } = {
  day: [
    {
      doctor: "Dr. Seut Tom",
      type: "Sick Visit",
      date: "Fr, Aug 11",
      typeColor: "#17a2b8",
    },
    {
      doctor: "Dr. Ebuka Kelechi",
      type: "Examination",
      date: "Wed, July 12",
      typeColor: "#ffc107",
    },
    {
      doctor: "Dr. Bridget Olowojeje",
      type: "Consultation",
      date: "Tues, July 30",
      typeColor: "#129a1b",
    },
    {
      doctor: "Dr. Michael Stewart",
      type: "Routine Checkup",
      date: "Thurs, Dec 9",
      typeColor: "#ff0000",
    },
    {
      doctor: "Dr. Ibrahim Yekeni",
      type: "Emergency",
      date: "Tues, Oct 24",
      typeColor: "#18e614",
    },
  ],
  week: [
    {
      doctor: "Dr. Amina Ahmed",
      type: "Consultation",
      date: "Tues, July 30",
      typeColor: "#129a1b",
    },
    {
      doctor: "Dr. Ibrahim Yekeni",
      type: "Examination",
      date: "Wed, July 12",
      typeColor: "#ffc107",
    },
    {
      doctor: "Dr. Seut Tom",
      type: "Sick Visit",
      date: "Fr, Aug 11",
      typeColor: "#17a2b8",
    },
    {
      doctor: "Dr. Bridget Olowojeje",
      type: "Consultation",
      date: "Tues, July 30",
      typeColor: "#129a1b",
    },
  ],
  month: [
    {
      doctor: "Dr. Ibrahim Yekeni",
      type: "Examination",
      date: "Wed, July 12",
      typeColor: "#ffc107",
    },
    {
      doctor: "Dr. Banabas Paul",
      type: "Emergency",
      date: "Mon, June 14",
      typeColor: "#14e649",
    },
    {
      doctor: "Dr. Michael Stewart",
      type: "Routine Checkup",
      date: "Thurs, Dec 9",
      typeColor: "#ff0000",
    },
    {
      doctor: "Dr. Ebuka Kelechi",
      type: "Examination",
      date: "Wed, July 12",
      typeColor: "#ffc107",
    },
  ],
};

const AppointmentList: React.FC<prop> = ({ className }) => {
  const [tab, setTab] = useState<"day" | "week" | "month">("day");
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full h-full flex flex-col ${className}`}
    >
      <div
        className={`relative h-full flex flex-col`}
      >
        {/* <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" /> */}
        {/* <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" /> */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative space-y-6 pt-4">
          <div className="relative">
            <h2
              className={`uppercase font-bold text-sm mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              📅 Upcoming Appointments
            </h2>
            <div className="space-y-2 pr-2 overflow-y-auto scrollbar-custom">
              {upcomingAppointments.map((appointment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  className={`relative rounded-xl p-4 overflow-hidden group cursor-pointer ${
                    theme === "dark"
                      ? "bg-white/[0.03] hover:bg-white/[0.06]"
                      : "bg-black/[0.02] hover:bg-black/[0.05]"
                  } border border-white/5 hover:border-white/10 transition-all`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#18E614]/10 rounded-full blur-2xl" />
                  </div>

                  <div className="relative flex justify-between items-center">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          theme === "dark"
                            ? "bg-gradient-to-br from-[#18E614]/15 to-[#12B80E]/10 border border-[#18E614]/25"
                            : "bg-gradient-to-br from-[#18E614]/10 to-[#7FF54A]/5 border border-[#18E614]/15"
                        }`}
                      >
                        {appointment.doctor
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-bold text-sm ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {appointment.doctor}
                        </p>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: appointment.typeColor }}
                        >
                          {appointment.type}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-xs flex-shrink-0 ml-2 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-600"
                      }`}
                    >
                      {appointment.date}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative pt-4 border-t border-white/5">
            <h2
              className={`uppercase font-bold text-sm mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              📋 Previous Appointments
            </h2>

            <div
              className={`relative flex rounded-xl overflow-hidden mb-4 ${
                theme === "dark"
                  ? "bg-white/[0.02] border border-white/10"
                  : "bg-black/[0.02] border border-black/10"
              } backdrop-blur-md`}
            >
              {(["day", "week", "month"] as const).map((tabName) => (
                <motion.button
                  key={tabName}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-3 py-2 uppercase text-xs font-bold transition-all ${
                    tab === tabName
                      ? "bg-[#18E614]/40 text-white"
                      : theme === "dark"
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setTab(tabName)}
                >
                  {tabName}
                </motion.button>
              ))}
            </div>

            <div className="space-y-2">
              {previousAppointments[tab].map((appointment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  className={`relative rounded-xl p-4 overflow-hidden group cursor-pointer ${
                    theme === "dark"
                      ? "bg-white/[0.03] hover:bg-white/[0.06]"
                      : "bg-black/[0.02] hover:bg-black/[0.05]"
                  } border border-white/5 hover:border-white/10 transition-all`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
                  </div>

                  <div className="relative flex justify-between items-center">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          theme === "dark"
                            ? "bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/40"
                            : "bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200"
                        }`}
                      >
                        {appointment.doctor
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-bold text-sm ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {appointment.doctor}
                        </p>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: appointment.typeColor }}
                        >
                          {appointment.type}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-xs flex-shrink-0 ml-2 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-600"
                      }`}
                    >
                      {appointment.date}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-4 border-t border-white/5 text-center"
          >
            <Link
              to="/appointments"
              className={`text-sm font-semibold hover:translate-x-1 inline-block transition-all ${
                theme === "dark"
                  ? "text-[#7FF54A] hover:text-[#18E614]"
                  : "text-[#12B80E] hover:text-[#18E614]"
              }`}
            >
              View All Appointments →
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AppointmentList;
