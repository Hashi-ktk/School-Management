interface ProgressBarProps {
  current: number;
  total: number;
  percentage: number;
}

export default function ProgressBar({ current, total, percentage }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-[#0f172a]">
          {current} of {total} questions answered
        </span>
        <span className="font-bold text-[#00d4ff]">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden ring-1 ring-white/20">
        <div
          className="h-full bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] transition-all duration-500 ease-out shadow-[0_0_20px_rgba(0,212,255,0.5)]"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: ${Math.round(percentage)}%`}
        />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              idx < current
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]'
                : 'bg-white/10'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
