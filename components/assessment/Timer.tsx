interface TimerProps {
  timeRemaining: number; // in seconds
  isWarning: boolean;
  isCritical: boolean;
}

export default function Timer({ timeRemaining, isWarning, isCritical }: TimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const colorClass = isCritical
    ? 'text-[#ff6b6b] bg-[#ff6b6b]/10 border-[#ff6b6b]/30'
    : isWarning
    ? 'text-[#ffd060] bg-[#ffd060]/10 border-[#ffd060]/30'
    : 'text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/30';

  const iconClass = isCritical ? '⏰' : isWarning ? '⏱️' : '⏲️';

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl glass-surface border ${colorClass} transition-colors`}
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${minutes} minutes and ${seconds} seconds`}
    >
      <span className="text-lg">{iconClass}</span>
      <span className="text-lg font-bold font-mono">{timeString}</span>
      {isCritical && (
        <span className="text-xs font-semibold uppercase tracking-wider animate-pulse">
          Hurry!
        </span>
      )}
      {isWarning && !isCritical && (
        <span className="text-xs font-semibold uppercase tracking-wider">
          Time low
        </span>
      )}
    </div>
  );
}
