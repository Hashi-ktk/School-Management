'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  comparison?: {
    label: string;
    value: string | number;
    type: 'vs-average' | 'vs-previous' | 'vs-target';
  };
  sparkline?: number[];
  color?: 'indigo' | 'emerald' | 'amber' | 'red' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
  trend,
  comparison,
  sparkline,
  color = 'indigo',
  size = 'md'
}: MetricCardProps) {
  const colorClasses = {
    indigo: {
      bg: 'from-indigo-50 to-indigo-100',
      text: 'text-indigo-600',
      accent: 'bg-indigo-500',
      light: 'bg-indigo-200'
    },
    emerald: {
      bg: 'from-emerald-50 to-emerald-100',
      text: 'text-emerald-600',
      accent: 'bg-emerald-500',
      light: 'bg-emerald-200'
    },
    amber: {
      bg: 'from-amber-50 to-amber-100',
      text: 'text-amber-600',
      accent: 'bg-amber-500',
      light: 'bg-amber-200'
    },
    red: {
      bg: 'from-red-50 to-red-100',
      text: 'text-red-600',
      accent: 'bg-red-500',
      light: 'bg-red-200'
    },
    blue: {
      bg: 'from-blue-50 to-blue-100',
      text: 'text-blue-600',
      accent: 'bg-blue-500',
      light: 'bg-blue-200'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100',
      text: 'text-purple-600',
      accent: 'bg-purple-500',
      light: 'bg-purple-200'
    }
  };

  const sizeClasses = {
    sm: { value: 'text-xl', title: 'text-xs', padding: 'p-3' },
    md: { value: 'text-2xl', title: 'text-sm', padding: 'p-4' },
    lg: { value: 'text-3xl', title: 'text-base', padding: 'p-5' }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600 bg-emerald-50';
    if (trend === 'down') return 'text-red-600 bg-red-50';
    return 'text-slate-600 bg-slate-50';
  };

  // Simple sparkline rendering
  const renderSparkline = () => {
    if (!sparkline || sparkline.length < 2) return null;

    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;
    const height = 30;
    const width = 60;
    const points = sparkline.map((v, i) => {
      const x = (i / (sparkline.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="ml-auto">
        <polyline
          points={points}
          fill="none"
          stroke={colorClasses[color].text.replace('text-', '#').replace('-600', '')}
          strokeWidth="2"
          className={colorClasses[color].text}
          style={{ stroke: 'currentColor' }}
        />
      </svg>
    );
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color].bg} rounded-xl border border-white/50 ${sizeClasses[size].padding}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className={`${sizeClasses[size].title} font-medium text-slate-600 uppercase tracking-wider`}>
            {title}
          </span>
        </div>
        {sparkline && renderSparkline()}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className={`${sizeClasses[size].value} font-bold ${colorClasses[color].text}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>

        {(change !== undefined || trend) && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            {change !== undefined && (
              <span>{change > 0 ? '+' : ''}{change}%</span>
            )}
            {changeLabel && <span className="text-slate-500 ml-1">{changeLabel}</span>}
          </div>
        )}
      </div>

      {comparison && (
        <div className="mt-3 pt-3 border-t border-white/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{comparison.label}</span>
            <span className={`font-medium ${
              comparison.type === 'vs-average' ? 'text-blue-600' :
              comparison.type === 'vs-previous' ? 'text-purple-600' :
              'text-amber-600'
            }`}>
              {comparison.value}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
