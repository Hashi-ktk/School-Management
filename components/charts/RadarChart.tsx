'use client';

import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface RadarChartProps {
  data: Array<{ subject: string; score: number; fullMark?: number }>;
  title?: string;
  height?: number;
  showLegend?: boolean;
  color?: string;
}

export default function RadarChart({
  data,
  title,
  height = 300,
  showLegend = false,
  color = '#8b5cf6'
}: RadarChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-surface border border-white/10 rounded-xl p-3 shadow-lg bg-white">
          <p className="text-sm font-semibold text-slate-800">{payload[0].payload.subject}</p>
          <p className="text-lg font-bold text-purple-600">
            {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-slate-400" style={{ height }}>
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Complete assessments to see your skill radar</p>
        </div>
      </div>
    );
  }

  // Ensure all items have fullMark
  const chartData = data.map(item => ({
    ...item,
    fullMark: item.fullMark || 100
  }));

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-semibold text-slate-600 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid
            stroke="rgba(148, 163, 184, 0.3)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickCount={5}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
