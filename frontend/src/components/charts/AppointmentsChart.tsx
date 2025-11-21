import { useState, useEffect } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
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

interface ChartData {
  month: string;
  emergency: number;
  examination: number;
  consultation: number;
  routine: number;
  sick: number;
}

const chartConfig = {
  emergency: {
    label: "Emergency",
    color: "#18E614",
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
} satisfies ChartConfig;

const appointmentTypes: (keyof Omit<ChartData, "month">)[] = [
  "emergency",
  "examination",
  "consultation",
  "routine",
  "sick",
];

const fetchAppointmentsData = async (): Promise<ChartData[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const months = [
    "April",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const variation = 0.1;

  const data = months.map((month, index) => {
    const monthData: Partial<ChartData> = { month };

    appointmentTypes.forEach((type, typeIndex) => {
      const baseValue = [120, 80, 150, 100, 90][typeIndex] + index * 10;
      const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation;
      monthData[type] = Math.floor(baseValue * randomFactor);
    });

    return monthData as ChartData;
  });

  return data;
};

export default function AppointmentsChart({ className = "" }) {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<null | string>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const data = await fetchAppointmentsData();
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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative flex flex-col h-full ${className}`}
      >
        <div
          className={`absolute inset-0 ${
            theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
          } backdrop-blur-md rounded-2xl`}
        />
        <div className="absolute inset-0 border border-white/5 rounded-2xl" />

        <CardHeader className="relative items-start pb-2 mb-0 px-3 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">
            Overall Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="relative flex flex-1 justify-center items-center pb-0 px-3 sm:px-6">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#18E614]"></div>
        </CardContent>
        <CardFooter className="relative flex-col gap-2 text-sm px-3 pb-3 sm:px-6 sm:pb-6">
          <div className="text-gray-500 text-xs">
            Loading appointment data...
          </div>
        </CardFooter>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`relative flex flex-col h-full ${className}`}
      >
        <div
          className={`absolute inset-0 ${
            theme === "dark" ? "bg-[#0B0B0C]/60" : "bg-white/60"
          } backdrop-blur-md rounded-2xl`}
        />
        <div className="absolute inset-0 border border-white/5 rounded-2xl" />

        <CardHeader className="relative items-start pb-2 mb-0 px-3 pt-3 sm:px-6 sm:pt-6">
          <CardTitle className="uppercase font-bold text-xs sm:text-sm">
            Overall Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="relative flex flex-1 justify-center items-center pb-0 px-3 sm:px-6">
          <div className="text-red-500 text-xs sm:text-sm text-center px-2">
            {error}
          </div>
        </CardContent>
        <CardFooter className="relative flex-col gap-2 text-sm px-3 pb-3 sm:px-6 sm:pb-6">
          <button
            onClick={fetchData}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#18E614] text-black rounded-full text-xs hover:bg-[#18E614]/90 transition-colors"
          >
            Retry
          </button>
        </CardFooter>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col h-auto w-full p-0 border-none rounded-none shadow-none ${className}`}
    >
      {/* Minimal corner glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#57dafe]/10 rounded-full blur-3xl" />

      <Card className="relative flex flex-col h-auto w-full bg-transparent border-none shadow-none">
        <CardHeader className="flex-row items-start space-y-0 py-3 px-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-1 sm:gap-0">
            <CardTitle className="uppercase font-bold text-xs max-lg:text-md flex items-center gap-2">
              Overall Appointments
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#18E614] rounded-full"
              />
            </CardTitle>
            <div className="text-xs text-gray-500 dark:text-gray-400">
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
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <ChartStyle id="appointments" config={chartConfig} />
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
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: theme === "dark" ? "#9ca3af" : "#6b7280",
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="emergency"
                stackId="a"
                fill="#18E614"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="examination"
                stackId="a"
                fill="#FECA57"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="consultation"
                stackId="a"
                fill="#18E614"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="routine"
                stackId="a"
                fill="#F80D38"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="sick"
                stackId="a"
                fill="#57dafe"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <div className="flex flex-wrap items-center gap-4 max-sm:grid max-sm:grid-cols-5 max-sm:gap-1">
            {Object.entries(chartConfig).map(([key, config]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 min-w-0"
              >
                <div
                  className="w-2 h-2 max-sm:w-1.5 max-sm:h-1.5 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: config.color }}
                />
                <span className="font-semibold text-[8px] max-sm:text-[9px] tracking-wide truncate">
                  {config.label}
                </span>
              </motion.div>
            ))}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
