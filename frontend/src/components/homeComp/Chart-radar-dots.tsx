"use client"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "SEVERE HEADACHE", desktop: 186, fill: "var(--color-headache)" },
  { month: "TYPHOID", desktop: 305, fill: "var(--color-typhoid)" },
  { month: "COLD", desktop: 237, fill: "var(--color-cold)" },
  { month: "MALARIA", desktop: 273, fill: "var(--color-malaria)" },
  { month: "COUGH", desktop: 209, fill: "var(--color-cough)" },
]

const chartConfig = {
  desktop: {
    label: "Range",
    color: "hsl(var(--chart-1))",
  },
  headache: {
    label: "SEVERE HEADACHE",
    color: "#F80D38",
  },
  typhoid: {
    label: "TYPHOID",
    color: "#0DB16A",
  },
  cold: {
    label: "COLD",
    color: "#FECA57",
  },
  malaria: {
    label: "MALARIA",
    color: "#57dafe",
  },
  cough: {
    label: "COUGH",
    color: "#b10d8d",
  },
} satisfies ChartConfig

const legendItems = [
  { name: "MALARIA", color: "#57dafe" },
  { name: "COLD", color: "#FECA57" },
  { name: "TYPHOID", color: "#0DB16A" },
  { name: "COUGH", color: "#b10d8d" },
  { name: "SEVERE HEADACHE", color: "#F80D38" },
]
      // dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800
      // bg-gradient-to-br from-white via-gray-50 to-gray-100
      // dark:border-gray-700 border-gray-200
export function ChartRadar({ className }: { className?: string }) {
  return (
    <Card className={`
      flex flex-col justify-between
      rounded-3xl h-full shadow-md
      ${className}
    `}>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="
          dark:text-white text-gray-900
          uppercase font-bold text-xs max-lg:text-lg
        ">
          Causes Range
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-center px-2 sm:px-4 md:px-6">
        <ChartContainer
          config={chartConfig}
          className="
            w-full h-full max-h-80 sm:max-h-96 md:max-h-full
            aspect-square mx-auto
          "
        >
          <RadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent 
                className="
                  dark:bg-gray-800 bg-white
                  dark:border-gray-600 border-gray-200
                  dark:text-white text-gray-900
                "
              />} 
            />
            <PolarAngleAxis 
              dataKey="month" 
              className="text-xs sm:text-sm"
              tick={{ 
                fontSize: 10, 
                fill: 'hsl(var(--foreground))'
              }}
            />
            <PolarGrid 
              className="dark:stroke-gray-600 stroke-gray-300"
              strokeWidth={1}
              radialLines={true}
            />
            <Radar
              dataKey="desktop"
              stroke="#18E614a1"
              strokeWidth={2}
              fill="#18E614a1"
              fillOpacity={0.3}
              dot={{
                r: 3,
                fill: "#001300",
                strokeWidth: 2,
                stroke: "#ffffff",
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      
      {/* Legend */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="
          grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 
          gap-2 sm:gap-3 md:gap-4
          text-xs sm:text-sm
        ">
          {legendItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <div 
                className="
                  w-2 h-2 sm:w-3 sm:h-3 
                  rounded-full flex-shrink-0
                "
                style={{ backgroundColor: item.color }}
              />
              <span className="
                dark:text-white text-gray-900
                font-medium truncate
                text-xs sm:text-sm
              ">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}