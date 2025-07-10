"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useSidebar } from "../ui/Sidebar"
const chartData = [
  { month: "SEVERE HEADACHE", desktop: 186, fill: "var(--color-headache)"},
  { month: "TYPHOID", desktop: 305, fill: "var(--color-typhoid)" },
  { month: "COLD", desktop: 237, fill: "var(--color-cold)" },
  { month: "MALARIA", desktop: 273, fill: "var(--color-malaria)" },
  { month: "COUGH", desktop: 209, fill: "var(--color-cough)" },
  { month: "CHOLERA", desktop: 214, fill: "var(--color-cholera)" },
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
  cholera: {
    label: "CHOLERA",
    color: "#165001",
  },
} satisfies ChartConfig

export function ChartRadar({ className }: { className?: string }) {

  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed'

  return (
    <Card className={`flex flex-col justify-start max-lg:gap-y-10 rounded-3xl shadow-md h-full ${className} ${isCollapsed ? '' : ''}`}>
      <CardHeader className="relative">
        <CardTitle className="max-lg:absolute uppercase text-xs font-bold max-lg:text-lg">Causes range</CardTitle>
        {/* <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription> */}
      </CardHeader>
      <CardContent className="max-lg:mt-8 max-md:mt-10">
        <ChartContainer
          config={chartConfig}
          className="-mx-4 max-sm:-mx-3 aspect-square text-[11px] max-lg:text-[13px] max-md:h-96 max-md:m-auto max-sm:h-full max-sm:text-[10px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="month" />
            <PolarGrid />
            <Radar
              dataKey="desktop"
              fill="#0ed80ad8"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          January - June 2024
        </div>
      </CardFooter> */}
    </Card>
  )
}

