'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

interface ComparisonBarChartProps {
  data: Array<{
    name: string;
    current: number;
    previous?: number;
    benchmark?: number;
    [key: string]: any;
  }>;
  title?: string;
  height?: number;
  showBenchmark?: boolean;
  benchmarkValue?: number;
  benchmarkLabel?: string;
  currentLabel?: string;
  previousLabel?: string;
}

export default function ComparisonBarChart({
  data,
  title,
  height = 300,
  showBenchmark = true,
  benchmarkValue = 70,
  benchmarkLabel = 'Target',
  currentLabel = 'Current',
  previousLabel = 'Previous'
}: ComparisonBarChartProps) {
  const hasPrevious = data.some(d => d.previous !== undefined);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
          <p className="text-sm font-semibold text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600">{entry.name}:</span>
              <span className="font-bold" style={{ color: entry.color }}>
                {entry.value}%
              </span>
            </div>
          ))}
          {hasPrevious && payload[0]?.payload?.previous !== undefined && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <span className={`text-xs font-medium ${
                payload[0].value > payload[0].payload.previous
                  ? 'text-emerald-600'
                  : payload[0].value < payload[0].payload.previous
                    ? 'text-red-500'
                    : 'text-slate-500'
              }`}>
                {payload[0].value > payload[0].payload.previous
                  ? `↑ +${(payload[0].value - payload[0].payload.previous).toFixed(1)}%`
                  : payload[0].value < payload[0].payload.previous
                    ? `↓ ${(payload[0].value - payload[0].payload.previous).toFixed(1)}%`
                    : '→ No change'}
              </span>
            </div>
          )}
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

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-semibold text-slate-600 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            style={{ fontSize: '11px' }}
            tick={{ fill: '#64748b' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '11px' }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {showBenchmark && (
            <ReferenceLine
              y={benchmarkValue}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{
                value: benchmarkLabel,
                position: 'right',
                fill: '#ef4444',
                fontSize: 10
              }}
            />
          )}

          {hasPrevious && (
            <Bar
              dataKey="previous"
              name={previousLabel}
              fill="#cbd5e1"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          )}

          <Bar
            dataKey="current"
            name={currentLabel}
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
