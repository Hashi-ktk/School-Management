'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

interface LineConfig {
  dataKey: string;
  name: string;
  color: string;
  strokeDasharray?: string;
}

interface MultiLineChartProps {
  data: Array<Record<string, any>>;
  lines: LineConfig[];
  xAxisKey?: string;
  title?: string;
  height?: number;
  showTarget?: boolean;
  targetValue?: number;
  targetLabel?: string;
  yAxisDomain?: [number, number];
}

export default function MultiLineChart({
  data,
  lines,
  xAxisKey = 'name',
  title,
  height = 300,
  showTarget = false,
  targetValue = 70,
  targetLabel = 'Target',
  yAxisDomain = [0, 100]
}: MultiLineChartProps) {
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
                {typeof entry.value === 'number' ? `${entry.value}%` : entry.value}
              </span>
            </div>
          ))}
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
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
          <XAxis
            dataKey={xAxisKey}
            stroke="#94a3b8"
            style={{ fontSize: '11px' }}
            tick={{ fill: '#64748b' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '11px' }}
            domain={yAxisDomain}
            tick={{ fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {showTarget && (
            <ReferenceLine
              y={targetValue}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{
                value: targetLabel,
                position: 'right',
                fill: '#ef4444',
                fontSize: 10
              }}
            />
          )}

          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray={line.strokeDasharray}
              dot={{ fill: line.color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
