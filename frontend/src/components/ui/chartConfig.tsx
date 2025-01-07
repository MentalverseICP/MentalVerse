import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

let width: number | undefined, height: number | undefined, gradient: CanvasGradient | null;

function getGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: { left: number; right: number; top: number; bottom: number }
) {
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (!gradient || width !== chartWidth || height !== chartHeight) {
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, '#0c7533');
    gradient.addColorStop(0.5, '#129a1b');
    gradient.addColorStop(1, '#18e614');
  }
  return gradient;
}

export const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
    datalabels: {
      anchor: 'end',
      align: 'top',
      color: '#000000',
      font: {
        size: 10,
        family: 'Arial, sans-serif',
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      // barPercentage: 0.4, // Reduced width of the bars
      ticks: {
        color: '#000000',
        font: {
          size: 0,
          family: 'Arial, sans-serif',
        },
      },
    },
    y: {
      stacked: true,
      grid: { display: false },
      ticks: { display: false },
    },
  },
  categoryPercentage: 1, // Adjusted category spacing
  barPercentage: 0.3, // Adjust the width of the bars
  layout: {
    padding: {
      top: 10,
      bottom: 13,
      left: 12,
      right: 20,
    },
  },
  maintainAspectRatio: false,
};

export const chartData = {
  labels: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  datasets: [
    {
      type: 'bar' as const,
      label: 'Bar Dataset',
      data: [20, 23, 25, 27, 29, 30, 35, 40, 45, 50, 60, 70],
      backgroundColor: 'rgba(255, 255, 255, 0.267)',
      borderRadius: 6,
      borderSkipped: false,
    },
    {
      type: 'line' as const,
      label: 'Line Dataset',
      data: [30, 32, 34, 36, 38, 40, 45, 50, 55, 65, 75, 90],
      borderColor: function (context: any) {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) {
          return;
        }
        return getGradient(ctx, chartArea);
      },
      borderWidth: 2,
      pointStyle: true,
      pointBackgroundColor: '#44ff00',
      backgroundColor: function (context: any) {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) {
          return;
        }
        return getGradient(ctx, chartArea);
      },
      fill: true,
    },
  ],
};
