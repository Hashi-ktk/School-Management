import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: "indigo" | "blue" | "emerald" | "amber" | "purple" | "pink" | "cyan" | "red";
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  sparkline?: number[];
}

const accents: Record<
  NonNullable<StatCardProps["accent"]>,
  { bg: string; text: string; icon: string; border: string; light: string; shadow: string }
> = {
  indigo: {
    bg: "bg-gradient-to-br from-indigo-50 to-indigo-100/50",
    text: "text-indigo-600",
    icon: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    border: "border-indigo-200/60",
    light: "bg-indigo-500/10",
    shadow: "shadow-indigo-500/10"
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-purple-100/50",
    text: "text-purple-600",
    icon: "bg-gradient-to-br from-purple-500 to-purple-600",
    border: "border-purple-200/60",
    light: "bg-purple-500/10",
    shadow: "shadow-purple-500/10"
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
    text: "text-blue-600",
    icon: "bg-gradient-to-br from-blue-500 to-blue-600",
    border: "border-blue-200/60",
    light: "bg-blue-500/10",
    shadow: "shadow-blue-500/10"
  },
  cyan: {
    bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/50",
    text: "text-cyan-600",
    icon: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    border: "border-cyan-200/60",
    light: "bg-cyan-500/10",
    shadow: "shadow-cyan-500/10"
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
    text: "text-emerald-600",
    icon: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    border: "border-emerald-200/60",
    light: "bg-emerald-500/10",
    shadow: "shadow-emerald-500/10"
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-50 to-orange-100/50",
    text: "text-amber-600",
    icon: "bg-gradient-to-br from-amber-500 to-orange-500",
    border: "border-amber-200/60",
    light: "bg-amber-500/10",
    shadow: "shadow-amber-500/10"
  },
  pink: {
    bg: "bg-gradient-to-br from-pink-50 to-pink-100/50",
    text: "text-pink-600",
    icon: "bg-gradient-to-br from-pink-500 to-pink-600",
    border: "border-pink-200/60",
    light: "bg-pink-500/10",
    shadow: "shadow-pink-500/10"
  },
  red: {
    bg: "bg-gradient-to-br from-red-50 to-red-100/50",
    text: "text-red-600",
    icon: "bg-gradient-to-br from-red-500 to-red-600",
    border: "border-red-200/60",
    light: "bg-red-500/10",
    shadow: "shadow-red-500/10"
  },
};

// Mini sparkline component
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  accent = "indigo",
  trend,
  sparkline,
}: StatCardProps) {
  const palette = accents[accent];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${palette.bg} ${palette.border} border p-5 md:p-6 shadow-lg ${palette.shadow} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
    >
      {/* Background decoration */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 ${palette.light} rounded-full blur-2xl`} />
      <div className={`absolute -bottom-4 -left-4 w-16 h-16 ${palette.light} rounded-full blur-xl`} />

      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`text-3xl md:text-4xl font-bold ${palette.text}`}>
              {value}
            </span>
            {trend && (
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                trend.direction === 'up'
                  ? 'bg-emerald-100 text-emerald-700'
                  : trend.direction === 'down'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600'
              }`}>
                {trend.direction === 'up' && (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                )}
                {trend.direction === 'down' && (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}

          {/* Sparkline */}
          {sparkline && sparkline.length > 0 && (
            <div className="pt-2">
              <Sparkline
                data={sparkline}
                color={palette.text.replace('text-', '').replace('-600', '')}
              />
            </div>
          )}
        </div>

        <div
          className={`flex-shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-xl ${palette.icon} text-white grid place-content-center shadow-lg text-xl md:text-2xl`}
        >
          {icon || (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          )}
        </div>
      </div>

      {/* Bottom progress indicator */}
      <div className="mt-4 h-1.5 rounded-full bg-white/60 overflow-hidden">
        <div
          className={`h-full ${palette.icon} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: '75%' }}
        />
      </div>
    </div>
  );
}


