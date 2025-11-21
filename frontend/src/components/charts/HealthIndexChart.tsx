import React, { useState, useEffect } from "react";
import { XAxis, YAxis, CartesianGrid, Bar, BarChart } from "recharts";
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
import { TrendingUp } from "lucide-react";
import { useTheme } from "../shared/theme-provider";

const chartConfig = {
  healthIndex: {
    label: "Health Index",
    color: "#18E614",
  },
} satisfies ChartConfig;

const fetchHealthIndexData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const months = ["June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  const baseHealthIndex = [65, 68, 70, 72, 75, 73, 76];

  const variation = 0.05;
  const data = months.map((month, index) => {
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation;
    const newValue = Math.floor(baseHealthIndex[index] * randomFactor);
    return {
      month,
      healthIndex: newValue,
      fill: "#18E614",
    };
  });

  return data;
};

type ChartDataItem = {
  month: string;
  healthIndex: number;
  fill: string;
};

export default function HealthIndexChart({ className = "" }) {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<null | string>(null);
  const [currentHealthIndex, setCurrentHealthIndex] = useState(75);
  const [barSize, setBarSize] = useState(35);

  const fetchData = async () => {
    try {
      setError(null);
      const data = await fetchHealthIndexData();
      setChartData(data);
      setCurrentHealthIndex(data[data.length - 1]?.healthIndex || 75);
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
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setBarSize(window.innerWidth < 1024 ? 50 : 35);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`relative flex flex-col h-full rounded-3xl overflow-hidden ${className}`}
      >
        <div
          className={`absolute inset-0 ${
            theme === "dark" ? "bg-[#0B0B0C]/80" : "bg-white/80"
          } backdrop-blur-xl`}
        />
        <div className="absolute inset-0 border border-white/10 rounded-3xl" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#18E614]/20 rounded-full blur-3xl" />

        <CardHeader className="relative items-start pb-3 mb-0 px-6 pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">
            Health Index
          </CardTitle>
        </CardHeader>
        <CardContent className="relative flex flex-1 justify-center items-center pb-0 px-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18E614]"></div>
        </CardContent>
        <CardFooter className="relative flex-col gap-2 text-sm px-6 pb-6">
          <div className="text-gray-500 text-xs">Loading health data...</div>
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
        <div
          className={`absolute inset-0 ${
            theme === "dark" ? "bg-[#0B0B0C]/80" : "bg-white/80"
          } backdrop-blur-xl`}
        />
        <div className="absolute inset-0 border border-white/10 rounded-3xl" />

        <CardHeader className="relative items-start pb-3 mb-0 px-6 pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">
            Health Index
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
      transition={{ duration: 0.3, delay: 0.2 }}
      className={`relative flex flex-col h-full rounded-3xl overflow-hidden ${className}`}
    >
      {/* Glassmorphic background */}
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
      <div className="absolute top-0 -right-20 w-40 h-40 bg-[#18E614]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#18E614]/10 rounded-full blur-3xl" />

      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <Card className="relative flex flex-col h-full bg-transparent border-none shadow-none">
        <CardHeader className="flex-row items-start space-y-0 pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-1 sm:gap-0">
            <CardTitle className="uppercase font-bold text-xs flex items-center gap-2">
              Health Index
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
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Health Index Display */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center mb-4"
            >
              <span
                className={`text-4xl max-xl:text-3xl max-lg:text-2xl max-md:text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-[#18E614]"
                }`}
              >
                {currentHealthIndex}%
              </span>
              <TrendingUp className="text-[#F80D38] w-10 h-10 max-lg:w-8 max-lg:h-8 max-md:w-6 max-md:h-6 font-extrabold ml-2" />
            </motion.div>

            {/* Chart */}
            <ChartContainer
              config={chartConfig}
              className="w-full h-32 max-lg:h-28 max-md:h-24"
            >
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <ChartStyle id="health-index" config={chartConfig} />
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === "dark" ? "#2f3339" : "#e5e7eb"}
                  opacity={0.3}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: theme === "dark" ? "#9ca3af" : "#6b7280",
                  }}
                />
                <YAxis hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="healthIndex"
                  fill="#18E614"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={barSize}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <div className="flex flex-col items-start">
            <span
              className={`text-[10px] max-lg:text-[12px] ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Patient health rate
            </span>
            <span
              className={`text-[10px] max-lg:text-[12px] ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              from Jan to Dec.
            </span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}