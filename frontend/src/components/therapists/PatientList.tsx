import React, { useState } from "react";
import { Search, Calendar, User, MessageCircle } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  condition: string;
  lastVisit: string;
  nextAppointment: string;
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
}

const mockPatients: Patient[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    age: 28,
    gender: "Female",
    condition: "Anxiety Disorder",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-01-22",
    status: 'active',
    avatar: "SJ"
  },
  {
    id: 2,
    name: "Michael Chen",
    age: 35,
    gender: "Male",
    condition: "Depression",
    lastVisit: "2024-01-10",
    nextAppointment: "2024-01-25",
    status: 'active',
    avatar: "MC"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    age: 42,
    gender: "Female",
    condition: "PTSD",
    lastVisit: "2024-01-08",
    nextAppointment: "2024-01-30",
    status: 'active',
    avatar: "ER"
  },
  {
    id: 4,
    name: "David Thompson",
    age: 31,
    gender: "Male",
    condition: "Bipolar Disorder",
    lastVisit: "2024-01-05",
    nextAppointment: "2024-02-01",
    status: 'pending',
    avatar: "DT"
  },
  {
    id: 5,
    name: "Lisa Wang",
    age: 29,
    gender: "Female",
    condition: "OCD",
    lastVisit: "2024-01-12",
    nextAppointment: "2024-01-28",
    status: 'active',
    avatar: "LW"
  }
];

interface PatientListProps {
  className: string;
}

const PatientList: React.FC<PatientListProps> = ({ className }) => {
  const [patients] = useState<Patient[]>(mockPatients);
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Active" | "Inactive" | "Pending">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const patientsPerPage = 5;

  const handleStatusFilter = (status: "All" | "Active" | "Inactive" | "Pending") => {
    setSelectedStatus(status);
    setPage(1);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      (selectedStatus === "All" || patient.status === selectedStatus.toLowerCase()) &&
      (patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.condition.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (page - 1) * patientsPerPage,
    page * patientsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#18E614] text-white';
      case 'inactive':
        return 'bg-gray-500 text-white';
      case 'pending':
        return 'bg-[#F80D38] text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div
      className={`bg-transparent p-6 rounded-3xl shadow-md border w-full ${className}`}
    >
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h1 className="uppercase font-bold text-xs max-lg:text-md mr-5 sm:mr-10 lg:mr-20">
          PATIENTS
        </h1>
        <div className="flex-grow flex items-center rounded-md p-1 bg-transparent shadow-sm overflow-hidden dark:border-[#2f3339] border-2">
          <Search className="h-4 w-4 flex-none text-gray-500 dark:text-gray-400 ml-3" />
          <input
            type="text"
            placeholder="Search patients by name or condition"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-500 py-2 px-3 text-sm"
            value={searchTerm}
          />
        </div>

        <div className="flex rounded-md overflow-hidden dark:border-[#2f3339] border-2">
          {["All", "Active", "Inactive", "Pending"].map((status) => (
            <button
              type="button"
              key={status}
              onClick={() => handleStatusFilter(status as any)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                selectedStatus === status
                  ? "bg-[#18E614] text-white"
                  : "border-x dark:border-[#2f3339]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto scrollbar-custom">
        <table className="w-full table-auto border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left">
              <th className="pb-2 text-xs max-sm:text-[10px] font-semibold text-muted-foreground">Patient</th>
              <th className="pb-2 text-xs max-sm:text-[10px] font-semibold text-muted-foreground">Condition</th>
              <th className="pb-2 text-xs max-sm:text-[10px] font-semibold text-muted-foreground">Last Visit</th>
              <th className="pb-2 text-xs max-sm:text-[10px] font-semibold text-muted-foreground">Next Appointment</th>
              <th className="pb-2 text-xs max-sm:text-[10px] font-semibold text-muted-foreground">Status</th>
              <th className="pb-2 text-xs max-sm:text-[10px] font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.map((patient) => (
              <tr key={patient.id} className="bg-background rounded-lg">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 max-sm:w-8 max-sm:h-8 bg-[#18E614] rounded-full flex items-center justify-center text-white font-semibold text-sm max-sm:text-xs">
                      {patient.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm max-sm:text-xs">{patient.name}</div>
                      <div className="text-sm max-sm:text-xs text-muted-foreground">
                        {patient.age} years • {patient.gender}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm max-sm:text-xs text-foreground">{patient.condition}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm max-sm:text-xs text-muted-foreground">{patient.lastVisit}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm max-sm:text-xs text-foreground">{patient.nextAppointment}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs max-sm:text-[10px] font-medium ${getStatusColor(patient.status)}`}>
                    {getStatusText(patient.status)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button className="p-2 text-[#18E614] hover:bg-[#18E614]/10 rounded-lg transition-colors">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-[#F80D38] hover:bg-[#F80D38]/10 rounded-lg transition-colors">
                      <Calendar className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-[#6366F1] hover:bg-[#6366F1]/10 rounded-lg transition-colors">
                      <User className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setPage(pageNum)}
                    isActive={page === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default PatientList;
