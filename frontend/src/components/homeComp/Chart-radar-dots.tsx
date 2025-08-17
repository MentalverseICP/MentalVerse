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

// Define colors in one place for consistency
const colors = {
  "SEVERE HEADACHE": "#F80D38",
  "TYPHOID": "#0DB16A", 
  "COLD": "#FECA57",
  "MALARIA": "#57dafe",
  "COUGH": "#b10d8d"
};

const chartData = [
  { month: "SEVERE HEADACHE", desktop: 186, fill: colors["SEVERE HEADACHE"] },
  { month: "TYPHOID", desktop: 305, fill: colors["TYPHOID"] },
  { month: "COLD", desktop: 237, fill: colors["COLD"] },
  { month: "MALARIA", desktop: 273, fill: colors["MALARIA"] },
  { month: "COUGH", desktop: 209, fill: colors["COUGH"] },
]

const chartConfig = {
  desktop: {
    label: "Range",
    color: "hsl(var(--chart-1))",
  },
  headache: {
    label: "SEVERE HEADACHE",
    color: colors["SEVERE HEADACHE"],
  },
  typhoid: {
    label: "TYPHOID",
    color: colors["TYPHOID"],
  },
  cold: {
    label: "COLD",
    color: colors["COLD"],
  },
  malaria: {
    label: "MALARIA",
    color: colors["MALARIA"],
  },
  cough: {
    label: "COUGH",
    color: colors["COUGH"],
  },
} satisfies ChartConfig

const legendItems = [
  { name: "MALARIA", color: colors["MALARIA"] },
  { name: "COLD", color: colors["COLD"] },
  { name: "TYPHOID", color: colors["TYPHOID"] },
  { name: "COUGH", color: colors["COUGH"] },
  { name: "SEVERE HEADACHE", color: colors["SEVERE HEADACHE"] },
]

export function ChartRadar({ className }: { className?: string }) {
  return (
    <Card className={`
      flex flex-col justify-between
      rounded-3xl h-full shadow-md
      ${className}
    `}>
      <CardHeader className="pb-2 sm:pb-4 max-sm:pb-2 max-[400px]:pb-1">
        <CardTitle className="dark:text-white text-gray-900 uppercase font-bold text-xs max-lg:text-md 
        ">
          Causes Range
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-center px-2 sm:px-4 md:px-6 max-sm:px-2 max-[400px]:px-1">
        <ChartContainer
          config={chartConfig}
          className="
            w-full h-full max-h-80 sm:max-h-96 md:max-h-full
            max-sm:max-h-64 max-[400px]:max-h-52
            aspect-square mx-auto
          "
        >
          <RadarChart data={chartData} margin={{ 
            top: 20, 
            right: 20, 
            bottom: 20, 
            left: 20 
          }} className="max-sm:text-[8px] max-[400px]:text-[7px]">
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent 
                className="
                  dark:bg-gray-800 bg-white
                  dark:border-gray-600 border-gray-200
                  dark:text-white text-gray-900
                  max-sm:text-xs max-[400px]:text-[10px]
                "
              />} 
            />
            <PolarAngleAxis 
              dataKey="month" 
              className="text-xs sm:text-sm max-sm:text-[9px] max-[400px]:text-[8px]"
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

            {/* Single Radar with custom colored dots */}
            <Radar
              dataKey="desktop"
              stroke="#18E614a1"
              strokeWidth={2}
              fill="#18E614a1"
              fillOpacity={0.3}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const color = colors[payload.month as keyof typeof colors] || "#18E614a1";
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={color}
                    stroke={color}
                    strokeWidth={2}
                  />
                );
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      
      {/* Legend */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 max-sm:px-3 max-sm:pb-3 max-[400px]:px-2 max-[400px]:pb-2 max-xs:sr-only">
        <div className="
          grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 
          max-sm:grid-cols-4
          gap-2 sm:gap-3 md:gap-4 max-sm:gap-1
          text-xs sm:text-sm max-sm:text-[10px] max-[400px]:text-[9px]
        ">
          {legendItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-1.5 sm:gap-2 max-sm:gap-1 max-[400px]:gap-0.5"
            >
              <div 
                className="
                  w-2 h-2 sm:w-3 sm:h-3 max-sm:w-1.5 max-sm:h-1.5 max-[400px]:w-1 max-[400px]:h-1
                  rounded-full flex-shrink-0
                "
                style={{ backgroundColor: item.color }}
              />
              <span className="
                dark:text-white text-gray-900
                font-medium truncate
                text-xs sm:text-sm max-sm:text-[10px] max-[400px]:text-[8px]
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