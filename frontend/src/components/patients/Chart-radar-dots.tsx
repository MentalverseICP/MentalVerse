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
  "ANXIETY LEVELS": "#F80D38",
  "DEPRESSION SCORE": "#0DB16A", 
  "STRESS FACTORS": "#FECA57",
  "MOOD STABILITY": "#57dafe",
  "SLEEP QUALITY": "#b10d8d"
};

const chartData = [
  { month: "ANXIETY LEVELS", desktop: 186, fill: colors["ANXIETY LEVELS"] },
  { month: "DEPRESSION SCORE", desktop: 305, fill: colors["DEPRESSION SCORE"] },
  { month: "STRESS FACTORS", desktop: 237, fill: colors["STRESS FACTORS"] },
  { month: "MOOD STABILITY", desktop: 273, fill: colors["MOOD STABILITY"] },
  { month: "SLEEP QUALITY", desktop: 209, fill: colors["SLEEP QUALITY"] },
]

const chartConfig = {
  desktop: {
    label: "Range",
    color: "hsl(var(--chart-1))",
  },
  anxiety: {
    label: "ANXIETY LEVELS",
    color: colors["ANXIETY LEVELS"],
  },
  depression: {
    label: "DEPRESSION SCORE",
    color: colors["DEPRESSION SCORE"],
  },
  stress: {
    label: "STRESS FACTORS",
    color: colors["STRESS FACTORS"],
  },
  mood: {
    label: "MOOD STABILITY",
    color: colors["MOOD STABILITY"],
  },
  sleep: {
    label: "SLEEP QUALITY",
    color: colors["SLEEP QUALITY"],
  },
} satisfies ChartConfig

const legendItems = [
  { name: "MOOD STABILITY", color: colors["MOOD STABILITY"] },
  { name: "STRESS FACTORS", color: colors["STRESS FACTORS"] },
  { name: "DEPRESSION SCORE", color: colors["DEPRESSION SCORE"] },
  { name: "SLEEP QUALITY", color: colors["SLEEP QUALITY"] },
  { name: "ANXIETY LEVELS", color: colors["ANXIETY LEVELS"] },
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
      <div className="px-2 sm:px-4 pb-2 sm:pb-4 max-sm:px-2 max-sm:pb-2 max-[400px]:px-1 max-[400px]:pb-1 max-xs:sr-only">
        <div className="
          grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 
          max-sm:grid-cols-5
          gap-1 sm:gap-2 md:gap-2 max-sm:gap-0.5
          text-[8px] sm:text-[10px] max-sm:text-[7px] max-[400px]:text-[6px]
        ">
          {legendItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-0.5 sm:gap-1 max-sm:gap-0.5 max-[400px]:gap-0"
            >
              <div 
                className="
                  w-1 h-1 sm:w-1.5 sm:h-1.5 max-sm:w-1 max-sm:h-1 max-[400px]:w-0.5 max-[400px]:h-0.5
                  rounded-full flex-shrink-0
                "
                style={{ backgroundColor: item.color }}
              />
              <span className="
                dark:text-white text-gray-900
                font-medium truncate
                text-[8px] sm:text-[10px] max-sm:text-[7px] max-[400px]:text-[6px]
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