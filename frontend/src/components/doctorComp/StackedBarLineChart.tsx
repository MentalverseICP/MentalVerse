import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StackedBarLineChartProps {
  className?: string;
}

const data = [
  { month: 'Jan', patients: 65, revenue: 3200, growth: 12 },
  { month: 'Feb', patients: 78, revenue: 3800, growth: 20 },
  { month: 'Mar', patients: 90, revenue: 4200, growth: 15 },
  { month: 'Apr', patients: 85, revenue: 4100, growth: -6 },
  { month: 'May', patients: 95, revenue: 4600, growth: 12 },
  { month: 'Jun', patients: 110, revenue: 5200, growth: 16 },
];

const StackedBarLineChart: React.FC<StackedBarLineChartProps> = ({ className }) => {
  return (
    <div className={`bg-transparent p-6 rounded-3xl shadow-md border w-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Patient Growth & Revenue</h2>
        <div className="text-sm text-muted-foreground">Last 6 months</div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              yAxisId="left"
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              formatter={(value: any, name: string) => {
                if (name === 'patients') return [value, 'Patients'];
                if (name === 'revenue') return [`$${value}`, 'Revenue'];
                if (name === 'growth') return [`${value}%`, 'Growth'];
                return [value, name];
              }}
            />
            <Legend 
              formatter={(value) => (
                <span style={{ color: 'var(--foreground)' }}>
                  {value === 'patients' ? 'Patients' : value === 'revenue' ? 'Revenue' : 'Growth %'}
                </span>
              )}
            />
            <Bar 
              yAxisId="left"
              dataKey="patients" 
              fill="#18E614" 
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
            <Bar 
              yAxisId="left"
              dataKey="revenue" 
              fill="#F80D38" 
              radius={[4, 4, 0, 0]}
              opacity={0.6}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="growth" 
              stroke="#6366F1" 
              strokeWidth={3}
              dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#6366F1', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-[#18E614]">110</div>
          <div className="text-xs text-muted-foreground">Current Patients</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#F80D38]">$5,200</div>
          <div className="text-xs text-muted-foreground">Monthly Revenue</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#6366F1]">+16%</div>
          <div className="text-xs text-muted-foreground">Growth Rate</div>
        </div>
      </div>
    </div>
  );
};

export { StackedBarLineChart };
