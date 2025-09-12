import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/shared/theme-provider";
import { Search } from "lucide-react";
import { toast } from "react-toastify";
import { useSidebar } from '@/components/ui/Sidebar';
import doctorsData, { Doctor } from "@/data/DoctorsData";

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

const Doctors: React.FC<DoctorsProps> = ({ bookedDoctors: bookedDoctorsProp = [] }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [gender, setGender] = useState("all");
  const [show, setShow] = useState(8);
  const [page, setPage] = useState(1);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [bookedDoctors, setBookedDoctors] = useState<number[]>(bookedDoctorsProp);

  // Filter logic
  const filteredDoctors = doctorsData
    .filter((doc) =>
      (status === "all" || doc.status === status) &&
      (gender === "all" || doc.gender === gender) &&
      (search === "" || doc.name.toLowerCase().includes(search.toLowerCase()) || doc.role.toLowerCase().includes(search.toLowerCase()))
    );

  // Pagination logic
  const totalPages = Math.ceil(filteredDoctors.length / show);
  const paginatedDoctors = filteredDoctors.slice((page - 1) * show, page * show);

  // Redirect to chat
  const handleChat = (doctor: Doctor) => {
    navigate(`/chats/${doctor.id}`);
  };

  // Booked function with toast
  const handleBook = (doctor: Doctor) => {
    if (!bookedDoctors.includes(doctor.id)) {
      setBookedDoctors(prev => [...prev, doctor.id]);
      setTimeout(() => {
        toast.success(`You have successfully booked an appointment with ${doctor.name}.`);
      }, 100);
    } else {
      setBookedDoctors(prev => prev.filter(id => id !== doctor.id));
      setTimeout(() => {
        toast.info(`You have unbooked your appointment with ${doctor.name}.`);
      }, 100);
    }
  };

  return (
    <div className={`sm:p-4 md:p-8 w-full p-5 relative 
    max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto
    max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 
    max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)] 
    dark:bg-transparent 
    max-[640px]:overflow-x-scroll scrollbar-custom grid
    ${isCollapsed ? 'grid-cols-1' : 'grid-cols-1'}`}>
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
          <Select value={status} onValueChange={v => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full max-w-xs ">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-8 w-full rounded-lg text-white"
              placeholder="Search doctors by name or role"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {genderOptions.map(opt => (
            <Button
              key={opt.value}
              variant={gender === opt.value ? "default" : "outline"}
              onClick={() => { setGender(opt.value); setPage(1); }}
              className={cn(
                "rounded-full px-4 py-1 text-sm",
                gender === opt.value
                  ? "bg-red-500 text-white"
                  : theme === "dark"
                    ? "bg-transparent text-white border-white"
                    : "bg-transparent text-black border-black"
              )}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {paginatedDoctors.map((doc) => (
          <div
            key={doc.id}
            className={cn(
              "rounded-xl border dark:bg-transparent border-gray-200 dark:border-[#2f3339] p-4 sm:p-6 flex flex-col items-center shadow-md",
              "hover:shadow-lg"
            )}
          >
            <div className="relative mb-4">
              <div className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center",
                "bg-gray-200 dark:bg-gray-700"
              )}>
                <span className="text-3xl text-gray-500 dark:text-gray-300">
                  {doc.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <span
                className={cn(
                  "absolute top-2 right-2 w-3 h-3 rounded-full border-2",
                  doc.status === "online"
                    ? "bg-green-500"
                    : "bg-gray-400",
                  theme === "dark"
                    ? "border-neutral-900"
                    : "border-white"
                )}
                title={doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
              />
            </div>
            <div className="text-center">
              <div className="font-semibold text-black dark:text-white">{doc.name}</div>
              <div className="text-xs text-red-500">{doc.role}</div>
            </div>
            <div className="flex flex-col gap-2 mt-4 w-full">
              <Button
                className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold border dark:border-[#2f3339] hover:-translate-y-1 transition-all duration-300 hover:border-t hover:border-b text-sm ${
                  theme === 'dark'
                    ? 'bg-background hover:bg-black hover:shadow-[0_2px_0_0_rgba(204,255,0,0.811)] hover:border-[#18E614]'
                    : 'hover:bg-zinc-100 bg-white hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]'
                }`}
                onClick={() => handleChat(doc)}
              >
                CHAT
              </Button>
              <button
                type='button'
                onClick={() => handleBook(doc)}
                className={`px-5 sm:px-6 py-2 rounded-full font-bold border dark:border-[#2f3339] hover:-translate-y-1 transition-all duration-300 hover:border-t hover:border-b text-xs ${
                  bookedDoctors.includes(doc.id)
                    ? theme === 'dark'
                      ? 'bg-[#1d1b1b]'
                      : 'bg-zinc-100'
                    : theme === 'dark'
                    ? 'bg-background hover:bg-black hover:shadow-[0_2px_0_0_rgba(204,255,0,0.811)] hover:border-[#18E614]'
                    : 'hover:bg-zinc-100 bg-white hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]'
                }`}
              >
                {bookedDoctors.includes(doc.id) ? 'BOOKED' : 'BOOK'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Showing count */}
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
        {filteredDoctors.length === 0
          ? "No doctors found."
          : <>Showing {(page - 1) * show + 1} to {Math.min(page * show, filteredDoctors.length)} of {filteredDoctors.length} items</>
        }
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center sm:justify-end">
          <Pagination>
            <PaginationContent className="cursor-pointer">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Doctors;