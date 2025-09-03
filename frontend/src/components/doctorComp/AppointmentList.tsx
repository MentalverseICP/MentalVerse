import React, { useState } from "react";
import { Calendar, Clock, User, MessageCircle, Video, Phone } from "lucide-react";
import { useTheme } from "../theme-provider";

interface Appointment {
  id: number;
  patientName: string;
  patientAvatar: string;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'in-person';
  status: 'upcoming' | 'completed' | 'cancelled';
  duration: string;
  condition: string;
}

const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientName: "Sarah Johnson",
    patientAvatar: "SJ",
    date: "2024-01-22",
    time: "10:00 AM",
    type: 'video',
    status: 'upcoming',
    duration: "45 min",
    condition: "Anxiety Disorder"
  },
  {
    id: 2,
    patientName: "Michael Chen",
    patientAvatar: "MC",
    date: "2024-01-22",
    time: "11:00 AM",
    type: 'phone',
    status: 'upcoming',
    duration: "30 min",
    condition: "Depression"
  },
  {
    id: 3,
    patientName: "Emily Rodriguez",
    patientAvatar: "ER",
    date: "2024-01-22",
    time: "2:00 PM",
    type: 'in-person',
    status: 'upcoming',
    duration: "60 min",
    condition: "PTSD"
  },
  {
    id: 4,
    patientName: "David Thompson",
    patientAvatar: "DT",
    date: "2024-01-21",
    time: "3:00 PM",
    type: 'video',
    status: 'completed',
    duration: "45 min",
    condition: "Bipolar Disorder"
  }
];

interface AppointmentListProps {
  className: string;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ className }) => {
  const [appointments] = useState<Appointment[]>(mockAppointments);
  const { theme } = useTheme();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in-person':
        return <User className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'text-[#18E614]';
      case 'phone':
        return 'text-[#F80D38]';
      case 'in-person':
        return 'text-[#6366F1]';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-[#18E614] text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      case 'cancelled':
        return 'bg-[#F80D38] text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const recentAppointments = appointments.filter(apt => apt.status === 'completed');

  return (
    <div className={`bg-transparent p-4 rounded-3xl ${className}`}>
      <div className="mb-4">
        <h3 className="text-md font-semibold text-foreground mb-3">Today's Appointments</h3>
        <div className="space-y-3">
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-background p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#18E614] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {appointment.patientAvatar}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground">{appointment.patientName}</div>
                    <div className="text-xs text-muted-foreground">{appointment.condition}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{appointment.time}</div>
                  <div className="text-xs text-muted-foreground">{appointment.duration}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <span className={`${getTypeColor(appointment.type)}`}>
                    {getTypeIcon(appointment.type)}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{appointment.type}</span>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-[#18E614] hover:bg-[#18E614]/10 rounded transition-colors">
                    <MessageCircle className="h-3 w-3" />
                  </button>
                  <button className="p-1 text-[#F80D38] hover:bg-[#F80D38]/10 rounded transition-colors">
                    <Calendar className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {recentAppointments.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-foreground mb-3">Recent Appointments</h3>
          <div className="space-y-2">
            {recentAppointments.slice(0, 2).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {appointment.patientAvatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{appointment.patientName}</div>
                    <div className="text-xs text-muted-foreground">{appointment.date} at {appointment.time}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusText(appointment.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <button className="text-sm text-[#18E614] hover:text-[#18E614]/80 transition-colors">
          View All Appointments
        </button>
      </div>
    </div>
  );
};

export default AppointmentList;
