import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import chats from "@/images/Chats Icon.svg";
import { useTheme } from "@/components/shared/theme-provider";
import doctorsData, { Doctor } from "@/data/DoctorsData";

interface prop {
  className: string;
}

const DoctorList: React.FC<prop> = ({ className }) => {
  const [doctors, setDoctors] = useState<Doctor[]>(doctorsData);
  const [selectedGender, setSelectedGender] = useState<"All" | "Men" | "Women">(
    "All"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const doctorsPerPage = 3;
  const { theme } = useTheme();

  const handleBookClick = (id: number) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.id === id
          ? {
              ...doctor,
              booked: !doctor.booked,
              appointments: doctor.booked
                ? doctor.appointments - 1
                : doctor.appointments + 1,
            }
          : doctor
      )
    );
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      (selectedGender === "All" || doctor.gender === selectedGender) &&
      (doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (page - 1) * doctorsPerPage,
    page * doctorsPerPage
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className={`relative rounded-3xl overflow-hidden ${className}`}
    >
      {/* Glassmorphic background */}
      <div
        className={`absolute inset-0 ${
          theme === "dark" ? "bg-[#0B0B0C]/80" : "bg-white/80"
        } backdrop-blur-xl`}
      />

      {/* Border */}
      <div className="absolute inset-0 rounded-3xl border border-white/10" />

      {/* Corner accent glows */}
      <div className="absolute top-0 -left-20 w-40 h-40 bg-[#18E614]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#18E614]/10 rounded-full blur-3xl" />

      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center gap-4 mb-6"
        >
          <h1 className="uppercase font-bold text-lg text-white">👨‍⚕️ Doctors</h1>

          <div
            className={`flex-grow flex items-center rounded-xl p-2 overflow-hidden ${
              theme === "dark"
                ? "bg-white/[0.02] border border-white/10"
                : "bg-black/[0.02] border border-black/10"
            } backdrop-blur-md shadow-sm`}
          >
            <Search className="h-5 w-5 flex-none text-gray-500 dark:text-gray-400 ml-3" />
            <input
              type="text"
              placeholder="Search doctors..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-300 py-2 px-4 text-sm placeholder:text-gray-500"
              value={searchTerm}
            />
          </div>

          <div
            className={`flex rounded-xl overflow-hidden ${
              theme === "dark"
                ? "bg-white/[0.02] border border-white/10"
                : "bg-black/[0.02] border border-black/10"
            } backdrop-blur-md`}
          >
            {["All", "Men", "Women"].map((gender) => (
              <motion.button
                key={gender}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSelectedGender(gender as "All" | "Men" | "Women")
                }
                className={`px-4 py-2 text-xs font-bold transition-all ${
                  selectedGender === gender
                    ? "bg-[#18E614]/40 text-white"
                    : theme === "dark"
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {gender}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="w-full overflow-x-auto scrollbar-custom max-h-96">
          <table className="w-full">
            <thead>
              <tr
                className={`border-b ${
                  theme === "dark"
                    ? "border-white/10 text-gray-300"
                    : "border-black/10 text-gray-700"
                }`}
              >
                <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase font-bold tracking-wider">
                  Appointments
                </th>
                <th className="px-4 py-3 text-center text-xs uppercase font-bold tracking-wider">
                  Chat
                </th>
                <th className="px-4 py-3 text-center text-xs uppercase font-bold tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedDoctors.map((doctor, index) => (
                <motion.tr
                  key={doctor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b ${
                    theme === "dark"
                      ? "border-white/5 hover:bg-white/[0.02]"
                      : "border-black/5 hover:bg-black/[0.02]"
                  } transition-colors`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          theme === "dark"
                            ? "bg-gradient-to-br from-[#18E614]/30 to-[#18E614]/20 border border-[#18E614]/40"
                            : "bg-gradient-to-br from-[#18E614]/20 to-[#18E614]/10 border border-[#18E614]/20"
                        }`}
                      >
                        {doctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p
                          className={`font-semibold text-sm ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {doctor.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td
                    className={`px-4 py-3 text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {doctor.role}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#18E614]/20 text-[#12B80E] border border-[#18E614]/40">
                      {doctor.appointments}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link to={`/chats/${doctor.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-all"
                      >
                        <img src={chats} alt="Chat" className="w-5 h-5" />
                      </motion.button>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBookClick(doctor.id)}
                      className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all ${
                        doctor.booked
                          ? theme === "dark"
                            ? "bg-white/5 border border-white/10 text-gray-500"
                            : "bg-black/5 border border-black/10 text-gray-500"
                          : theme === "dark"
                          ? "bg-gradient-to-r from-[#18E614] to-[#12B80E] text-white hover:shadow-lg hover:shadow-[#18E614]/40"
                          : "bg-gradient-to-r from-[#18E614] to-[#12B80E] text-white hover:shadow-lg hover:shadow-[#18E614]/30"
                      }`}
                    >
                      {doctor.booked ? "BOOKED" : "BOOK"}
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              page === 1
                ? "opacity-50 cursor-not-allowed"
                : theme === "dark"
                ? "bg-white/10 hover:bg-white/20"
                : "bg-black/10 hover:bg-black/20"
            }`}
          >
            ← Previous
          </motion.button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                  page === i + 1
                    ? "bg-[#18E614]/40 text-white"
                    : theme === "dark"
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-black/10 hover:bg-black/20"
                }`}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              page === totalPages
                ? "opacity-50 cursor-not-allowed"
                : theme === "dark"
                ? "bg-white/10 hover:bg-white/20"
                : "bg-black/10 hover:bg-black/20"
            }`}
          >
            Next →
          </motion.button>
        </div>

        <Link to={"/doctors"} className="mt-8 flex justify-center">
          <motion.button
            type="button"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
              theme === "dark"
                ? "bg-gradient-to-r from-[#18E614] to-[#12B80E] text-white hover:shadow-lg hover:shadow-[#18E614]/40"
                : "bg-gradient-to-r from-[#18E614] to-[#12B80E] text-white hover:shadow-lg hover:shadow-[#18E614]/30"
            }`}
          >
            View All Doctors →
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

export default DoctorList;
