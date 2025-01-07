"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { useTheme } from "@/components/theme-provider"


import {
  Card,
  CardContent,
  // CardDescription,
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
const chartData = [
  { sicknesses: "TYPHOID =", patients: 18000, fill: "var(--color-typhoid)" },
  { sicknesses: "COLD =", patients: 36000, fill: "var(--color-cold)" },
  { sicknesses: "MALARIA =", patients: 55000, fill: "var(--color-malaria)" },
  { sicknesses: "OTHERS =", patients: 78000, fill: "var(--color-other)" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  typhoid: {
    label: "Typhoid",
    color: "#0DB16A",
  },
  cold: {
    label: "Cold",
    color: "#FECA57",
  },
  malaria: {
    label: "Malaria",
    color: "#18E614",
  },
  other: {
    label: "Other",
    color: "#F80D38",
  },
} satisfies ChartConfig

export function ChartDonut({className}: {className? : string}) {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.patients, 0)
  }, [])

  const { theme } = useTheme()

  // const chartItems = [
  //   {
  //     label: "Typhoid",
  //     color: "#0DB16A",
  //   },
  //   {
  //     label: "Cold",
  //     color: "#FECA57",
  //   },
  //   {
  //     label: "Malaria",
  //     color: "#18E614",
  //   },
  //   {
  //     label: "Other",
  //     color: "#F80D38",
  //   }
  // ] 

  return (
    <Card className={`flex flex-col h-fit rounded-3xl shadow-md ${className}`}>
      <CardHeader className="items-start pb-0 mb-0">
        <CardTitle className="uppercase font-bold text-xs max-lg:text-lg">Diagnostics</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="patients"
              nameKey="sicknesses"
              innerRadius={50}
              strokeWidth={5}
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
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className={`text-2xl font-bold ${theme === 'dark' ? 'fill-white' : 'fill-[#18E614]'}`}
                        >
                          {`${totalVisitors >= 100000 ? Math.floor(totalVisitors / 1000).toFixed(1) : totalVisitors.toLocaleString()}k`}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className={`fill-[#18E614] text-[10px] font-bold uppercase tracking-wide ${theme === 'dark' ? 'fill-white' : 'fill-[#18E614]'}`}
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
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex flex-wrap items-center gap-5">
          {/* {chartItems.map((item) => 
            <div className="flex items-center gap-1" key={item.color}>
              <div className={`w-2 h-2 rounded-full bg-[${item.color}] border`} />
              <span className="font-bold text-[9px] tracking-wide">{item.label}</span>  
            </div>   
          )} */}
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full bg-[#0DB16A]`} />
              <span className="font-bold text-[9px] max-md:text-[12px] max-sm:text-[15px] tracking-wide">Typhoid</span>  
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full bg-[#FECA57]`} />
              <span className="font-bold text-[9px] max-md:text-[12px] max-sm:text-[15px] tracking-wide">Cold</span>  
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full bg-[#18E614]`} />
              <span className="font-bold text-[9px] max-md:text-[12px] max-sm:text-[15px] tracking-wide">Malaria</span>  
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full bg-[#F80D38]`} />
              <span className="font-bold text-[9px] max-md:text-[12px] max-sm:text-[15px] tracking-wide">Other</span>  
            </div>
        </div>

      </CardFooter>
    </Card>
  )
}

