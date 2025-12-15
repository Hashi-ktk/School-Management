'use client';

import { useState } from 'react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface TextToSpeechButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showSpeedControl?: boolean;
  className?: string;
}

export default function TextToSpeechButton({
  text,
  label = 'Read Aloud',
  size = 'md',
  showSpeedControl = false,
  className = '',
}: TextToSpeechButtonProps) {
  const { speak, stop, isSpeaking, isSupported, currentRate, setRate } = useTextToSpeech({
    rate: 0.9, // Slightly slower for children
  });

  const [showSettings, setShowSettings] = useState(false);

  if (!isSupported) {
    return null; // Don't render if TTS not supported
  }

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg',
  };

  const iconSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        className={`
          inline-flex items-center gap-2 rounded-xl font-medium transition-all
          ${sizeClasses[size]}
          ${isSpeaking
            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-200'
            : 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 hover:from-purple-100 hover:to-indigo-100 border-2 border-purple-200'
          }
        `}
        title={isSpeaking ? 'Stop reading' : label}
      >
        <span className={`${iconSizes[size]} ${isSpeaking ? 'animate-pulse' : ''}`}>
          {isSpeaking ? '🔊' : '🔈'}
        </span>
        <span className="hidden sm:inline">
          {isSpeaking ? 'Stop' : label}
        </span>
      </button>

      {/* Speed Control Toggle */}
      {showSpeedControl && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Speed settings"
          >
            ⚙️
          </button>

          {showSettings && (
            <div className="absolute top-full right-0 mt-1 p-3 bg-white rounded-xl shadow-lg border border-slate-200 z-10 min-w-[160px]">
              <p className="text-xs font-medium text-slate-500 mb-2">Reading Speed</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRate(currentRate - 0.1)}
                  disabled={currentRate <= 0.5}
                  className="p-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50"
                >
                  ➖
                </button>
                <div className="flex-1 text-center">
                  <span className="text-sm font-medium text-slate-700">
                    {currentRate.toFixed(1)}x
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRate(currentRate + 0.1)}
                  disabled={currentRate >= 2}
                  className="p-1 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50"
                >
                  ➕
                </button>
              </div>
              <div className="mt-2 flex justify-center gap-1">
                {[0.7, 1, 1.3].map(rate => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setRate(rate)}
                    className={`px-2 py-1 text-xs rounded ${
                      Math.abs(currentRate - rate) < 0.05
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {rate === 0.7 ? 'Slow' : rate === 1 ? 'Normal' : 'Fast'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
