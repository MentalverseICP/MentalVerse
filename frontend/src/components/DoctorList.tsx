import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import chats from '@/assets/Chats Icon.svg'
import { useTheme } from './theme-provider';

interface prop {
  className: string;
}

interface Doctor {
  name: string;
  role: string;
  appointments: number;
  id: number;
  gender: 'Men' | 'Women';
  booked: boolean;
}

const doctorsData: Doctor[] = [
  { id: 1, name: 'Dr. Ibrahim Yekeni', role: 'Heart Surgeon', appointments: 0, gender: 'Men', booked: false },
  { id: 2, name: 'Dr. Ebuka Kelechi', role: 'Health Specialist', appointments: 10, gender: 'Men', booked: false },
  { id: 3, name: 'Dr. Bridget Olowojeje', role: 'Family Doctor', appointments: 66, gender: 'Women', booked: true },
];

const DoctorList: React.FC<prop> = ({className}) => {
  const [doctors, setDoctors] = useState(doctorsData);
  const [selectedGender, setSelectedGender] = useState<'All' | 'Men' | 'Women'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const {theme} = useTheme()

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

  return (
    <div className={`bg-transparent p-6 rounded-3xl shadow-md border w-full ${className}`}>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h1 className="uppercase font-bold text-xs max-sm:text-sm max-lg:text-lg mr-5 sm:mr-10 lg:mr-20">
          DOCTORS
        </h1>
        <div className="flex-grow flex items-center rounded-md p-1 bg-transparent shadow-sm border overflow-hidden">
          <Search className="h-4 w-4 flex-none text-gray-500 dark:text-gray-400 ml-3" />
          <input
            type="text"
            placeholder="Search doctors by name or role"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-500 py-2 px-3 text-sm"
            value={searchTerm}
          />
        </div>

        <div className="flex border rounded-md overflow-hidden">
          {['All', 'Men', 'Women'].map((gender) => (
            <button
              key={gender}
              onClick={() => setSelectedGender(gender as 'All' | 'Men' | 'Women')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                selectedGender === gender ? 'bg-[#F80D38] text-white' : 'border-x'
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
            {filteredDoctors.map((doctor) => (
              <tr
                key={doctor.id}
                className={`rounded-lg ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}
              >
                <td className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-500 rounded-full" />
                  {doctor.name}
                </td>
                <td className="p-4">{doctor.role}</td>
                <td className="p-4 text-[#ff0000] font-bold">{doctor.appointments}</td>
                <td className="p-4">
                  <Link to={'/chats'}>
                    <button className="text-red-500 hover:text-red-700">
                      <img src={chats} alt="Chat" />
                    </button>
                  </Link>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleBookClick(doctor.id)}
                    className={`px-5 sm:px-6 py-2 rounded-full font-bold border hover:-translate-y-1 transition-all duration-300 hover:border-t hover:border-b ${
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

      <Link to={'/doctors'} className="mt-6 flex justify-center">
        <button
          className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold border hover:-translate-y-1 transition-all duration-300 hover:border-t hover:border-b ${
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
