'use client';

import { useState, useEffect } from 'react';

interface AdaptiveLevelIndicatorProps {
  currentAbility: number; // 1.0 to 4.0 scale
  questionsAnswered: number;
  correctCount: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  showDetails?: boolean;
}

const LEVEL_CONFIG = [
  { min: 3.5, label: 'Mastery', color: 'from-purple-500 to-indigo-600', emoji: '🏆', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { min: 3.0, label: 'Advanced', color: 'from-blue-500 to-cyan-500', emoji: '⭐', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { min: 2.5, label: 'Proficient', color: 'from-emerald-500 to-teal-500', emoji: '✨', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { min: 2.0, label: 'Developing', color: 'from-amber-500 to-orange-500', emoji: '📈', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { min: 1.5, label: 'Basic', color: 'from-orange-500 to-red-400', emoji: '🌱', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { min: 0, label: 'Getting Started', color: 'from-slate-400 to-slate-500', emoji: '🎯', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
];

export default function AdaptiveLevelIndicator({
  currentAbility,
  questionsAnswered,
  correctCount,
  consecutiveCorrect,
  consecutiveIncorrect,
  showDetails = false,
}: AdaptiveLevelIndicatorProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevAbility, setPrevAbility] = useState(currentAbility);

  // Get current level config
  const levelConfig = LEVEL_CONFIG.find(l => currentAbility >= l.min) || LEVEL_CONFIG[LEVEL_CONFIG.length - 1];

  // Calculate progress within level (for visual bar)
  const levelIndex = LEVEL_CONFIG.findIndex(l => currentAbility >= l.min);
  const currentMin = levelConfig.min;
  const nextMin = levelIndex > 0 ? LEVEL_CONFIG[levelIndex - 1].min : 4.0;
  const progressInLevel = Math.min(100, ((currentAbility - currentMin) / (nextMin - currentMin)) * 100);

  // Detect level change for animation
  useEffect(() => {
    if (Math.abs(currentAbility - prevAbility) > 0.1) {
      setIsAnimating(true);
      setPrevAbility(currentAbility);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [currentAbility, prevAbility]);

  // Calculate accuracy
  const accuracy = questionsAnswered > 0 ? Math.round((correctCount / questionsAnswered) * 100) : 0;

  // Determine trend message
  const getTrendMessage = () => {
    if (consecutiveCorrect >= 3) return { text: 'On fire! 🔥', color: 'text-emerald-600' };
    if (consecutiveCorrect >= 2) return { text: 'Great streak!', color: 'text-emerald-500' };
    if (consecutiveIncorrect >= 2) return { text: 'Keep trying!', color: 'text-amber-500' };
    return { text: 'Doing well!', color: 'text-slate-500' };
  };

  const trend = getTrendMessage();

  return (
    <div className={`rounded-xl ${levelConfig.bgColor} ${levelConfig.borderColor} border-2 p-3 transition-all duration-300 ${isAnimating ? 'scale-105 shadow-lg' : ''}`}>
      {/* Main Level Display */}
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${isAnimating ? 'animate-bounce' : ''}`}>
          {levelConfig.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Your Level
            </span>
            <span className={`text-xs font-medium ${trend.color}`}>
              {trend.text}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold bg-gradient-to-r ${levelConfig.color} bg-clip-text text-transparent`}>
              {levelConfig.label}
            </span>
          </div>

          {/* Progress bar within level */}
          <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${levelConfig.color} rounded-full transition-all duration-500`}
              style={{ width: `${progressInLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Stats (optional) */}
      {showDetails && questionsAnswered > 0 && (
        <div className="mt-3 pt-3 border-t border-white/30 grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700">{questionsAnswered}</p>
            <p className="text-xs text-slate-500">Questions</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">{correctCount}</p>
            <p className="text-xs text-slate-500">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700">{accuracy}%</p>
            <p className="text-xs text-slate-500">Accuracy</p>
          </div>
        </div>
      )}

      {/* Encouragement for streaks */}
      {consecutiveCorrect >= 3 && (
        <div className="mt-2 text-center">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full animate-pulse">
            🎯 {consecutiveCorrect} in a row!
          </span>
        </div>
      )}
    </div>
  );
}
