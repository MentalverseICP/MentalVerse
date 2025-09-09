import React, { useState } from 'react';
import { useSidebar } from "@/components/ui/Sidebar";
import { Calendar, Clock, User, Video, Phone, Plus, Filter, Search, MessageCircle } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

interface Appointment {
  id: number;
  patientName: string;
  patientAvatar: string;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'in-person';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  duration: string;
  condition: string;
  notes: string;
  patientEmail: string;
  patientPhone: string;
}

const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientName: "Sarah Johnson",
    patientAvatar: "SJ",
    date: "2024-01-22",
    time: "10:00 AM",
    type: 'video',
    status: 'scheduled',
    duration: "45 min",
    condition: "Anxiety Disorder",
    notes: "Follow-up session. Continue CBT techniques.",
    patientEmail: "sarah.johnson@email.com",
    patientPhone: "+1 (555) 123-4567"
  },
  {
    id: 2,
    patientName: "Michael Chen",
    patientAvatar: "MC",
    date: "2024-01-22",
    time: "11:00 AM",
    type: 'phone',
    status: 'scheduled',
    duration: "30 min",
    condition: "Depression",
    notes: "Medication check-in. Monitor side effects.",
    patientEmail: "michael.chen@email.com",
    patientPhone: "+1 (555) 234-5678"
  },
  {
    id: 3,
    patientName: "Emily Rodriguez",
    patientAvatar: "ER",
    date: "2024-01-22",
    time: "2:00 PM",
    type: 'in-person',
    status: 'scheduled',
    duration: "60 min",
    condition: "PTSD",
    notes: "EMDR therapy session. Trauma processing.",
    patientEmail: "emily.rodriguez@email.com",
    patientPhone: "+1 (555) 345-6789"
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
    condition: "Bipolar Disorder",
    notes: "Session completed. Patient stable. Continue medication.",
    patientEmail: "david.thompson@email.com",
    patientPhone: "+1 (555) 456-7890"
  },
  {
    id: 5,
    patientName: "Lisa Wang",
    patientAvatar: "LW",
    date: "2024-01-21",
    time: "4:00 PM",
    type: 'video',
    status: 'cancelled',
    duration: "45 min",
    condition: "OCD",
    notes: "Patient cancelled due to emergency.",
    patientEmail: "lisa.wang@email.com",
    patientPhone: "+1 (555) 567-8901"
  }
];

