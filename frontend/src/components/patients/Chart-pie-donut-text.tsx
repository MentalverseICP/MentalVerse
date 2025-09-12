import React, { useState, useEffect, useMemo } from "react"
import { Label, Pie, PieChart } from "recharts"
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

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  anxiety: {
    label: "Anxiety",
    color: "#0DB16A",
  },
  depression: {
    label: "Depression",
    color: "#FECA57",
  },
  stress: {
    label: "Stress",
    color: "#18E614",
  },
  other: {
    label: "Other",
    color: "#F80D38",
  },
} satisfies ChartConfig

// Mock API function
// simulating real-time data
const fetchDiagnosticsData = async () => {
  // API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Generate realistic fluctuating data
  const baseData = {
    typhoid: 18000,
    cold: 36000,
    malaria: 55000,
    other: 78000
  }
  
  // Add random variation (±10%)
  const variation = 0.1
  const data = Object.entries(baseData).map(([key, value]) => {
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation
    const newValue = Math.floor(value * randomFactor)
    return {
      sicknesses: key.toUpperCase() + " =",
      patients: newValue,
      fill: `var(--color-${key})`
    }
  })
  
  return data
}

type ChartDataItem = {
  sicknesses: string;
  patients: number;
  fill: string;
};

export default function ChartDonut({ className = "" }) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [error, setError] = useState<null | string>(null)

  const totalVisitors = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.patients, 0)
  }, [chartData])

  // Fetch data function
  const fetchData = async () => {
    try {
      setError(null)
      const data = await fetchDiagnosticsData()
      setChartData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to fetch data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch and setup interval
  useEffect(() => {
    fetchData()
    
    // Update data every 5 seconds (you can adjust this)
    const interval = setInterval(fetchData, 5000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className={`flex flex-col h-full rounded-3xl shadow-md ${className}`}>
        <CardHeader className="items-start pb-2 mb-0 px-3 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center items-center pb-0 px-3 sm:px-6">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-500"></div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm px-3 pb-3 sm:px-6 sm:pb-6">
          <div className="text-gray-500 text-xs">Loading real-time data...</div>
        </CardFooter>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`flex flex-col h-full rounded-3xl shadow-md ${className}`}>
        <CardHeader className="items-start pb-2 mb-0 px-3 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">Diagnostics</CardTitle>
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
            Diagnostics
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
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-[200px] max-sm:w-[160px] max-[400px]:w-[140px]"
        >
          <PieChart>
            <ChartStyle id="diagnostics-pie" config={chartConfig} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="patients"
              nameKey="sicknesses"
              innerRadius={50}
              strokeWidth={2}
              stroke="#fff"
              className="focus:outline-none"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="cursor-pointer"
                        onClick={fetchData}
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="text-2xl max-sm:text-xl max-[400px]:text-lg font-bold fill-green-500 dark:fill-white"
                        >
                          {totalVisitors >= 100000 
                            ? `${Math.floor(totalVisitors / 1000)}k` 
                            : totalVisitors.toLocaleString()
                          }
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-green-500 dark:fill-white text-[10px] max-sm:text-[9px] max-[400px]:text-[8px] font-bold uppercase tracking-wide"
                        >
                          Patients
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      
      <CardFooter className="flex-col gap-2">
        <div className="flex flex-wrap items-center gap-4 max-sm:grid max-sm:grid-cols-4 max-sm:gap-2">
          {chartData.map((item, index) => {
            const colors = ['#0DB16A', '#FECA57', '#18E614', '#F80D38']
            const labels = ['Anxiety', 'Depression', 'Stress', 'Other']
            return (
              <div key={`${labels[index]}-${index}`} className="flex items-center gap-1 min-w-0">
                <div 
                  className="w-2 h-2 max-sm:w-1.5 max-sm:h-1.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: colors[index] }}
                />
                <span className="font-semibold text-[8px] max-sm:text-[10px] tracking-wide truncate">
                  {labels[index]}: {item.patients >= 10000 ? `${Math.floor((item.patients) / 1000)}k` : item.patients.toLocaleString()}
                </span>  
              </div>
            )
          })}
        </div>
        
        {/* <div className="hidden md:flex justify-between items-center text-xs text-gray-500 mt-2 w-full">
          <span>Auto-refresh every 5 seconds</span>
          <button 
            type="button"
            onClick={fetchData}
            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-xs"
          >
            Refresh Now
          </button>
        </div> */}
      </CardFooter>
    </Card>
  )
}