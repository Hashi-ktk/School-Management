'use client';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
}

export default function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = '#8b5cf6',
  bgColor = '#e2e8f0',
  label,
  sublabel,
  showPercentage = true,
}: ProgressRingProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on percentage if not provided
  const getAutoColor = () => {
    if (percentage >= 80) return '#10b981'; // Green
    if (percentage >= 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const finalColor = color === 'auto' ? getAutoColor() : color;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={bgColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={finalColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {showPercentage && (
              <p
                className="font-bold"
                style={{
                  fontSize: size * 0.2,
                  color: finalColor
                }}
              >
                {Math.round(percentage)}%
              </p>
            )}
            {label && (
              <p
                className="text-slate-600 font-medium"
                style={{ fontSize: size * 0.1 }}
              >
                {label}
              </p>
            )}
          </div>
        </div>
      </div>
      {sublabel && (
        <p className="text-sm text-slate-500 mt-2 text-center">{sublabel}</p>
      )}
    </div>
  );
}
