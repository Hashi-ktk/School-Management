'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

interface DistributionChartProps {
  data: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  title?: string;
  height?: number;
  highlightRange?: string;
  averageValue?: number;
}

export default function DistributionChart({
  data,
  title,
  height = 250,
  highlightRange,
  averageValue
}: DistributionChartProps) {
  const getBarColor = (range: string, index: number) => {
    if (highlightRange && range === highlightRange) {
      return '#6366f1';
    }
    // Color gradient from red to green based on score range
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981'];
    return colors[Math.min(index, colors.length - 1)];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-800">{data.range}</p>
          <p className="text-lg font-bold text-indigo-600">{data.count} students</p>
          <p className="text-xs text-slate-500">{data.percentage.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-slate-400" style={{ height }}>
        <p>No data available</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-semibold text-slate-600 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
          <XAxis
            dataKey="range"
            stroke="#94a3b8"
            style={{ fontSize: '10px' }}
            tick={{ fill: '#64748b' }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '11px' }}
            tick={{ fill: '#64748b' }}
            domain={[0, Math.ceil(maxCount * 1.2)]}
          />
          <Tooltip content={<CustomTooltip />} />

          {averageValue !== undefined && (
            <ReferenceLine
              x={`${Math.floor(averageValue / 10) * 10}-${Math.floor(averageValue / 10) * 10 + 9}%`}
              stroke="#6366f1"
              strokeDasharray="5 5"
              label={{
                value: `Avg: ${averageValue}%`,
                position: 'top',
                fill: '#6366f1',
                fontSize: 10
              }}
            />
          )}

          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.range, index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <div className="text-center">
          <span className="text-slate-500">Total:</span>
          <span className="ml-1 font-bold text-slate-700">
            {data.reduce((sum, d) => sum + d.count, 0)}
          </span>
        </div>
        {averageValue !== undefined && (
          <div className="text-center">
            <span className="text-slate-500">Average:</span>
            <span className="ml-1 font-bold text-indigo-600">{averageValue}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
