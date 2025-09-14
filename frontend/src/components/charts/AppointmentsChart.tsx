import { useState, useEffect } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
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
import { useTheme } from "../shared/theme-provider"

interface ChartData {
  month: string
  emergency: number
  examination: number
  consultation: number
  routine: number
  sick: number
}

const chartConfig = {
  emergency: {
    label: "Emergency",
    color: "#0DB16A",
  },
  examination: {
    label: "Examination",
    color: "#FECA57",
  },
  consultation: {
    label: "Consultation",
    color: "#18E614",
  },
  routine: {
    label: "Routine Checkup",
    color: "#F80D38",
  },
  sick: {
    label: "Sick Visit",
    color: "#57dafe",
  },
} satisfies ChartConfig

// Appointment types strictly typed as keys of ChartData (excluding "month")
const appointmentTypes: (keyof Omit<ChartData, "month">)[] = [
  "emergency",
  "examination",
  "consultation",
  "routine",
  "sick",
]

// Mock API function for appointments data
const fetchAppointmentsData = async (): Promise<ChartData[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const months = ["April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]
  const variation = 0.1

  const data = months.map((month, index) => {
    const monthData: Partial<ChartData> = { month }

    appointmentTypes.forEach((type, typeIndex) => {
      const baseValue = [120, 80, 150, 100, 90][typeIndex] + index * 10
      const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation
      monthData[type] = Math.floor(baseValue * randomFactor)
    })

    return monthData as ChartData
  })

  return data
}

export default function AppointmentsChart({ className = "" }) {
  const { theme } = useTheme()
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [error, setError] = useState<null | string>(null)

  const fetchData = async () => {
    try {
      setError(null)
      const data = await fetchAppointmentsData()
      setChartData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError("Failed to fetch data")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className={`flex flex-col h-full ${className}`}>
        <CardHeader className="items-start pb-2 mb-0 px-3 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">
            Overall Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center items-center pb-0 px-3 sm:px-6">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-500"></div>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm px-3 pb-3 sm:px-6 sm:pb-6">
          <div className="text-gray-500 text-xs">Loading appointment data...</div>
        </CardFooter>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`flex flex-col h-full ${className}`}>
        <CardHeader className="items-start pb-2 mb-0 px-3 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">
            Overall Appointments
          </CardTitle>
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
    <Card
      className={`flex flex-col h-auto w-full p-0 border-none rounded-none shadow-none ${className}`}
    >
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-1 sm:gap-0">
          <CardTitle className="uppercase font-bold text-xs max-lg:text-md">
            Overall Appointments
            <span className="ml-2 inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
          </CardTitle>
          <div className="text-xs text-gray-500 order-2 sm:order-none">
            Updated:{" "}
            {lastUpdated.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex justify-center pb-0 pt-5">
        <ChartContainer
          config={chartConfig}
          className="w-screen h-40 max-lg:h-36 max-md:h-32 max-sm:h-28 max-[400px]:h-24 p-0 -ml-10"
        >
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <ChartStyle id="appointments" config={chartConfig} />
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: theme === "dark" ? "#fff" : "#374151" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: theme === "dark" ? "#fff" : "#374151" }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="emergency" stackId="a" fill="#0DB16A" radius={[0, 0, 0, 0]} />
            <Bar dataKey="examination" stackId="a" fill="#FECA57" radius={[0, 0, 0, 0]} />
            <Bar dataKey="consultation" stackId="a" fill="#18E614" radius={[0, 0, 0, 0]} />
            <Bar dataKey="routine" stackId="a" fill="#F80D38" radius={[0, 0, 0, 0]} />
            <Bar dataKey="sick" stackId="a" fill="#57dafe" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <div className="flex flex-wrap items-center gap-4 max-sm:grid max-sm:grid-cols-5 max-sm:gap-1">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1 min-w-0">
              <div
                className="w-2 h-2 max-sm:w-1.5 max-sm:h-1.5 flex-shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <span className="font-semibold text-[8px] max-sm:text-[9px] tracking-wide truncate">
                {config.label}
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}
