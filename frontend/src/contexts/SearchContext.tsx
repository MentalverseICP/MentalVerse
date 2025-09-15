import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of each search item
export type SearchItem = {
  id: number;
  type: "doctor" | "appointment" | "patient" | "feature";
  name?: string;
  title?: string;
  specialization?: string;
  condition?: string;
  description?: string;
  date?: string;
  route: string;
};

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchItem[];
  setSearchResults: (results: SearchItem[]) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  performSearch: (query: string) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    try {
      // Determine role from storage (default = patient)
      const userRole = (localStorage.getItem("userRole") || "patient").toLowerCase();
      const isTherapist = userRole === "therapist";

      // Mock search data
      const mockData: {
        doctors: SearchItem[];
        appointments: SearchItem[];
        patients: SearchItem[];
        features: SearchItem[];
      } = {
        doctors: [
          { id: 1, name: "Dr. Sarah Johnson", specialization: "Clinical Psychology", type: "doctor", route: isTherapist ? "/therapist/appointments" : "/patients/doctors" },
          { id: 2, name: "Dr. Michael Chen", specialization: "Psychiatry", type: "doctor", route: isTherapist ? "/therapist/appointments" : "/patients/doctors" },
          { id: 3, name: "Dr. Emily Rodriguez", specialization: "Cognitive Behavioral Therapy", type: "doctor", route: isTherapist ? "/therapist/appointments" : "/patients/doctors" },
        ],
        appointments: [
          { id: 1, title: "Emergency Consultation", date: "2024-01-22", type: "appointment", route: isTherapist ? "/therapist/appointments" : "/appointments" },
          { id: 2, title: "Routine Checkup", date: "2024-01-23", type: "appointment", route: isTherapist ? "/therapist/appointments" : "/appointments" },
          { id: 3, title: "Therapy Session", date: "2024-01-24", type: "appointment", route: isTherapist ? "/therapist/sessions" : "/appointments" },
        ],
        patients: [
          { id: 1, name: "John Doe", condition: "Anxiety", type: "patient", route: "/therapist/patients" },
          { id: 2, name: "Jane Smith", condition: "Depression", type: "patient", route: "/therapist/patients" },
          { id: 3, name: "Bob Wilson", condition: "PTSD", type: "patient", route: "/therapist/patients" },
        ],
        features: isTherapist
          ? [
              { id: 1, name: "Patient Management", description: "Manage your patients and their records", type: "feature", route: "/therapist/patients" },
              { id: 2, name: "Appointments", description: "Schedule and manage appointments", type: "feature", route: "/therapist/appointments" },
              { id: 3, name: "Therapy Sessions", description: "Conduct and manage therapy sessions", type: "feature", route: "/therapist/sessions" },
              { id: 4, name: "Treatment Plans", description: "Create and manage treatment plans", type: "feature", route: "/therapist/treatment-plans" },
              { id: 5, name: "Mental Health Records", description: "Access patient mental health records", type: "feature", route: "/therapist/records" },
              { id: 6, name: "Analytics Dashboard", description: "View analytics and insights", type: "feature", route: "/therapist/home" },
            ]
          : [
              { id: 1, name: "Token Wallet", description: "Manage your MentalVerse tokens", type: "feature", route: "/patients/token-wallet" },
              { id: 2, name: "Token Transfer", description: "Transfer tokens to other users", type: "feature", route: "/patients/token-transfer" },
              { id: 3, name: "Token Staking", description: "Stake your tokens for rewards", type: "feature", route: "/patients/token-staking" },
              { id: 4, name: "Testnet Faucet", description: "Get test tokens for development", type: "feature", route: "/patients/testnet-faucet" },
              { id: 5, name: "Claims", description: "Submit and track insurance claims", type: "feature", route: "/patients/claims" },
              { id: 6, name: "Medical Records", description: "View your medical history", type: "feature", route: "/patients/medical" },
              { id: 7, name: "Doctors", description: "Find and connect with doctors", type: "feature", route: "/patients/doctors" },
            ],
      };

      // Simulated delay for UX
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Merge and filter results
      const allResults: SearchItem[] = [
        ...mockData.doctors,
        ...mockData.appointments,
        ...mockData.patients,
        ...mockData.features,
      ];

      const filteredResults = allResults.filter((item) =>
        [item.name, item.title, item.specialization, item.condition, item.description]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(query.toLowerCase()))
      );

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const value: SearchContextType = {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    performSearch,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};
