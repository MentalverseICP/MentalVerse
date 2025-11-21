import React, { useState } from "react";
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
import { Search, FileText, Calendar, Download, Eye } from "lucide-react";
import doctorsData, { PathologyResult } from "@/data/DoctorsData";
import { motion } from "framer-motion";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const showOptions = [8, 12, 24];

// Flatten all pathology data for filtering and pagination
const flattenPathologyData = (search: string) => {
  const result: {
    id: number;
    doctor: string;
    file: string;
    time: string;
    avatar?: string;
  }[] = [];
  doctorsData.forEach((doctor) => {
    (doctor.pathologyData || []).forEach((p: PathologyResult) => {
      if (
        search === "" ||
        doctor.name.toLowerCase().includes(search.toLowerCase()) ||
        p.file.toLowerCase().includes(search.toLowerCase())
      ) {
        result.push({
          id: p.id,
          doctor: doctor.name,
          file: p.file,
          time: p.time,
          avatar: (doctor as any).avatar || "",
        });
      }
    });
  });
  return result;
};

const Medical: React.FC = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(12);
  const [month, setMonth] = useState("October");
  const [period, setPeriod] = useState("month");
  const [page, setPage] = useState(1);

  // Filter and flatten data
  const filteredData = flattenPathologyData(search);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / show);
  const paginatedData = filteredData.slice((page - 1) * show, page * show);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen lg:p-4 w-full relative 
      max-[640px]:ml-16 max-[640px]:w-[calc(100vw-4rem)] max-[500px]:overflow-x-auto
      max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-4
      max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)]`}
    >
      {/* Main Container */}
      <div
        className={`lg:rounded-3xl overflow-hidden backdrop-blur-xl border transition-all relative p-6 md:p-8 ${
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
        <div
          className={`absolute top-1/4 right-1/4 w-[40rem] h-[40rem] ${
            theme === "dark" ? "bg-[#18e61404]" : "bg-[#18e61408]"
          } rounded-full blur-3xl`}
        />

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
              <FileText className="w-6 h-6 text-[#12B80E]" />
            </div>
            <h1
              className={`text-3xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Medical Records
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
                      : "bg-black/[0.02] border-black/20 text-gray-900"
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

              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger
                  className={`w-40 md:w-48 rounded-lg ${
                    theme === "dark"
                      ? "bg-white/[0.02] border-white/20 text-white"
                      : "bg-black/[0.02] border-black/20 text-gray-900"
                  }`}
                >
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
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
                      : "bg-black/[0.02] border-black/20 text-gray-900 placeholder:text-gray-500"
                  }`}
                  placeholder="Search records..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {["day", "week", "month"].map((opt) => (
                <motion.button
                  key={opt}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPeriod(opt)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    period === opt
                      ? "bg-[#18E614]/40 text-white shadow-lg shadow-[#18E614]/20"
                      : theme === "dark"
                      ? "bg-white/[0.05] border border-white/20 text-gray-300 hover:bg-white/[0.1]"
                      : "bg-black/[0.05] border border-black/20 text-gray-700 hover:bg-black/[0.1]"
                  }`}
                >
                  {opt.toUpperCase()}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Records Table */}
          <div
            className={`overflow-x-auto rounded-xl border border-white/10 mb-8 ${
              theme === "dark" ? "bg-white/[0.02]" : "bg-black/[0.02]"
            }`}
          >
            <table className="w-full">
              <thead>
                <tr
                  className={`border-b border-white/10 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <th className="px-4 py-4 text-left font-semibold">Doctor</th>
                  <th className="px-4 py-4 text-left font-semibold">File</th>
                  <th className="px-4 py-4 text-left font-semibold">Date</th>
                  <th className="px-4 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, idx) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + idx * 0.03 }}
                    className={`border-b border-white/5 hover:bg-white/5 transition-all ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            theme === "dark"
                              ? "bg-[#18E614]/20 text-[#12B80E]"
                              : "bg-[#18E614]/10 text-[#12B80E]"
                          }`}
                        >
                          {item.doctor
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <span className="font-medium text-sm">
                          {item.doctor}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">{item.file}</td>
                    <td
                      className={`px-4 py-4 text-sm font-medium ${
                        theme === "dark" ? "text-[#7FF54A]" : "text-[#12B80E]"
                      }`}
                    >
                      {item.time}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-2 rounded-lg transition-all ${
                            theme === "dark"
                              ? "bg-[#18E614]/20 hover:bg-[#18E614]/30 text-[#7FF54A]"
                              : "bg-[#12B80E]/10 hover:bg-[#12B80E]/20 text-[#12B80E]"
                          }`}
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-2 rounded-lg transition-all ${
                            theme === "dark"
                              ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                              : "bg-blue-100 hover:bg-blue-200 text-blue-600"
                          }`}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-12 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No records found</p>
            </motion.div>
          )}

          {/* Pagination */}
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
              Showing {filteredData.length === 0 ? 0 : (page - 1) * show + 1} to{" "}
              {Math.min(page * show, filteredData.length)} of{" "}
              {filteredData.length}
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

export default Medical;
