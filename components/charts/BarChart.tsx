'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BarChartProps {
  data: Array<{ subject: string; average: number; count: number; color: string }>;
  title?: string;
}

export default function BarChart({ data, title }: BarChartProps) {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-surface border border-white/10 rounded-xl p-3 shadow-lg">
          <p className="text-sm font-semibold text-[#0f172a]">{payload[0].payload.subject}</p>
          <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {payload[0].value}%
          </p>
          <p className="text-xs text-[#334155] mt-1">
            {payload[0].payload.count} {payload[0].payload.count === 1 ? 'attempt' : 'attempts'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-[#94a3b8]">
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Complete assessments to see subject comparison</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-semibold text-[#334155] mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis
            dataKey="subject"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            label={{ value: 'Average Score (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#94a3b8' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="average" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
