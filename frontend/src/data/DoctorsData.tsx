interface Doctor {
  name: string;
  role: string;
  appointments: number;
  id: number;
  gender: 'Men' | 'Women';
  booked: boolean;
}

const doctorsData: Doctor[] = [
  { 
    id: 1, 
    name: 'Dr. Ibrahim Yekeni', 
    role: 'Heart Surgeon', 
    appointments: 0, 
    gender: 'Men', 
    booked: false 
  },
  { 
    id: 2, 
    name: 'Dr. Ebuka Kelechi', 
    role: 'Health Specialist', 
    appointments: 10, 
    gender: 'Men', 
    booked: false 
  },
  { 
    id: 3, 
    name: 'Dr. Bridget Olowojeje', 
    role: 'Family Doctor', 
    appointments: 66, 
    gender: 'Women', 
    booked: true 
  },
];

export default doctorsData;
export type { Doctor };