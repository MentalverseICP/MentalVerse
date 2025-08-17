import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import chats from '@/images/Chats Icon.svg'
import { useTheme } from '../theme-provider';
import doctorsData, { Doctor } from '@/data/DoctorsData';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface prop {
  className: string;
}

const DoctorList: React.FC<prop> = ({className}) => {
  const [doctors, setDoctors] = useState<Doctor[]>(doctorsData);
  const [selectedGender, setSelectedGender] = useState<'All' | 'Men' | 'Women'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const doctorsPerPage = 3;
  const {theme} = useTheme();

  const handleBookClick = (id: number) => {
    setDoctors((prevDoctors) =>
      prevDoctors.map((doctor) =>
        doctor.id === id
          ? {
              ...doctor,
              booked: !doctor.booked,
              appointments: doctor.booked ? doctor.appointments - 1 : doctor.appointments + 1,
            }
          : doctor
      )
    );
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      (selectedGender === 'All' || doctor.gender === selectedGender) &&
      (doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doctor.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
  const paginatedDoctors = filteredDoctors.slice((page - 1) * doctorsPerPage, page * doctorsPerPage);

  return (
    <div className={`bg-transparent p-6 rounded-3xl shadow-md border w-full ${className}`}>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h1 className="uppercase font-bold text-xs max-lg:text-md mr-5 sm:mr-10 lg:mr-20">
          DOCTORS
        </h1>
        <div className="flex-grow flex items-center rounded-md p-1 bg-transparent shadow-sm overflow-hidden dark:border-[#2f3339] border-2">
          <Search className="h-4 w-4 flex-none text-gray-500 dark:text-gray-400 ml-3" />
          <input
            type="text"
            placeholder="Search doctors by name or role"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-500 py-2 px-3 text-sm"
            value={searchTerm}
          />
        </div>

        <div className="flex rounded-md overflow-hidden dark:border-[#2f3339] border-2">
          {['All', 'Men', 'Women'].map((gender) => (
            <button
              type='button'
              key={gender}
              onClick={() => setSelectedGender(gender as 'All' | 'Men' | 'Women')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                selectedGender === gender ? 'bg-[#F80D38] text-white' : 'border-x dark:border-[#2f3339]'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto scrollbar-custom">
        <table className="w-full table-auto border-separate border-spacing-y-3">
          <thead>
            <tr className={`bg-transparent ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Booked Appointments</th>
              <th className="p-4 text-left">Chat</th>
              <th className="p-4 text-left">Book New Appointments</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDoctors.map((doctor) => (
              <tr
                key={doctor.id}
                className={`rounded-lg ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}
              >
                <td className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full lg:flex lg:items-center lg:justify-center text-gray-500 dark:text-gray-300 font-bold text-sm uppercase hidden">
                    {doctor.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  {doctor.name}
                </td>
                <td className="p-4">{doctor.role}</td>
                <td className="p-4 text-[#ff0000] font-bold">{doctor.appointments}</td>
                <td className="p-4">
                  <Link to={`/chats/${doctor.id}`}>
                    <button type='button' className="text-red-500 hover:text-red-700">
                      <img src={chats} alt="Chat" className='hover:w-5 hover:h-5 hover:transition-all' />
                    </button>
                  </Link>
                </td>
                <td className="p-4">
                  <button
                    type='button'
                    onClick={() => handleBookClick(doctor.id)}
                    className={`px-5 sm:px-6 py-2 rounded-full font-bold border hover:-translate-y-1 transition-all duration-300 hover:border-t hover:border-b text-xs ${
                      doctor.booked
                        ? theme === 'dark'
                          ? 'bg-[#1d1b1b]'
                          : 'bg-zinc-100'
                        : theme === 'dark'
                        ? 'bg-background hover:bg-black hover:shadow-[0_2px_0_0_rgba(204,255,0,0.811)] hover:border-[#18E614]'
                        : 'hover:bg-zinc-100 bg-white hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]'
                    }`}
                  >
                    {doctor.booked ? 'BOOKED' : 'BOOK'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-end">
        <Pagination>
          <PaginationContent className='cursor-pointer'>
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

      <Link to={'/doctors'} className="mt-6 flex justify-center">
        <button
          type='button'
          className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold border hover:-translate-y-1 transition-all duration-300 hover:border-t hover:border-b text-sm ${
            theme === 'dark'
              ? 'bg-background hover:bg-black hover:shadow-[0_2px_0_0_rgba(204,255,0,0.811)] hover:border-[#18E614]'
              : 'hover:bg-zinc-100 bg-white hover:border-black hover:shadow-[0_2px_0_0_rgba(0,0,0,0.811)]'
          }`}
        >
          GO TO DOCTORS
        </button>
      </Link>
    </div>
  );
};

export default DoctorList;