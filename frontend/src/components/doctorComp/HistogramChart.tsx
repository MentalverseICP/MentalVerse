import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HistogramChartProps {
  className?: string;
}

const data = [
  { time: '9AM', patients: 8, color: '#18E614' },
  { time: '10AM', patients: 12, color: '#18E614' },
  { time: '11AM', patients: 15, color: '#F80D38' },
  { time: '12PM', patients: 6, color: '#18E614' },
  { time: '1PM', patients: 10, color: '#18E614' },
  { time: '2PM', patients: 18, color: '#F80D38' },
  { time: '3PM', patients: 14, color: '#18E614' },
  { time: '4PM', patients: 9, color: '#18E614' },
  { time: '5PM', patients: 7, color: '#18E614' },
];

const HistogramChart: React.FC<HistogramChartProps> = ({ className }) => {
  return (
    <div className={`bg-transparent p-4 rounded-3xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-foreground">Patient Activity</h3>
        <div className="text-xs text-muted-foreground">Today's Schedule</div>
      </div>
      
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="var(--muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="var(--muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              formatter={(value: number) => [`${value} patients`, 'Count']}
            />
            <Bar 
              dataKey="patients" 
              radius={[2, 2, 0, 0]}
              fill="#8884d8"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>Peak: 2PM (18 patients)</span>
        <span>Total: 99 patients</span>
      </div>
    </div>
  );
};

export default HistogramChart;
