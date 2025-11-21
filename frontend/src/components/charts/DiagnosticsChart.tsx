import React, { useState, useEffect, useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTheme } from "../shared/theme-provider";

const chartConfig = {
  anxiety: {
    label: "Anxiety",
    color: "#12B80E",
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
} satisfies ChartConfig;

const fetchDiagnosticsData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const baseData = {
    anxiety: 45000,
    depression: 38000,
    stress: 55000,
    other: 49000,
  };

  const variation = 0.1;
  const data = Object.entries(baseData).map(([key, value]) => {
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation;
    const newValue = Math.floor(value * randomFactor);
    return {
      condition: key.toUpperCase(),
      patients: newValue,
      fill: `var(--color-${key})`,
    };
  });

  return data;
};

type ChartDataItem = {
  condition: string;
  patients: number;
  fill: string;
};

export default function DiagnosticsChart({ className = "" }) {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<null | string>(null);

  const totalPatients = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.patients, 0);
  }, [chartData]);

  const fetchData = async () => {
    try {
      setError(null);
      const data = await fetchDiagnosticsData();
      setChartData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative flex flex-col h-full rounded-3xl overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-white/[0.02] dark:bg-black/[0.02] backdrop-blur-xl" />
        <div className="absolute inset-0 border border-white/10 rounded-3xl" />

        {/* Corner glows */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#18E614]/10 rounded-bl-3xl blur-2xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#18E614]/10 rounded-tr-3xl blur-2xl" />

        <CardHeader className="relative items-start pb-2 mb-0 px-6 pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">
            Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="relative flex flex-1 justify-center items-center pb-0 px-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18E614]"></div>
        </CardContent>
        <CardFooter className="relative flex-col gap-2 text-sm px-6 pb-6">
          <div className="text-gray-500 text-xs">
            Loading mental health data...
          </div>
        </CardFooter>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative flex flex-col h-full rounded-3xl overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-white/[0.02] dark:bg-black/[0.02] backdrop-blur-xl" />
        <div className="absolute inset-0 border border-white/10 rounded-3xl" />

        <CardHeader className="relative items-start pb-2 mb-0 px-6 pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">
            Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="relative flex flex-1 justify-center items-center pb-0 px-6">
          <div className="text-red-500 text-xs sm:text-sm text-center px-2">
            {error}
          </div>
        </CardContent>
        <CardFooter className="relative flex-col gap-2 text-sm px-6 pb-6">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#18E614] text-black rounded-full text-xs hover:bg-[#18E614]/90 transition-colors"
          >
            Retry
          </button>
        </CardFooter>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col h-full rounded-3xl overflow-hidden ${className}`}
    >
      {/* Glassmorphic */}
      <div
        className={`absolute inset-0 ${
          theme === "dark"
            ? "bg-gradient-to-br from-[#0B0B0C]/60 to-[#0B0B0C]/40"
            : "bg-white/80"
        } backdrop-blur-xl`}
      />

      {/* Border */}
      <div className="absolute inset-0 rounded-3xl border border-white/10" />

      {/* Corner accent glows */}
      <div className="absolute top-0 -left-20 w-40 h-40 bg-[#18E614]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#18E614]/10 rounded-full blur-3xl" />

      {/* Subtle top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <Card className="relative flex flex-col h-full bg-transparent border-none shadow-none">
        <CardHeader className="flex-row items-start space-y-0 pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-1 sm:gap-0">
            <CardTitle className="uppercase font-bold text-xs flex items-center gap-2">
              Diagnostics
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block w-2 h-2 bg-[#18E614] rounded-full"
              />
            </CardTitle>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 justify-center pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-[200px] max-lg:w-[180px] max-md:w-[160px] max-sm:w-[140px]"
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
                nameKey="condition"
                innerRadius={50}
                strokeWidth={2}
                stroke={theme === "dark" ? "#1f1f1f" : "#fff"}
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
                            className={`text-2xl max-lg:text-xl max-md:text-lg font-bold ${
                              theme === "dark" ? "fill-white" : "fill-[#18E614]"
                            }`}
                          >
                            {totalPatients >= 100000
                              ? `${Math.floor(totalPatients / 1000)}k`
                              : totalPatients.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className={`text-[10px] font-bold uppercase tracking-wide ${
                              theme === "dark"
                                ? "fill-gray-400"
                                : "fill-gray-600"
                            }`}
                          >
                            Patients
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>

        <CardFooter className="flex-col gap-2 relative">
          <div className="flex flex-wrap items-center gap-4 max-sm:grid max-sm:grid-cols-4 max-sm:gap-2">
            {chartData.map((item, index) => {
              const colors = ["#18E614", "#FECA57", "#18E614", "#F80D38"];
              const labels = ["Anxiety", "Depression", "Stress", "Other"];
              return (
                <motion.div
                  key={`${labels[index]}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-1 min-w-0"
                >
                  <div
                    className="w-2 h-2 max-sm:w-1.5 max-sm:h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <span className="font-semibold text-[8px] max-sm:text-[10px] tracking-wide truncate">
                    {labels[index]}:{" "}
                    {item.patients >= 10000
                      ? `${Math.floor(item.patients / 1000)}k`
                      : item.patients.toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
