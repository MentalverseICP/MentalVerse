"use client"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useTheme } from "@/components/shared/theme-provider"

const colors = {
  "ANXIETY LEVELS": "#F80D38",
  "DEPRESSION SCORE": "#12B80E", 
  "STRESS FACTORS": "#FECA57",
  "MOOD STABILITY": "#57dafe",
  "SLEEP QUALITY": "#b10d8d"
};

const chartData = [
  { month: "ANXIETY LEVELS", desktop: 186, fill: colors["ANXIETY LEVELS"] },
  { month: "DEPRESSION SCORE", desktop: 305, fill: colors["DEPRESSION SCORE"] },
  { month: "STRESS FACTORS", desktop: 237, fill: colors["STRESS FACTORS"] },
  { month: "MOOD STABILITY", desktop: 273, fill: colors["MOOD STABILITY"] },
  { month: "SLEEP QUALITY", desktop: 209, fill: colors["SLEEP QUALITY"] },
]

const chartConfig = {
  desktop: {
    label: "Range",
    color: "hsl(var(--chart-1))",
  },
  anxiety: {
    label: "ANXIETY LEVELS",
    color: colors["ANXIETY LEVELS"],
  },
  depression: {
    label: "DEPRESSION SCORE",
    color: colors["DEPRESSION SCORE"],
  },
  stress: {
    label: "STRESS FACTORS",
    color: colors["STRESS FACTORS"],
  },
  mood: {
    label: "MOOD STABILITY",
    color: colors["MOOD STABILITY"],
  },
  sleep: {
    label: "SLEEP QUALITY",
    color: colors["SLEEP QUALITY"],
  },
} satisfies ChartConfig

const legendItems = [
  { name: "MOOD STABILITY", color: colors["MOOD STABILITY"] },
  { name: "STRESS FACTORS", color: colors["STRESS FACTORS"] },
  { name: "DEPRESSION SCORE", color: colors["DEPRESSION SCORE"] },
  { name: "SLEEP QUALITY", color: colors["SLEEP QUALITY"] },
  { name: "ANXIETY LEVELS", color: colors["ANXIETY LEVELS"] },
]

export function ChartRadar({ className }: { className?: string }) {
  const { theme } = useTheme()
  const [fontSize, setFontSize] = useState(10)
  const [dotRadius, setDotRadius] = useState(4)
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setFontSize(7)
        setDotRadius(3)
      } else if (width < 768) {
        setFontSize(8)
        setDotRadius(3.5)
      } else if (width < 1024) {
        setFontSize(9)
        setDotRadius(4)
      } else {
        setFontSize(10)
        setDotRadius(5)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={`relative rounded-3xl overflow-hidden h-full ${className}`}
    >
      <div className={`absolute inset-0 ${
        theme === 'dark' 
          ? 'bg-[#0B0B0C]/70' 
          : 'bg-white/70'
      } backdrop-blur-xl`} />
      
      <div className="absolute inset-0 rounded-3xl border border-white/10" />
      
      {/* Corner glows */}
      <div className="absolute top-0 -right-20 w-40 h-40 bg-[#F80D38]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#FECA57]/10 rounded-full blur-3xl" />
      
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative flex flex-col justify-between h-full">
        <div className="p-3 sm:p-6 pb-1 sm:pb-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 mb-2"
          >
            <div className={`w-3 h-3 rounded-full ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                : 'bg-gradient-to-br from-pink-400 to-pink-500'
            }`} />
            <h3 className={`uppercase font-bold text-xs sm:text-sm ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Health Metrics
            </h3>
          </motion.div>
          <p className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Your wellness indicators
          </p>
        </div>
        
        <div className="flex-1 flex flex-col justify-center px-2 sm:px-4 py-2 sm:py-4">
          <ChartContainer
            config={chartConfig}
            className="w-full h-full max-h-[200px] sm:max-h-[250px] md:max-h-[300px] lg:max-h-full aspect-square mx-auto"
          >
            <RadarChart 
              data={chartData} 
              margin={{ 
                top: 20, 
                right: 20, 
                bottom: 20, 
                left: 20 
              }}
            >
              <ChartTooltip 
                cursor={false} 
                content={<ChartTooltipContent 
                  className={`${
                    theme === 'dark'
                      ? 'bg-gray-900/95 border border-gray-700 text-white'
                      : 'bg-white/95 border border-gray-300 text-gray-900'
                  } backdrop-blur-md rounded-lg shadow-lg`}
                />} 
              />
              <PolarAngleAxis 
                dataKey="month" 
                tick={{ 
                  fontSize: fontSize, 
                  fill: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  fontWeight: 600
                }}
                tickLine={false}
              />
              <PolarGrid 
                stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                strokeWidth={1.5}
                radialLines={true}
              />

              <Radar
                dataKey="desktop"
                stroke="#18E614"
                strokeWidth={2.5}
                fill="#18E614"
                fillOpacity={0.15}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const color = colors[payload.month as keyof typeof colors] || "#18E614";
                  return (
                    <motion.g key={`${cx}-${cy}`}>
                      <motion.circle
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.3 }}
                        transition={{ delay: 0.5 }}
                        cx={cx}
                        cy={cy}
                        r={dotRadius}
                        fill={color}
                        stroke="white"
                        strokeWidth={2}
                        className="drop-shadow-lg cursor-pointer"
                        style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
                      />
                    </motion.g>
                  );
                }}
              />
            </RadarChart>
          </ChartContainer>
        </div>
        
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-1.5 sm:gap-2">
            {legendItems.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.08 }}
                className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg transition-all hover:bg-white/5 cursor-pointer ${
                  theme === 'dark'
                    ? 'hover:bg-white/10'
                    : 'hover:bg-black/5'
                }`}
              >
                <motion.div 
                  whileHover={{ scale: 1.3 }}
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 shadow-lg"
                  style={{ 
                    backgroundColor: item.color,
                    boxShadow: `0 0 12px ${item.color}60`
                  }}
                />
                <span className={`font-medium text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs truncate leading-tight ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                }`}>
                  {item.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}