'use client';

interface GaugeChartProps {
  value: number;
  max?: number;
  title?: string;
  size?: number;
  thresholds?: {
    low: number;
    medium: number;
  };
  labels?: {
    low: string;
    medium: string;
    high: string;
  };
}

export default function GaugeChart({
  value,
  max = 100,
  title,
  size = 200,
  thresholds = { low: 60, medium: 80 },
  labels = { low: 'Needs Support', medium: 'Developing', high: 'Proficient' }
}: GaugeChartProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // SVG arc calculations
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Semicircle (180 degrees)
  const startAngle = -180;
  const endAngle = 0;
  const angleRange = endAngle - startAngle;
  const currentAngle = startAngle + (percentage / 100) * angleRange;

  // Convert angle to radians and calculate arc
  const polarToCartesian = (angle: number) => {
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad)
    };
  };

  const describeArc = (startAng: number, endAng: number) => {
    const start = polarToCartesian(endAng);
    const end = polarToCartesian(startAng);
    const largeArcFlag = endAng - startAng <= 180 ? 0 : 1;

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  // Determine level and color
  const getLevel = () => {
    if (percentage < thresholds.low) return { level: 'low', color: '#ef4444', label: labels.low };
    if (percentage < thresholds.medium) return { level: 'medium', color: '#f59e0b', label: labels.medium };
    return { level: 'high', color: '#10b981', label: labels.high };
  };

  const { color, label } = getLevel();

  // Needle position
  const needleAngle = startAngle + (percentage / 100) * angleRange;
  const needleLength = radius - 10;
  const needleEnd = polarToCartesian(needleAngle);
  const needleEndInner = {
    x: cx + needleLength * Math.cos((needleAngle * Math.PI) / 180),
    y: cy + needleLength * Math.sin((needleAngle * Math.PI) / 180)
  };

  return (
    <div className="flex flex-col items-center">
      {title && <h4 className="text-sm font-semibold text-slate-600 mb-2">{title}</h4>}

      <div className="relative" style={{ width: size, height: size / 2 + 40 }}>
        <svg width={size} height={size / 2 + 20} className="overflow-visible">
          {/* Background arc */}
          <path
            d={describeArc(startAngle, endAngle)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Colored segments */}
          <path
            d={describeArc(startAngle, startAngle + (thresholds.low / 100) * angleRange)}
            fill="none"
            stroke="#fee2e2"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={describeArc(
              startAngle + (thresholds.low / 100) * angleRange,
              startAngle + (thresholds.medium / 100) * angleRange
            )}
            fill="none"
            stroke="#fef3c7"
            strokeWidth={strokeWidth}
          />
          <path
            d={describeArc(
              startAngle + (thresholds.medium / 100) * angleRange,
              endAngle
            )}
            fill="none"
            stroke="#d1fae5"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <path
            d={describeArc(startAngle, currentAngle)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleEndInner.x}
            y2={needleEndInner.y}
            stroke="#1e293b"
            strokeWidth={3}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
          <circle cx={cx} cy={cy} r={8} fill="#1e293b" />
          <circle cx={cx} cy={cy} r={4} fill="white" />
        </svg>

        {/* Center value */}
        <div
          className="absolute text-center"
          style={{
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <p className="text-3xl font-bold" style={{ color }}>
            {Math.round(percentage)}%
          </p>
          <p className="text-sm font-medium text-slate-600">{label}</p>
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between w-full px-4 text-xs text-slate-400 mt-2">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
