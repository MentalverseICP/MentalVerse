interface PathologyResult {
  id: number;
  file: string;
  time: string;
}

interface Doctor {
  id: number;
  name: string;
  role: string;
  status: "online" | "offline";
  gender: "Men" | "Women";
  specialty: string;
  appointments: number;
  booked: boolean;
  pathologyData: PathologyResult[];
}

const doctorsData: Doctor[] = [
  { 
    id: 1, 
    name: "Dr. Ibrahim Yekeni", 
    role: "Family Doctor", 
    status: "online", 
    gender: "Men", 
    specialty: "Family Doctor", 
    appointments: 12, 
    booked: false,
    pathologyData: [
      { id: 101, file: "Malaria Infection Treatment", time: "2:00PM" },
      { id: 102, file: "Typhoid Diagnosis", time: "10:00AM" },
    ]
  },
  { 
    id: 2, 
    name: "Dr. Aisha Bello", 
    role: "Psychiatrist", 
    status: "offline", 
    gender: "Women", 
    specialty: "Psychiatry", 
    appointments: 8, 
    booked: false,
    pathologyData: [
      { id: 201, file: "Transcend", time: "5:00AM" },
      { id: 202, file: "Blood Sugar Test", time: "11:30AM" },
    ]
  },
  { 
    id: 3, 
    name: "Dr. John Doe", 
    role: "Therapist", 
    status: "online", 
    gender: "Men", 
    specialty: "Therapy", 
    appointments: 15, 
    booked: false,
    pathologyData: [
      { id: 301, file: "Hypertension Follow-up", time: "9:00AM" },
      { id: 302, file: "Cholesterol Screening", time: "1:00PM" },
    ]
  },
  { 
    id: 4, 
    name: "Dr. Jane Smith", 
    role: "Clinical Psychologist", 
    status: "online", 
    gender: "Women", 
    specialty: "Psychology", 
    appointments: 20, 
    booked: false,
    pathologyData: [
      { id: 401, file: "Asthma Management", time: "3:30PM" },
      { id: 402, file: "Allergy Test", time: "8:30AM" },
    ]
  },
  { 
    id: 5, 
    name: "Dr. Samuel Okoro", 
    role: "Counselor", 
    status: "offline", 
    gender: "Men", 
    specialty: "Counseling", 
    appointments: 5, 
    booked: false,
    pathologyData: []
  },
  { 
    id: 6, 
    name: "Dr. Fatima Musa", 
    role: "Child Psychologist", 
    status: "online", 
    gender: "Women", 
    specialty: "Child Psychology", 
    appointments: 9, 
    booked: false,
    pathologyData: []
  },
  { 
    id: 7, 
    name: "Dr. Chinedu Obi", 
    role: "Family Doctor", 
    status: "offline", 
    gender: "Men", 
    specialty: "Family Doctor", 
    appointments: 7, 
    booked: false,
    pathologyData: []
  },
  { 
    id: 8, 
    name: "Dr. Grace Uche", 
    role: "Therapist", 
    status: "online", 
    gender: "Women", 
    specialty: "Therapy", 
    appointments: 13, 
    booked: false,
    pathologyData: []
  },
  { 
    id: 9, 
    name: "Dr. Michael Ade", 
    role: "Psychiatrist", 
    status: "offline", 
    gender: "Men", 
    specialty: "Psychiatry", 
    appointments: 6, 
    booked: false,
    pathologyData: []
  },
  { 
    id: 10, 
    name: "Dr. Linda Eze", 
    role: "Clinical Psychologist", 
    status: "online", 
    gender: "Women", 
    specialty: "Psychology", 
    appointments: 11, 
    booked: false,
    pathologyData: []
  },
  { 
    id: 11, 
    name: "Dr. Peter Obi", 
    role: "Neurosurgeon", 
    status: "online", 
    gender: "Men", 
    specialty: "Neurosurgery", 
    appointments: 4, 
    booked: false,
    pathologyData: []
  },
  { 
    id: 12, 
    name: "Dr. Mary Johnson", 
    role: "Dermatologist", 
    status: "offline", 
    gender: "Women", 
    specialty: "Dermatology", 
    appointments: 3, 
    booked: false,
    pathologyData: []
  },
  { 
    id: 13, 
    name: "Dr. Henry Ford", 
    role: "Cardiologist", 
    status: "online", 
    gender: "Men", 
    specialty: "Cardiology", 
    appointments: 10, 
    booked: false,
    pathologyData: []
  },
  { 
    id: 14, 
    name: "Dr. Adaeze Nwosu", 
    role: "Endocrinologist", 
    status: "online", 
    gender: "Women", 
    specialty: "Endocrinology", 
    appointments: 2, 
    booked: false,
    pathologyData: []
  },
];

export default doctorsData;
export type { Doctor, PathologyResult };