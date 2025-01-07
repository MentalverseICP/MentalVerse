import React, { useState } from 'react';
import { useTheme } from "@/components/theme-provider"

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
  { doctor: 'Dr. Ibrahim Yekeni', type: 'Emergency', date: 'Tues, Oct 24', typeColor: '#18e614' },
  { doctor: 'Dr. Ebuka Kelechi', type: 'Examination', date: 'Mon, Nov 2', typeColor: '#ffc107' },
  { doctor: 'Dr. Bridget Olowojoje', type: 'Consultation', date: 'Fri, Nov 13', typeColor: '#129a1b' },
  { doctor: 'Dr. Michael Stewart', type: 'Routine Checkup', date: 'Thurs, Dec 9', typeColor: '#ff0000' },
];

const previousAppointments: { [key: string]: Appointment[] } = {
  day: [
    { doctor: 'Dr. Seut Tom', type: 'Sick Visit', date: 'Fr, Aug 11', typeColor: '#17a2b8' },
    { doctor: 'Dr. Ebuka Kelechi', type: 'Examination', date: 'Wed, July 12', typeColor: '#ffc107' },
    { doctor: 'Dr. Bridget Olowojeje', type: 'Consultation', date: 'Tues, July 30', typeColor: '#129a1b' },
    { doctor: 'Dr. Michael Stewart', type: 'Routine Checkup', date: 'Thurs, Dec 9', typeColor: '#ff0000' },
    { doctor: 'Dr. Ibrahim Yekeni', type: 'Emergency', date: 'Tues, Oct 24', typeColor: '#18e614' },
  ],
  week: [
    { doctor: 'Dr. Amina Ahmed', type: 'Consultation', date: 'Tues, July 30', typeColor: '#129a1b' },
    { doctor: 'Dr. Ibrahim Yekeni', type: 'Examination', date: 'Wed, July 12', typeColor: '#ffc107' },
    { doctor: 'Dr. Seut Tom', type: 'Sick Visit', date: 'Fr, Aug 11', typeColor: '#17a2b8' },
    { doctor: 'Dr. Bridget Olowojeje', type: 'Consultation', date: 'Tues, July 30', typeColor: '#129a1b' },
  ],
  month: [
    { doctor: 'Dr. Ibrahim Yekeni', type: 'Examination', date: 'Wed, July 12', typeColor: '#ffc107' },
    { doctor: 'Dr. Banabas Paul', type: 'Emergency', date: 'Mon, June 14', typeColor: '#14e649' },
    { doctor: 'Dr. Michael Stewart', type: 'Routine Checkup', date: 'Thurs, Dec 9', typeColor: '#ff0000' },
    { doctor: 'Dr. Ebuka Kelechi', type: 'Examination', date: 'Wed, July 12', typeColor: '#ffc107' },
  ],
};

const AppointmentList: React.FC<prop> = ({ className }) => {
  const [tab, setTab] = useState<'day' | 'week' | 'month'>('day');
  const { theme } = useTheme()

  return (
    <div className={`w-full p-4 bg-transparent text-white mt-6 space-y-6 ${className}`}>
      {/* Upcoming Appointments */}
      <div>
        <h2 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Upcoming Appointments</h2>
        <ul className="space-y-4 mt-4">
          {upcomingAppointments.map((appointment, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-transparent border rounded-lg p-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-600 rounded-full"></div>
                <div>
                  <p className={`font-bold text-xs ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{appointment.doctor}</p>
                  <p className="text-[12px] font-bold" style={{ color: appointment.typeColor }}>
                    {appointment.type}
                  </p>
                </div>
              </div>
              <p className={`text-[10px] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{appointment.date}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Previous Appointments */}
      <div>
        <h2 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Previous Appointments</h2>
        <div className="flex justify-between mt-4 border rounded-lg overflow-hidden">
          <button
            className={`px-4 py-2 uppercase text-xs font-bold ${
              tab === 'day' ? 'bg-[#F80D38] text-white' : 'bg-transparent text-gray-400'
            }`}
            onClick={() => setTab('day')}
          >
            Day
          </button>
          <button
            className={`px-4 py-2 uppercase text-xs font-bold ${
              tab === 'week' ? 'bg-[#F80D38] text-white' : 'bg-transparent text-gray-400'
            }`}
            onClick={() => setTab('week')}
          >
            Week
          </button>
          <button
            className={`px-4 py-2 uppercase text-xs font-bold ${
              tab === 'month' ? 'bg-[#F80D38] text-white' : 'bg-transparent text-gray-400'
            }`}
            onClick={() => setTab('month')}
          >
            Month
          </button>
        </div>
        <ul className="space-y-4 mt-4">
          {previousAppointments[tab].map((appointment, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-transparent border rounded-lg p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 bg-gray-600 rounded-full"></div>
                <div>
                  <p className={`font-bold text-xs ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{appointment.doctor}</p>
                  <p className="text-[12px] font-bold" style={{ color: appointment.typeColor }}>
                    {appointment.type}
                  </p>
                </div>
              </div>
              <p className={`text-[10px] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{appointment.date}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AppointmentList;
