'use client';

interface RankingItem {
  rank: number;
  name: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  avatar?: string;
  metadata?: Record<string, any>;
}

interface RankingTableProps {
  data: RankingItem[];
  title?: string;
  valueLabel?: string;
  showChange?: boolean;
  showTrend?: boolean;
  maxItems?: number;
  highlightTop?: number;
  onItemClick?: (item: RankingItem) => void;
}

export default function RankingTable({
  data,
  title,
  valueLabel = 'Score',
  showChange = true,
  showTrend = true,
  maxItems = 10,
  highlightTop = 3,
  onItemClick
}: RankingTableProps) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'bg-amber-400', text: 'text-amber-900', icon: '🥇' };
    if (rank === 2) return { bg: 'bg-slate-300', text: 'text-slate-700', icon: '🥈' };
    if (rank === 3) return { bg: 'bg-amber-600', text: 'text-amber-100', icon: '🥉' };
    return { bg: 'bg-slate-100', text: 'text-slate-600', icon: null };
  };

  const getTrendIndicator = (trend?: 'up' | 'down' | 'neutral', change?: number) => {
    if (!showTrend && !showChange) return null;

    if (trend === 'up' || (change && change > 0)) {
      return (
        <span className="text-emerald-600 text-xs font-medium flex items-center gap-0.5">
          <span>↑</span>
          {showChange && change && <span>+{change}</span>}
        </span>
      );
    }
    if (trend === 'down' || (change && change < 0)) {
      return (
        <span className="text-red-500 text-xs font-medium flex items-center gap-0.5">
          <span>↓</span>
          {showChange && change && <span>{change}</span>}
        </span>
      );
    }
    return (
      <span className="text-slate-400 text-xs font-medium">→</span>
    );
  };

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-emerald-600';
    if (value >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  const displayData = data.slice(0, maxItems);

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-8 text-center text-slate-400">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-600">{title}</h4>
          <span className="text-xs text-slate-400">{valueLabel}</span>
        </div>
      )}

      <div className="space-y-2">
        {displayData.map((item, index) => {
          const badge = getRankBadge(item.rank);
          const isHighlighted = item.rank <= highlightTop;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isHighlighted
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100'
                  : 'bg-slate-50 hover:bg-slate-100'
              } ${onItemClick ? 'cursor-pointer' : ''}`}
              onClick={() => onItemClick?.(item)}
            >
              {/* Rank Badge */}
              <div className={`w-8 h-8 rounded-full ${badge.bg} ${badge.text} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                {badge.icon || item.rank}
              </div>

              {/* Avatar or Initial */}
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {item.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Name and Subtitle */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                {item.subtitle && (
                  <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
                )}
              </div>

              {/* Trend */}
              <div className="flex-shrink-0">
                {getTrendIndicator(item.trend, item.change)}
              </div>

              {/* Value */}
              <div className={`text-right flex-shrink-0 ${getScoreColor(item.value)}`}>
                <span className="text-lg font-bold">{item.value}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {data.length > maxItems && (
        <div className="text-center mt-4">
          <span className="text-xs text-slate-400">
            Showing top {maxItems} of {data.length}
          </span>
        </div>
      )}
    </div>
  );
}
