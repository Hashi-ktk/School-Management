import type { ClassroomObservation, ObservationIndicator } from '@/types';
import dummyData from '@/data/dummyData.json';

const STORAGE_KEY = 'observations';

export const getObservations = (): ClassroomObservation[] => {
  if (typeof window === 'undefined') return dummyData.observations as ClassroomObservation[];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const customObservations = JSON.parse(stored) as ClassroomObservation[];
      // Merge with dummy data
      return [...dummyData.observations as ClassroomObservation[], ...customObservations];
    } catch {
      return dummyData.observations as ClassroomObservation[];
    }
  }

  return dummyData.observations as ClassroomObservation[];
};

export const getObservationById = (id: string): ClassroomObservation | null => {
  const observations = getObservations();
  return observations.find(obs => obs.id === id) || null;
};

export const saveObservation = (observation: ClassroomObservation): void => {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY);
  let customObservations: ClassroomObservation[] = [];

  if (stored) {
    try {
      customObservations = JSON.parse(stored);
    } catch {
      customObservations = [];
    }
  }

  const existingIndex = customObservations.findIndex(obs => obs.id === observation.id);

  if (existingIndex >= 0) {
    customObservations[existingIndex] = observation;
  } else {
    customObservations.push(observation);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(customObservations));
};

export const deleteObservation = (id: string): void => {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;

  try {
    const customObservations = JSON.parse(stored) as ClassroomObservation[];
    const filtered = customObservations.filter(obs => obs.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Handle error silently
  }
};

export const getObservationsByTeacher = (teacherId: string): ClassroomObservation[] => {
  return getObservations().filter(obs => obs.teacherId === teacherId);
};

export const getObservationsByObserver = (observerId: string): ClassroomObservation[] => {
  return getObservations().filter(obs => obs.observerId === observerId);
};

export const calculateOverallScore = (indicators: ObservationIndicator[]): number => {
  if (indicators.length === 0) return 0;
  const totalScore = indicators.reduce((sum, ind) => sum + ind.score, 0);
  const totalMax = indicators.reduce((sum, ind) => sum + ind.maxScore, 0);
  return Math.round((totalScore / totalMax) * 100);
};
