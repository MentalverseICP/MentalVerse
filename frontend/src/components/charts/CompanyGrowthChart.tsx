import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTheme } from "../shared/theme-provider"
import { ChevronDown } from "lucide-react"

export default function CompanyGrowthChart({ className = "" }) {
  const { theme } = useTheme()
  const [growthRate, setGrowthRate] = useState(80)
  const [selectedYear, setSelectedYear] = useState("2024")
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Mock API function for company growth data
  const fetchGrowthData = async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate growth rate variation
    const variation = 0.05
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation
    const newGrowthRate = Math.floor(80 * randomFactor)
    
    setGrowthRate(newGrowthRate)
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => {
    fetchGrowthData()
    const interval = setInterval(fetchGrowthData, 25000) // Update every 25 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className={`flex flex-col rounded-3xl shadow-md ${className}`}>
        <CardHeader className="items-start pb-2 mb-0 px-3 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">Company Growth</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center pb-0 px-3 sm:px-6">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-500"></div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm px-3 pb-3 sm:px-6 sm:pb-6">
          <div className="text-gray-500 text-xs">Loading growth data...</div>
        </CardFooter>
      </Card>
    )
  }

  // Calculate the circumference and stroke-dasharray for the progress ring
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (growthRate / 100) * circumference

  return (
    <Card className={`flex flex-col w-full rounded-3xl shadow-md  ${className}`}>
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-1 sm:gap-0">
          <CardTitle className="uppercase font-bold text-xs max-lg:text-md">
            Company Growth
            <span className="ml-2 inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
          </CardTitle>
          <div className="text-xs text-gray-500 order-2 sm:order-none">
            Updated: {lastUpdated.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-1 justify-center items-center pb-0 p-2">
        <div className="relative w-40 h-40 max-xl:w-36 max-xl:h-36 max-lg:w-32 max-lg:h-32 max-md:w-28 max-md:h-28 max-sm:w-24 max-sm:h-24 max-[400px]:w-20 max-[400px]:h-20">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#18E614"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-3xl max-xl:text-2xl max-lg:text-xl max-md:text-lg max-sm:text-base max-[400px]:text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-[#18E614]'}`}>
              {growthRate}%
            </div>
            <div className={`text-sm max-xl:text-xs max-lg:text-[10px] max-md:text-[9px] max-sm:text-[8px] max-[400px]:text-[7px] font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-white' : 'text-[#18E614]'}`}>
              Growth
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col gap-1 p-2">
        <div className="flex items-center justify-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#18E614] focus:border-transparent"
          >
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </div>
        
        <div className="text-center">
          <span className={`text-xs max-sm:text-[10px] max-[400px]:text-[8px] ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
            {growthRate}% Growth in {selectedYear}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}

