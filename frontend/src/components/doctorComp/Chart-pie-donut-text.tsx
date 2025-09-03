import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartDonutProps {
  className?: string;
}

const data = [
  { name: 'Anxiety', value: 35, color: '#18E614' },
  { name: 'Depression', value: 28, color: '#F80D38' },
  { name: 'PTSD', value: 18, color: '#6366F1' },
  { name: 'Bipolar', value: 12, color: '#F59E0B' },
  { name: 'Other', value: 7, color: '#8B5CF6' },
];

const ChartDonut: React.FC<ChartDonutProps> = ({ className }) => {
  return (
    <div className={`bg-transparent p-6 rounded-3xl shadow-md border w-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Patient Distribution</h2>
        <div className="text-sm text-muted-foreground">Total: 100 patients</div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} patients`, 'Count']}
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
                  {value} ({entry.payload.value}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartDonut;
