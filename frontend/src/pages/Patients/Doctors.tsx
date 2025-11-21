import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTheme } from "@/components/shared/theme-provider";
import { Search, MessageCircle, BookOpen, Activity } from "lucide-react";
import { toast } from "react-toastify";
import doctorsData, { Doctor } from "@/data/DoctorsData";
import { motion } from "framer-motion";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];

const genderOptions = [
  { value: "all", label: "All" },
  { value: "Men", label: "Men" },
  { value: "Women", label: "Women" },
];

const showOptions = [8, 16, 24];

interface DoctorsProps {
  bookedDoctors?: number[];
}

const Doctors: React.FC<DoctorsProps> = ({
  bookedDoctors: bookedDoctorsProp = [],
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [gender, setGender] = useState("all");
  const [show, setShow] = useState(8);
  const [page, setPage] = useState(1);
  const [bookedDoctors, setBookedDoctors] =
    useState<number[]>(bookedDoctorsProp);

  // Filter logic
  const filteredDoctors = doctorsData.filter(
    (doc) =>
      (status === "all" || doc.status === status) &&
      (gender === "all" || doc.gender === gender) &&
      (search === "" ||
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.role.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredDoctors.length / show);
  const paginatedDoctors = filteredDoctors.slice(
    (page - 1) * show,
    page * show
  );

  // Redirect to chat
  const handleChat = (doctor: Doctor) => {
    navigate(`/chats/${doctor.id}`);
  };

  // Booked function with toast
  const handleBook = (doctor: Doctor) => {
    if (!bookedDoctors.includes(doctor.id)) {
      setBookedDoctors((prev) => [...prev, doctor.id]);
      setTimeout(() => {
        toast.success(
          `You have successfully booked an appointment with ${doctor.name}.`
        );
      }, 100);
    } else {
      setBookedDoctors((prev) => prev.filter((id) => id !== doctor.id));
      setTimeout(() => {
        toast.info(`You have unbooked your appointment with ${doctor.name}.`);
      }, 100);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen sm:p-4 md:p-8 w-full p-5 relative 
      max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto
      max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 
      max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)]`}
    >
      {/* Main Container with glassmorphic background */}
      <div
        className={`rounded-3xl overflow-hidden backdrop-blur-xl border transition-all p-6 md:p-8 ${
          theme === "dark"
            ? "border-white/10 bg-[#0B0B0C]/60"
            : "border-black/15 bg-white/60"
        }`}
      >
        {/* Corner accent glows */}
        <div
          className={`absolute top-0 -left-20 w-40 h-40 ${
            theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
          } rounded-full blur-3xl`}
        />
        <div
          className={`absolute -bottom-20 -right-20 w-40 h-40 ${
            theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
          } rounded-full blur-3xl`}
        />
        <div
          className={`absolute bottom-0 -left-20 w-40 h-40 ${
            theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
          } rounded-full blur-3xl`}
        />
        <div
          className={`absolute -top-20 -right-20 w-40 h-40 ${
            theme === "dark" ? "bg-[#18E614]/10" : "bg-[#18E614]/30"
          } rounded-full blur-3xl`}
        />
        <div className="absolute top-1/4 right-1/4 w-[40rem] h-[40rem] bg-[#18e61404] rounded-full blur-3xl" />

        {/* Top gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className={`p-3 rounded-lg ${
                theme === "dark" ? "bg-[#18E614]/20" : "bg-[#18E614]/10"
              }`}
            >
              <Activity className="w-6 h-6 text-[#12B80E]" />
            </div>
            <h1
              className={`text-3xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Medical Professionals
            </h1>
          </div>

          {/* Filter Bar */}
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 pb-6 border-b ${
              theme === "dark" ? "border-white/10" : "border-black/10"
            }`}
          >
            <div className="flex flex-wrap gap-3 items-center">
              <Select
                value={show.toString()}
                onValueChange={(v) => {
                  setShow(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger
                  className={`w-24 rounded-lg ${
                    theme === "dark"
                      ? "bg-white/[0.02] border-white/20 text-white"
                      : "bg-black/[0.05] border-black/15 text-gray-900"
                  }`}
                >
                  <SelectValue placeholder="Show" />
                </SelectTrigger>
                <SelectContent>
                  {showOptions.map((opt) => (
                    <SelectItem key={opt} value={opt.toString()}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  className={`w-28 rounded-lg ${
                    theme === "dark"
                      ? "bg-white/[0.02] border-white/20 text-white"
                      : "bg-black/[0.05] border-black/15 text-gray-900"
                  }`}
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className={`pl-10 rounded-lg ${
                    theme === "dark"
                      ? "bg-white/[0.02] border-white/20 text-white placeholder:text-gray-500"
                      : "bg-black/[0.05] border-black/15 text-gray-900 placeholder:text-gray-600"
                  }`}
                  placeholder="Search doctors..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {genderOptions.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setGender(opt.value);
                    setPage(1);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    gender === opt.value
                      ? "bg-[#18E614]/40 text-white shadow-lg shadow-[#18E614]/20"
                      : theme === "dark"
                      ? "bg-white/[0.05] border border-white/20 text-gray-300 hover:bg-white/[0.1]"
                      : "bg-black/[0.08] border border-black/20 text-gray-800 hover:bg-black/[0.12]"
                  }`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
            {paginatedDoctors.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                whileHover={{ y: -4 }}
                className={`rounded-2xl overflow-hidden backdrop-blur-lg border transition-all p-4 md:p-6 flex flex-col items-center ${
                  theme === "dark"
                    ? "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
                    : "border-black/10 bg-black/[0.04] hover:bg-black/[0.07]"
                }`}
              >
                {/* Doctor Avatar */}
                <div className="relative mb-4">
                  <div
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center font-bold text-lg md:text-2xl ${
                      theme === "dark"
                        ? "bg-[#18E614]/15 to-[#12B80E]/10 text-[#12B80E]"
                        : "bg-[#18E614]/10 to-[#7FF54A]/5 text-[#12B80E]"
                    }`}
                  >
                    {doc.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <span
                    className={`absolute top-0 right-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      doc.status === "online"
                        ? "bg-[#18E614] border-white"
                        : "bg-gray-400 border-white"
                    }`}
                  />
                </div>

                {/* Doctor Info */}
                <div className="text-center mb-4 w-full">
                  <h3
                    className={`font-bold text-base md:text-lg ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {doc.name}
                  </h3>
                  <p
                    className={`text-xs md:text-sm font-medium mt-1 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {doc.role}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      doc.status === "online"
                        ? "text-[#18E614] font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    {doc.status === "online" ? "● Online" : "● Offline"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChat(doc)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      theme === "dark"
                        ? "bg-[#18E614]/40 text-white hover:shadow-lg hover:shadow-[#18E614]/20"
                        : "bg-[#18E614]/40 text-white hover:shadow-lg hover:shadow-[#18E614]/20"
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBook(doc)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
                      bookedDoctors.includes(doc.id)
                        ? theme === "dark"
                          ? "bg-[#18E614]/20 border-[#18E614]/40 text-[#18E614]"
                          : "bg-[#18E614]/15 border-[#18E614]/30 text-[#12B80E]"
                        : theme === "dark"
                        ? "bg-white/[0.02] border-white/20 text-gray-300 hover:bg-white/[0.05]"
                        : "bg-black/[0.05] border-black/20 text-gray-700 hover:bg-black/[0.08]"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    {bookedDoctors.includes(doc.id) ? "Booked" : "Book"}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No results message */}
          {filteredDoctors.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-12 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No doctors found</p>
            </motion.div>
          )}

          {/* Pagination Section */}
          <div
            className={`mt-8 pt-6 border-t ${
              theme === "dark" ? "border-white/10" : "border-black/10"
            }`}
          >
            <div
              className={`text-sm mb-4 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Showing {filteredDoctors.length === 0 ? 0 : (page - 1) * show + 1}{" "}
              to {Math.min(page * show, filteredDoctors.length)} of{" "}
              {filteredDoctors.length}
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent className="cursor-pointer">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={
                        page === 1
                          ? undefined
                          : () => setPage((p) => Math.max(1, p - 1))
                      }
                      className={
                        page === 1
                          ? "opacity-50 cursor-not-allowed pointer-events-none"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={page === pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`rounded-lg ${
                            page === pageNum
                              ? "bg-[#18E614] text-white"
                              : theme === "dark"
                              ? "hover:bg-white/[0.05]"
                              : "hover:bg-black/[0.05]"
                          }`}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={
                        page === totalPages
                          ? undefined
                          : () => setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        page === totalPages
                          ? "opacity-50 cursor-not-allowed pointer-events-none"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Doctors;
