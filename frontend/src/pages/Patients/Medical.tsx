import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/theme-provider";
import { Search } from "lucide-react";
import { useSidebar } from '@/components/ui/Sidebar';
import doctorsData, { PathologyResult } from "@/data/DoctorsData";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
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
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Filter and flatten data
  const filteredData = flattenPathologyData(search);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / show);
  const paginatedData = filteredData.slice((page - 1) * show, page * show);

  return (
    <div
      className={cn(
        "sm:p-4 md:p-8 w-full p-5 relative",
        "max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto",
        "max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2",
        "max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)]",
        "max-[640px]:overflow-x-scroll scrollbar-custom grid",
        isCollapsed ? "grid-cols-1" : "grid-cols-1",
        theme === "dark" ? "bg-black dark:bg-transparent" : ""
      )}
    >
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-bold text-lg text-red-500">Doctors</span>
          <Select value={show.toString()} onValueChange={v => { setShow(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder="Show" />
            </SelectTrigger>
            <SelectContent>
              {showOptions.map(opt => (
                <SelectItem key={opt} value={opt.toString()}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-40 md:w-48">
              <SelectValue placeholder="This month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m}>{`This month: ${m}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-8 w-40 md:w-64"
              placeholder="Search doctors by name or title"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          {["day", "week", "month"].map(opt => (
            <Button
              key={opt}
              variant={period === opt ? "default" : "outline"}
              onClick={() => setPeriod(opt)}
              className={cn(
                "rounded-full px-4 py-1 text-xs md:text-base",
                period === opt
                  ? "bg-red-500 text-white"
                  : "bg-transparent text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
              )}
            >
              {opt.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto scrollbar-custom">
        <table className="w-full table-auto border-separate border-spacing-y-3 border border-gray-200 dark:border-gray-700 rounded-xl">
          <thead>
            <tr className={`bg-transparent ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              <th className="p-4 text-left border-b border-gray-200 dark:border-gray-700">Doctor</th>
              <th className="p-4 text-left border-b border-gray-200 dark:border-gray-700">File</th>
              <th className="p-4 text-left border-b border-gray-200 dark:border-gray-700">Time</th>
              <th className="p-4 text-left border-b border-gray-200 dark:border-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, idx) => (
              <tr
                key={item.id}
                className={`rounded-lg ${theme === 'dark' ? 'text-white' : 'text-black'} border-b border-gray-200 dark:border-gray-700`}
              >
                <td className="p-4 flex items-center gap-4 border-r border-gray-200 dark:border-gray-700">
                  <div className="max-sm:sr-only">
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.doctor} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold text-sm uppercase">
                        {item.doctor.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <span>{item.doctor}</span>
                </td>
                <td className="p-4 border-r border-gray-200 dark:border-gray-700">{item.file}</td>
                <td className="p-4 font-bold text-[#ff0000] border-r border-gray-200 dark:border-gray-700">{item.time}</td>
                <td className="p-4">
                  <Button
                    className={`px-4 sm:px-8 py-2 sm:py-3 rounded-full font-bold border dark:border-[#2f3339] hover:-translate-y-1 transition duration-300 hover:border-t hover:border-b sm:text-sm text-xs ${
                      theme === 'dark'
                        ? 'bg-background hover:bg-black hover:shadow-[0_2px_0_0_rgba(204,255,0,0.811)] hover:border-[#18E614]'
                        : 'hover:bg-zinc-100 bg-white hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]'
                    }`}
                  >
                    VIEW RESULT
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Showing count */}
      <div className="mt-6 text-xs md:text-sm text-gray-500 dark:text-gray-400">
        Showing {(page - 1) * show + 1} to {Math.min(page * show, filteredData.length)} of {filteredData.length} items
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-end cursor-pointer">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={page === 1 ? undefined : () => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={page === totalPages ? undefined : () => setPage((p) => Math.min(totalPages, p + 1))}
                className={page === totalPages ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default Medical;