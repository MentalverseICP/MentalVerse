import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ChartRadarProps {
  className?: string;
}

const data = [
  { metric: 'Treatment Success', satisfaction: 85, outcomes: 78, fullMark: 100 },
  { metric: 'Communication', satisfaction: 92, outcomes: 88, fullMark: 100 },
  { metric: 'Professionalism', satisfaction: 95, outcomes: 91, fullMark: 100 },
  { metric: 'Accessibility', satisfaction: 78, outcomes: 82, fullMark: 100 },
  { metric: 'Follow-up Care', satisfaction: 88, outcomes: 85, fullMark: 100 },
  { metric: 'Overall Experience', satisfaction: 87, outcomes: 84, fullMark: 100 },
];

const ChartRadar: React.FC<ChartRadarProps> = ({ className }) => {
  return (
    <div className={`bg-transparent p-6 rounded-3xl shadow-md border w-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Patient Satisfaction & Outcomes</h2>
        <div className="text-sm text-muted-foreground">Q2 2024</div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="var(--border)" opacity={0.3} />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fill: 'var(--foreground)', fontSize: 10 }}
              tickLine={false}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Radar
              name="Satisfaction"
              dataKey="satisfaction"
              stroke="#18E614"
              fill="#18E614"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Outcomes"
              dataKey="outcomes"
              stroke="#F80D38"
              fill="#F80D38"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              formatter={(value: number, name: string) => [`${value}%`, name]}
            />
            <Legend 
              formatter={(value) => (
                <span style={{ color: 'var(--foreground)' }}>
                  {value === 'satisfaction' ? 'Patient Satisfaction' : 'Treatment Outcomes'}
                </span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-[#18E614]">87%</div>
          <div className="text-xs text-muted-foreground">Avg Satisfaction</div>
        </div>
        <div>
          <div className="text-lg font-bold text-[#F80D38]">84%</div>
          <div className="text-xs text-muted-foreground">Avg Outcomes</div>
        </div>
      </div>
    </div>
  );
};

export { ChartRadar };
