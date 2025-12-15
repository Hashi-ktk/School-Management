'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface UseTimerProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
  onTick?: (timeRemaining: number) => void;
}

interface UseTimerReturn {
  timeRemaining: number;
  isWarning: boolean;
  isCritical: boolean;
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
}

export function useTimer({ initialTime, onTimeUp, onTick }: UseTimerProps): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledTimeUp = useRef(false);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;

        // Call onTick callback if provided
        if (onTick) {
          onTick(next);
        }

        // Call onTimeUp when time reaches 0
        if (next <= 0 && !hasCalledTimeUp.current) {
          hasCalledTimeUp.current = true;
          setTimeout(() => onTimeUp(), 100);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, onTimeUp, onTick]);

  const isWarning = timeRemaining <= 300 && timeRemaining > 60; // 5 minutes to 1 minute
  const isCritical = timeRemaining <= 60; // Last minute

  return {
    timeRemaining,
    isWarning,
    isCritical,
    pause,
    resume,
    isPaused,
  };
}
