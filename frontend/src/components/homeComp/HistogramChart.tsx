import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

interface prop {
  className?: string;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        // color: '#fff',
        font: {
          size: 12,
        },
        usePointStyle: true, // Enables circular legend icons
        padding: 10, // Adds space between items for better visuals
      },
    },
    tooltip: {
      enabled: false,
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: {
        // darkolor: '#ffffff',
        font: {
          size: 10,
        },
      },
    },
    y: {
      stacked: true,
      grid: { display: false },
      ticks: { display: false }, // Remove side numbers
    },
  },
  barPercentage: 0.6, // Adjust the width of the bars
  layout: {
    padding: {
      top: 10,
      left: 0,
      right: 0,
    },
  },
  maintainAspectRatio: false,
};

const chartData = {
  labels: ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  datasets: [
    {
      label: 'Emergency',
      data: [5, 10, 15, 20, 25, 30, 35, 15, 5],
      backgroundColor: '#0b6b00',
    },
    {
      label: 'Examination',
      data: [8, 15, 12, 22, 18, 20, 25, 10, 5],
      backgroundColor: '#ffc107',
    },
    {
      label: 'Routine Checkup',
      data: [2, 3, 4, 6, 5, 10, 12, 3, 1],
      backgroundColor: '#ff0000',
    },
    {
      label: 'Consultation', 
      data: [3, 7, 8, 10, 15, 10, 18, 5, 5],
      backgroundColor: '#00ff11',
    },
    {
      label: 'Sick Visit',
      data: [1, 2, 3, 5, 7, 8, 10, 2, 1],
      backgroundColor: '#17a2b8',
      borderRadius: {
        topLeft: 10,
        topRight: 10,
      },
    },
  ],
};

const HistogramChart: React.FC<prop> = ({ className }) => {
  return (
    <div className={`sm:w-full w-11/12 bg-transparent p-6 border-b xl:border-b-[#2f3339] ${className}`}>
      <h2 className="dark:text-white text-sm font-bold mb-4">Overall Appointments</h2>
      <div className="relative h-64">
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  );
};

export default HistogramChart;
