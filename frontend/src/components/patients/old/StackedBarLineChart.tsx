"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const options: ChartOptions<"bar" | "line"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Mixed Bar + Line Chart",
    },
  },
};

const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

const data: ChartData<"bar" | "line", number[], string> = {
  labels,
  datasets: [
    {
      type: "bar" as const,
      label: "Bar Dataset",
      data: [30, 40, 45, 60, 70, 80, 95],
      backgroundColor: "rgba(53, 162, 235, 0.5)",
      borderRadius: 8,
      borderSkipped: false,
    },
    {
      type: "line" as const,
      label: "Line Dataset",
      data: [20, 30, 40, 50, 60, 70, 85],
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 2,
      pointStyle: "circle", // ✅ must be a valid string, not boolean
      pointBackgroundColor: "rgba(255, 99, 132, 1)",
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      fill: true,
    },
  ],
};

export default function MixedChart() {
  return <Chart type="bar" options={options} data={data} />;
}
