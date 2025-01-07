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
    <Card data-chart={id} className={`flex flex-col h-fit rounded-3xl shadow-md ${className}`}>
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="uppercase font-bold text-xs max-lg:text-lg">Patients</CardTitle>
          {/* <CardDescription>January - June 2024</CardDescription> */}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-[200px]"
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
                          className={`text-2xl font-bold ${theme === 'dark' ? 'fill-white' : 'fill-[#18E614]'}`}
                        >
                          11M
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className={`fill-[#18E614] text-[10px] font-bold uppercase tracking-wide ${theme === 'dark' ? 'fill-white' : 'fill-[#18E614]'}`}
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

      <div className="flex items-center">
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-xl pl-2 m-2"
            aria-label="Select a value"
          >
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {months.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig]

              if (!config) {
                return null
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
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
        {desktopData[activeIndex].desktop.toLocaleString()}%
      </div>

    </Card>
  )
}

