'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoSaveProps<T> {
  data: T;
  onSave: (data: T) => void;
  interval?: number; // in milliseconds, default 30000 (30s)
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  saveStatus: 'saved' | 'saving' | 'pending';
  saveNow: () => void;
  lastSaved: Date | null;
}

export function useAutoSave<T>({
  data,
  onSave,
  interval = 30000,
  enabled = true,
}: UseAutoSaveProps<T>): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'pending'>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef<T>(data);
  const isSavingRef = useRef(false);

  // Update dataRef when data changes
  useEffect(() => {
    dataRef.current = data;
    if (saveStatus === 'saved') {
      setSaveStatus('pending');
    }
  }, [data, saveStatus]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (isSavingRef.current || !enabled) return;

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      onSave(dataRef.current);
      setLastSaved(new Date());
      setSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('pending');
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, enabled]);

  // Periodic auto-save
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      if (saveStatus === 'pending' || saveStatus === 'saved') {
        saveNow();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, saveNow, saveStatus]);

  // Save on page unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (dataRef.current) {
        onSave(dataRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [onSave, enabled]);

  return {
    saveStatus,
    saveNow,
    lastSaved,
  };
}
