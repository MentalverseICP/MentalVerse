import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ChartInteractiveProps {
  className?: string;
}

const data = [
  { name: 'Scheduled', value: 45, color: '#18E614' },
  { name: 'In Progress', value: 25, color: '#F80D38' },
  { name: 'Completed', value: 20, color: '#6366F1' },
  { name: 'Cancelled', value: 10, color: '#F59E0B' },
];

const ChartInteractive: React.FC<ChartInteractiveProps> = ({ className }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className={`bg-transparent p-6 rounded-3xl shadow-md border w-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Appointment Status</h2>
        <div className="text-sm text-muted-foreground">Today: 15 appointments</div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  opacity={activeIndex === index ? 1 : 0.8}
                  stroke={activeIndex === index ? '#fff' : 'none'}
                  strokeWidth={activeIndex === index ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} appointments`, 'Count']}
              labelStyle={{ color: 'var(--foreground)' }}
              contentStyle={{ 
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: 'var(--foreground)' }}>
                  {value} ({entry.payload.value})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ChartInteractive };
