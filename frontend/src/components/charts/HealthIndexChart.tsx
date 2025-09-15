import React, { useState, useEffect } from "react"
import { XAxis, YAxis, CartesianGrid, Bar, BarChart } from "recharts"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"
import { useTheme } from "../shared/theme-provider"

const chartConfig = {
  healthIndex: {
    label: "Health Index",
    color: "#18E614",
  },
} satisfies ChartConfig

// Mock API function for health index data
const fetchHealthIndexData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const months = ['June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
  const baseHealthIndex = [65, 68, 70, 72, 75, 73, 76]
  
  const variation = 0.05
  const data = months.map((month, index) => {
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation
    const newValue = Math.floor(baseHealthIndex[index] * randomFactor)
    return {
      month,
      healthIndex: newValue,
      fill: "#18E614"
    }
  })
  
  return data
}

type ChartDataItem = {
  month: string;
  healthIndex: number;
  fill: string;
};

export default function HealthIndexChart({ className = "" }) {
  const { theme } = useTheme()
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [error, setError] = useState<null | string>(null)
  const [currentHealthIndex, setCurrentHealthIndex] = useState(75)

  const fetchData = async () => {
    try {
      setError(null)
      const data = await fetchHealthIndexData()
      setChartData(data)
      setCurrentHealthIndex(data[data.length - 1]?.healthIndex || 75)
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to fetch data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 20000) // Update every 20 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className={`flex flex-col h-full rounded-3xl shadow-md ${className}`}>
        <CardHeader className="items-start pb-2 mb-0 px-3 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">Health Index</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center items-center pb-0 px-3 sm:px-6">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-500"></div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm px-3 pb-3 sm:px-6 sm:pb-6">
          <div className="text-gray-500 text-xs">Loading health data...</div>
        </CardFooter>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`flex flex-col h-full rounded-3xl shadow-md ${className}`}>
        <CardHeader className="items-start pb-2 mb-0 px-3 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">Health Index</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center items-center pb-0 px-3 sm:px-6">
          <div className="text-red-500 text-xs sm:text-sm text-center px-2">{error}</div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm px-3 pb-3 sm:px-6 sm:pb-6">
          <button 
            onClick={fetchData}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded text-xs sm:text-sm hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className={`flex flex-col h-full rounded-3xl shadow-md ${className}`}>
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-1 sm:gap-0">
          <CardTitle className="uppercase font-bold text-xs max-lg:text-md">
            Health Index
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
      
      <CardContent className="flex flex-1 justify-center pb-0">
        <div className="w-full h-full flex flex-col items-center justify-center">
          {/* Health Index Display */}
          <div className="flex items-center mb-4">
            <span className={`text-[#18E614] text-4xl max-xl:text-3xl max-lg:text-2xl max-md:text-xl max-sm:text-lg max-[400px]:text-base font-bold ${
              theme === "dark" ? "text-white" : "text-[#18E614]"
            }`}>
              {currentHealthIndex}%
            </span>
            <TrendingUp className="text-[#F80D38] w-10 h-10 max-lg:w-8 max-lg:h-8 max-md:w-6 max-md:h-6 max-sm:w-5 max-sm:h-5 max-[400px]:w-4 max-[400px]:h-4 font-extrabold ml-2" />
          </div>
          
          {/* Chart */}
          <ChartContainer
            config={chartConfig}
            className="w-full h-32 max-lg:h-28 max-md:h-24 max-sm:h-20 max-[400px]:h-16"
          >
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <ChartStyle id="health-index" config={chartConfig} />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: theme === 'dark' ? '#fff' : '#374151' }}
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar 
                dataKey="healthIndex" 
                fill="#18E614"
                radius={[2, 2, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col gap-2">
        <div className="flex flex-col items-start">
          <span className={`text-[10px] max-lg:text-[18px] max-sm:text-[12px] max-[400px]:text-[10px] pb-0 ${
            theme === "dark" ? "text-white" : "text-gray-600"
          }`}>
            Patient health rate
          </span>
          <span className={`text-[10px] max-lg:text-[18px] max-sm:text-[12px] max-[400px]:text-[10px] ${
            theme === "dark" ? "text-white" : "text-gray-600"
          }`}>
            from Jan to Dec.
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}

