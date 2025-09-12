import React, { useState } from 'react';
import { useSidebar } from "@/components/ui/Sidebar";
import { Search, Filter, Plus, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '@/components/shared/theme-provider';

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
  email: string;
  phone: string;
  emergencyContact: string;
  insurance: string;
  notes: string;
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
    avatar: "SJ",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    emergencyContact: "John Johnson +1 (555) 123-4568",
    insurance: "Blue Cross Blue Shield",
    notes: "Patient shows improvement with CBT techniques. Continue current medication."
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
    avatar: "MC",
    email: "michael.chen@email.com",
    phone: "+1 (555) 234-5678",
    emergencyContact: "Lisa Chen +1 (555) 234-5679",
    insurance: "Aetna",
    notes: "Responding well to SSRI treatment. Monitor for side effects."
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
    avatar: "ER",
    email: "emily.rodriguez@email.com",
    phone: "+1 (555) 345-6789",
    emergencyContact: "Carlos Rodriguez +1 (555) 345-6790",
    insurance: "Cigna",
    notes: "EMDR therapy showing positive results. Continue weekly sessions."
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
    avatar: "DT",
    email: "david.thompson@email.com",
    phone: "+1 (555) 456-7890",
    emergencyContact: "Mary Thompson +1 (555) 456-7891",
    insurance: "UnitedHealth",
    notes: "Stable on mood stabilizers. Monitor for manic episodes."
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
    avatar: "LW",
    email: "lisa.wang@email.com",
    phone: "+1 (555) 567-8901",
    emergencyContact: "Robert Wang +1 (555) 567-8902",
    insurance: "Humana",
    notes: "ERP therapy progressing well. Reduce compulsive behaviors."
  }
];

export default function DoctorPatients() {
  const { state } = useSidebar();
  const { theme } = useTheme();
  const isCollapsed = state === "collapsed";
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Active" | "Inactive" | "Pending">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const handleStatusFilter = (status: "All" | "Active" | "Inactive" | "Pending") => {
    setSelectedStatus(status);
  };

  const filteredPatients = patients.filter(
    (patient) =>
      (selectedStatus === "All" || patient.status === selectedStatus.toLowerCase()) &&
      (patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const openPatientModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const closePatientModal = () => {
    setShowPatientModal(false);
    setSelectedPatient(null);
  };

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
              <h1 className="text-xl sm:text-2xl font-bold text-red-500">Patient Management</h1>
              <p className="text-muted-foreground">Manage your patient roster and medical records</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-[#18E614] text-white rounded-lg hover:bg-[#18E614]/90 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Patient
              </button>
              <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="col-span-full mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients by name, condition, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
              />
            </div>
            <div className="flex rounded-lg overflow-hidden border border-border">
              {["All", "Active", "Inactive", "Pending"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status as any)}
                  className={`px-4 py-2 text-sm transition-colors ${
                    selectedStatus === status
                      ? "bg-[#18E614] text-white"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="col-span-full">
          <div className="bg-background rounded-3xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Next Appointment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#18E614] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {patient.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{patient.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {patient.age} years • {patient.gender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">{patient.email}</div>
                        <div className="text-sm text-muted-foreground">{patient.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">{patient.condition}</div>
                        <div className="text-xs text-muted-foreground">{patient.insurance}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">{patient.lastVisit}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">{patient.nextAppointment}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                          {getStatusText(patient.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openPatientModal(patient)}
                            className="p-2 text-[#18E614] hover:bg-[#18E614]/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-[#6366F1] hover:bg-[#6366F1]/10 rounded-lg transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-[#F80D38] hover:bg-[#F80D38]/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
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

        {/* Stats Summary */}
        <div className="col-span-full mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-[#18E614]">{filteredPatients.filter(p => p.status === 'active').length}</div>
              <div className="text-sm text-muted-foreground">Active Patients</div>
            </div>
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-[#F80D38]">{filteredPatients.filter(p => p.status === 'pending').length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-[#6366F1]">{filteredPatients.length}</div>
              <div className="text-sm text-muted-foreground">Total Patients</div>
            </div>
            <div className="bg-background p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-[#F59E0B]">24</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Patient Details</h2>
                <button
                  onClick={closePatientModal}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[#18E614] rounded-full flex items-center justify-center text-white font-semibold text-xl">
                    {selectedPatient.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedPatient.name}</h3>
                    <p className="text-muted-foreground">{selectedPatient.age} years • {selectedPatient.gender}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{selectedPatient.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-foreground">{selectedPatient.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                    <p className="text-foreground">{selectedPatient.emergencyContact}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Insurance</label>
                    <p className="text-foreground">{selectedPatient.insurance}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Condition</label>
                  <p className="text-foreground">{selectedPatient.condition}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-foreground">{selectedPatient.notes}</p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closePatientModal}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-[#18E614] text-white rounded-lg hover:bg-[#18E614]/90 transition-colors">
                    Edit Patient
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
