export interface Therapist {
  id: string
  name: string
  specialization: string[]
  rating: number
  image: string
}

export const therapists: Therapist[] = [
  {
    id: "1",
    name: "Dr. Jane Smith",
    specialization: ["CBT", "Mindfulness"],
    rating: 4.9,
    image: "/assets/therapist1.jpg",
  },
  {
    id: "2",
    name: "Dr. John Doe",
    specialization: ["DBT", "Trauma"],
    rating: 4.7,
    image: "/assets/therapist2.jpg",
  },
]