export default function DoctorAppointments() {
  const { state } = useSidebar();
  const { theme } = useTheme();
  const isCollapsed = state === "collapsed";
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedDate, setSelectedDate] = useState<string>("2024-01-22");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Scheduled" | "In Progress" | "Completed" | "Cancelled" | "No Show">("All");
  const [selectedType, setSelectedType] = useState<"All" | "Video" | "Phone" | "In-Person">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const handleStatusFilter = (status: "All" | "Scheduled" | "In Progress" | "Completed" | "Cancelled" | "No Show") => {
    setSelectedStatus(status);
  };

  const handleTypeFilter = (type: "All" | "Video" | "Phone" | "In-Person") => {
    setSelectedType(type);
  };

  const filteredAppointments = appointments.filter(
    (appointment) =>
      (selectedStatus === "All" || appointment.status === selectedStatus.toLowerCase().replace(' ', '-')) &&
      (selectedType === "All" || appointment.type === selectedType.toLowerCase().replace('-', '')) &&
      (appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.condition.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-[#18E614] text-white';
      case 'in-progress':
        return 'bg-[#F80D38] text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      case 'cancelled':
        return 'bg-[#F80D38] text-white';
      case 'no-show':
        return 'bg-[#F59E0B] text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusText = (status: string) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

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

  const openAppointmentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
    setSelectedAppointment(null);
  };

  const updateAppointmentStatus = (appointmentId: number, newStatus: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
      )
    );
  };

  const todayAppointments = filteredAppointments.filter(apt => apt.date === selectedDate);
  const upcomingAppointments = filteredAppointments.filter(apt => apt.date > selectedDate);
  const pastAppointments = filteredAppointments.filter(apt => apt.date < selectedDate);

  return (
    <>
      <div
        className={`grid grid-cols-12 justify-evenly max-sm:ml-[4.5rem] max-lg:ml-20 mt-4 mb-4 mr-2 w-fit max-sm:w-fit ${
          isCollapsed
            ? "gap-5 w-full max-md:w-fit md:pr-4 md:pl-2"
            : "xl:gap-x-5 gap-5 px-2"
        }`}
      >
        {/* Header Section */}
        <div className="col-span-full mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Appointment Management</h1>
              <p className="text-muted-foreground">Manage your schedule and patient appointments</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-[#18E614] text-white rounded-lg hover:bg-[#18E614]/90 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="col-span-full mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search appointments by patient name or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex rounded-lg overflow-hidden border border-border">
                {["All", "Scheduled", "In Progress", "Completed", "Cancelled", "No Show"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilter(status as any)}
                    className={`px-3 py-2 text-xs transition-colors ${
                      selectedStatus === status
                        ? "bg-[#18E614] text-white"
                        : "bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              
              <div className="flex rounded-lg overflow-hidden border border-border">
                {["All", "Video", "Phone", "In-Person"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeFilter(type as any)}
                    className={`px-3 py-2 text-xs transition-colors ${
                      selectedType === type
                        ? "bg-[#6366F1] text-white"
                        : "bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="col-span-full mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-foreground">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
            />
          </div>
        </div>

        {/* Today's Appointments */}
        {todayAppointments.length > 0 && (
          <div className="col-span-full mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Today's Appointments ({selectedDate})</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-background p-4 rounded-lg border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#18E614] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {appointment.patientAvatar}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{appointment.patientName}</div>
                        <div className="text-sm text-muted-foreground">{appointment.condition}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{appointment.time}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{appointment.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={`${getTypeColor(appointment.type)}`}>
                        {getTypeIcon(appointment.type)}
                      </span>
                      <span className="text-muted-foreground capitalize">{appointment.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openAppointmentModal(appointment)}
                      className="flex-1 px-3 py-2 text-sm bg-[#18E614] text-white rounded-lg hover:bg-[#18E614]/90 transition-colors"
                    >
                      View Details
                    </button>
                    <button className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div className="col-span-full mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Appointments</h2>
            <div className="bg-background rounded-3xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {upcomingAppointments.slice(0, 5).map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#18E614] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {appointment.patientAvatar}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{appointment.patientName}</div>
                              <div className="text-sm text-muted-foreground">{appointment.condition}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-foreground">{appointment.date}</div>
                          <div className="text-sm text-muted-foreground">{appointment.time} • {appointment.duration}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className={`${getTypeColor(appointment.type)}`}>
                              {getTypeIcon(appointment.type)}
                            </span>
                            <span className="text-sm text-foreground capitalize">{appointment.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openAppointmentModal(appointment)}
                              className="p-2 text-[#18E614] hover:bg-[#18E614]/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <User className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-[#6366F1] hover:bg-[#6366F1]/10 rounded-lg transition-colors" title="Message">
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="col-span-full mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-[#18E614]">{filteredAppointments.filter(a => a.status === 'scheduled').length}</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-[#F80D38]">{filteredAppointments.filter(a => a.status === 'in-progress').length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-gray-500">{filteredAppointments.filter(a => a.status === 'completed').length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-[#F59E0B]">{filteredAppointments.filter(a => a.status === 'cancelled' || a.status === 'no-show').length}</div>
              <div className="text-sm text-muted-foreground">Cancelled/No Show</div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Appointment Details</h2>
                <button
                  onClick={closeAppointmentModal}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[#18E614] rounded-full flex items-center justify-center text-white font-semibold text-xl">
                    {selectedAppointment.patientAvatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedAppointment.patientName}</h3>
                    <p className="text-muted-foreground">{selectedAppointment.condition}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                    <p className="text-foreground">{selectedAppointment.date} at {selectedAppointment.time}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duration</label>
                    <p className="text-foreground">{selectedAppointment.duration}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="text-foreground capitalize">{selectedAppointment.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                      {getStatusText(selectedAppointment.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patient Contact</label>
                  <p className="text-foreground">{selectedAppointment.patientEmail}</p>
                  <p className="text-foreground">{selectedAppointment.patientPhone}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-foreground">{selectedAppointment.notes}</p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeAppointmentModal}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Close
                  </button>
                  {selectedAppointment.status === 'scheduled' && (
                    <button 
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, 'in-progress')}
                      className="px-4 py-2 bg-[#18E614] text-white rounded-lg hover:bg-[#18E614]/90 transition-colors"
                    >
                      Start Session
                    </button>
                  )}
                  {selectedAppointment.status === 'in-progress' && (
                    <button 
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, 'completed')}
                      className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#6366F1]/90 transition-colors"
                    >
                      Complete Session
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
