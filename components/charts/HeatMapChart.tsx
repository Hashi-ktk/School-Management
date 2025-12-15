'use client';

interface HeatMapCell {
  x: string;
  y: string;
  value: number;
  label?: string;
}

interface HeatMapChartProps {
  data: HeatMapCell[];
  xLabels: string[];
  yLabels: string[];
  title?: string;
  minColor?: string;
  maxColor?: string;
  showValues?: boolean;
  height?: number;
}

export default function HeatMapChart({
  data,
  xLabels,
  yLabels,
  title,
  minColor = '#fee2e2',
  maxColor = '#10b981',
  showValues = true,
  height = 300
}: HeatMapChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);

  const getColor = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue || 1);

    // Interpolate between colors based on value
    if (ratio < 0.33) {
      return '#fee2e2'; // Light red
    } else if (ratio < 0.5) {
      return '#fef3c7'; // Light yellow
    } else if (ratio < 0.7) {
      return '#d1fae5'; // Light green
    } else if (ratio < 0.85) {
      return '#6ee7b7'; // Medium green
    } else {
      return '#10b981'; // Dark green
    }
  };

  const getTextColor = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue || 1);
    return ratio > 0.7 ? 'white' : '#374151';
  };

  const getValue = (x: string, y: string): number => {
    const cell = data.find(d => d.x === x && d.y === y);
    return cell?.value ?? 0;
  };

  const getLabel = (x: string, y: string): string => {
    const cell = data.find(d => d.x === x && d.y === y);
    return cell?.label ?? `${cell?.value ?? 0}%`;
  };

  const cellWidth = 100 / xLabels.length;

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-semibold text-slate-600 mb-4">{title}</h4>}

      <div className="overflow-x-auto">
        <div style={{ minWidth: Math.max(xLabels.length * 80, 300) }}>
          {/* X-axis labels */}
          <div className="flex mb-2 pl-24">
            {xLabels.map((label, i) => (
              <div
                key={i}
                className="text-xs text-slate-500 font-medium text-center truncate px-1"
                style={{ width: `${cellWidth}%` }}
                title={label}
              >
                {label.length > 10 ? label.substring(0, 10) + '...' : label}
              </div>
            ))}
          </div>

          {/* Grid */}
          {yLabels.map((yLabel, yi) => (
            <div key={yi} className="flex items-center mb-1">
              {/* Y-axis label */}
              <div
                className="w-24 pr-2 text-xs text-slate-500 font-medium text-right truncate flex-shrink-0"
                title={yLabel}
              >
                {yLabel.length > 12 ? yLabel.substring(0, 12) + '...' : yLabel}
              </div>

              {/* Cells */}
              <div className="flex flex-1">
                {xLabels.map((xLabel, xi) => {
                  const value = getValue(xLabel, yLabel);
                  const label = getLabel(xLabel, yLabel);
                  return (
                    <div
                      key={xi}
                      className="aspect-square rounded-md mx-0.5 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                      style={{
                        width: `${cellWidth}%`,
                        backgroundColor: getColor(value),
                        minHeight: 40
                      }}
                      title={`${yLabel} × ${xLabel}: ${label}`}
                    >
                      {showValues && (
                        <span
                          className="text-xs font-bold"
                          style={{ color: getTextColor(value) }}
                        >
                          {Math.round(value)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
        <span>Low</span>
        <div className="flex gap-0.5">
          {['#fee2e2', '#fef3c7', '#d1fae5', '#6ee7b7', '#10b981'].map((color, i) => (
            <div
              key={i}
              className="w-6 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span>High</span>
      </div>
    </div>
  );
}
