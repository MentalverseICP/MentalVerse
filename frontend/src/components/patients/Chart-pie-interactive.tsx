"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const desktopData = [
  { month: "men", desktop: 40, fill: "var(--color-men)" },
  { month: "women", desktop: 48, fill: "var(--color-women)" },
  { month: "children", desktop: 12, fill: "var(--color-children)" },
  // { month: "april", desktop: 173, fill: "var(--color-april)" },
  // { month: "may", desktop: 209, fill: "var(--color-may)" },
]
import { useTheme } from "@/components/theme-provider"

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
  },
  mobile: {
    label: "Mobile",
  },
  men: {
    label: "MEN",
    color: "#F80D38",
  },
  women: {
    label: "WOMEN",
    color: "#0DB16A",
  },
  children: {
    label: "CHILDREN",
    color: "#FECA57",
  },
  // april: {
  //   label: "April",
  //   color: "hsl(var(--chart-4))",
  // },
  // may: {
  //   label: "May",
  //   color: "hsl(var(--chart-5))",
  // },
} satisfies ChartConfig

export function ChartInteractive({ className }: { className?: string }) {

  const { theme } = useTheme()

  const id = "pie-interactive"
  const [activeMonth, setActiveMonth] = React.useState(desktopData[0].month)

  const activeIndex = React.useMemo(
    () => desktopData.findIndex((item) => item.month === activeMonth),
    [activeMonth]
  )
  const months = React.useMemo(() => desktopData.map((item) => item.month), [])

  return (
    <Card data-chart={id} className={`flex flex-col h-full rounded-3xl shadow-md ${className}`}>
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="uppercase font-bold text-xs max-lg:text-md">Patients</CardTitle>
          {/* <CardDescription>January - June 2024</CardDescription> */}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-[200px] max-sm:w-[160px] max-[400px]:w-[140px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={desktopData}
              dataKey="desktop"
              nameKey="month"
              innerRadius={50}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 6} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 14}
                    innerRadius={outerRadius + 10}
                  />
                </g>
              )}
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
                          className={`text-2xl max-sm:text-xl max-[400px]:text-lg font-bold ${theme === 'dark' ? 'fill-white' : 'fill-[#18E614]'}`}
                        >
                          11M
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className={`fill-[#18E614] text-[10px] max-sm:text-[9px] max-[400px]:text-[8px] font-bold uppercase tracking-wide ${theme === 'dark' ? 'fill-white' : 'fill-[#18E614]'}`}
                        >
                          patients
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

      <div className="flex items-center max-sm:flex max-sm:items-center max-sm:gap-20 max-sm:px-4 max-sm:pb-2">
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto max-sm:ml-0 max-sm:w-full h-7 w-[130px] max-sm:h-8 rounded-xl pl-2 m-2 max-sm:m-0 max-sm:text-xs"
            aria-label="Select a value"
          >
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl max-sm:w-full">
            {months.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig]

              if (!config) {
                return null
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex max-sm:text-xs"
                >
                  <div className="flex items-center gap-2 text-xs max-sm:text-xs">
                    <span
                      className="flex h-3 w-3 max-sm:h-2.5 max-sm:w-2.5 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>  
        <span className="max-sm:text-sm max-sm:font-medium max-sm:ml-0 max-sm:px-0">
          {desktopData[activeIndex].desktop.toLocaleString()}%
        </span>
      </div>

    </Card>
  )
}