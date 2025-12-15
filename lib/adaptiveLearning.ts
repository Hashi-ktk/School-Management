/**
 * Adaptive Learning Algorithm
 * Dynamically adjusts question difficulty based on student responses
 * Implements simplified Item Response Theory (IRT) for competency assessment
 */

import { aiConfig } from './aiConfig';
import type { Question, AssessmentResult } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface AdaptiveState {
  sessionId: string;
  studentId: string;
  subject: string;
  grade: number;
  currentAbility: number;        // 1.0 to 4.0 scale
  questionsAnswered: number;
  correctCount: number;
  incorrectCount: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  difficultyHistory: number[];
  responseHistory: boolean[];    // true = correct, false = incorrect
  startedAt: string;
  lastUpdatedAt: string;
}

export interface AdaptiveQuestion extends Question {
  difficulty: number;            // 1 = easy, 2 = medium, 3 = hard, 4 = very hard
  discriminationIndex?: number;  // How well question differentiates ability levels
}

export interface NextQuestionResult {
  question: AdaptiveQuestion | null;
  targetDifficulty: number;
  currentAbilityEstimate: number;
  questionsRemaining: number;
  canStop: boolean;
  stoppingReason?: StoppingReason;
  confidenceLevel: 'low' | 'medium' | 'high';
}

export interface AdaptiveSessionResult {
  sessionId: string;
  studentId: string;
  subject: string;
  finalAbility: number;
  competencyLevel: CompetencyLevel;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  stoppingReason: StoppingReason;
  difficultyProgression: number[];
  completedAt: string;
  recommendations: string[];
}

export type StoppingReason =
  | 'floor_reached'      // Student hit floor (too many wrong at lowest difficulty)
  | 'ceiling_reached'    // Student hit ceiling (many correct at highest difficulty)
  | 'max_questions'      // Maximum questions reached
  | 'min_reached'        // Minimum questions answered, ability stable
  | 'user_stopped'       // User ended early
  | 'no_questions';      // No more suitable questions

export type CompetencyLevel =
  | 'Below Basic'        // < 1.5 ability
  | 'Basic'              // 1.5 - 2.0 ability
  | 'Developing'         // 2.0 - 2.5 ability
  | 'Proficient'         // 2.5 - 3.0 ability
  | 'Advanced'           // 3.0 - 3.5 ability
  | 'Mastery';           // > 3.5 ability

// ============================================================================
// Configuration
// ============================================================================

const { adaptive } = aiConfig;

// Competency level thresholds
const COMPETENCY_THRESHOLDS: { level: CompetencyLevel; minAbility: number }[] = [
  { level: 'Mastery', minAbility: 3.5 },
  { level: 'Advanced', minAbility: 3.0 },
  { level: 'Proficient', minAbility: 2.5 },
  { level: 'Developing', minAbility: 2.0 },
  { level: 'Basic', minAbility: 1.5 },
  { level: 'Below Basic', minAbility: 0 },
];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Initialize a new adaptive assessment session
 */
export function initializeAdaptiveSession(
  studentId: string,
  subject: string,
  grade: number
): AdaptiveState {
  // Get initial ability estimate based on grade
  const initialAbility = adaptive.initialAbilityByGrade[grade] ?? adaptive.difficultyLevels.default;

  return {
    sessionId: `adaptive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    studentId,
    subject,
    grade,
    currentAbility: initialAbility,
    questionsAnswered: 0,
    correctCount: 0,
    incorrectCount: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    difficultyHistory: [],
    responseHistory: [],
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  };
}

/**
 * Update ability estimate after a response using simplified IRT
 */
export function updateAbilityEstimate(
  state: AdaptiveState,
  isCorrect: boolean,
  questionDifficulty: number
): AdaptiveState {
  const { abilityAdjustmentRate, difficultyLevels } = adaptive;

  let newAbility: number;

  if (isCorrect) {
    // Increase ability estimate
    // Larger increase for harder questions answered correctly
    const difficultyBonus = questionDifficulty - state.currentAbility + 0.5;
    newAbility = state.currentAbility + (abilityAdjustmentRate * Math.max(0.1, difficultyBonus));
  } else {
    // Decrease ability estimate
    // Larger decrease for easier questions answered incorrectly
    const difficultyPenalty = state.currentAbility - questionDifficulty + 0.5;
    newAbility = state.currentAbility - (abilityAdjustmentRate * Math.max(0.1, difficultyPenalty));
  }

  // Clamp ability to valid range
  newAbility = Math.max(difficultyLevels.min, Math.min(difficultyLevels.max, newAbility));

  // Update consecutive counters
  let consecutiveCorrect = isCorrect ? state.consecutiveCorrect + 1 : 0;
  let consecutiveIncorrect = isCorrect ? 0 : state.consecutiveIncorrect + 1;

  return {
    ...state,
    currentAbility: newAbility,
    questionsAnswered: state.questionsAnswered + 1,
    correctCount: state.correctCount + (isCorrect ? 1 : 0),
    incorrectCount: state.incorrectCount + (isCorrect ? 0 : 1),
    consecutiveCorrect,
    consecutiveIncorrect,
    difficultyHistory: [...state.difficultyHistory, questionDifficulty],
    responseHistory: [...state.responseHistory, isCorrect],
    lastUpdatedAt: new Date().toISOString(),
  };
}

/**
 * Check if stopping rule is triggered
 */
export function checkStoppingRule(state: AdaptiveState): {
  shouldStop: boolean;
  reason: StoppingReason | null;
} {
  const { minQuestions, maxQuestions, floorThreshold, ceilingThreshold, difficultyLevels } = adaptive;

  // Check max questions
  if (state.questionsAnswered >= maxQuestions) {
    return { shouldStop: true, reason: 'max_questions' };
  }

  // Check floor (too many wrong at lowest difficulty)
  if (
    state.consecutiveIncorrect >= floorThreshold &&
    state.currentAbility <= difficultyLevels.min + 0.3
  ) {
    return { shouldStop: true, reason: 'floor_reached' };
  }

  // Check ceiling (many correct at highest difficulty)
  if (
    state.consecutiveCorrect >= ceilingThreshold &&
    state.currentAbility >= difficultyLevels.max - 0.3
  ) {
    return { shouldStop: true, reason: 'ceiling_reached' };
  }

  // Check minimum questions with stable ability
  if (state.questionsAnswered >= minQuestions) {
    // Check if ability has stabilized (last 3 responses)
    if (state.difficultyHistory.length >= 3) {
      const recentDiffs = state.difficultyHistory.slice(-3);
      const variance = calculateVariance(recentDiffs);

      if (variance < 0.2) {
        return { shouldStop: true, reason: 'min_reached' };
      }
    }
  }

  return { shouldStop: false, reason: null };
}

/**
 * Select the next question based on current ability
 */
export function selectNextQuestion(
  state: AdaptiveState,
  questionPool: AdaptiveQuestion[],
  answeredQuestionIds: string[] = []
): NextQuestionResult {
  // Filter out already answered questions
  const availableQuestions = questionPool.filter(
    q => !answeredQuestionIds.includes(q.id)
  );

  // Check stopping rule
  const { shouldStop, reason } = checkStoppingRule(state);

  if (shouldStop || availableQuestions.length === 0) {
    return {
      question: null,
      targetDifficulty: state.currentAbility,
      currentAbilityEstimate: state.currentAbility,
      questionsRemaining: adaptive.maxQuestions - state.questionsAnswered,
      canStop: true,
      stoppingReason: reason || (availableQuestions.length === 0 ? 'no_questions' : undefined),
      confidenceLevel: getConfidenceLevel(state),
    };
  }

  // Calculate target difficulty (match to current ability)
  const targetDifficulty = Math.round(state.currentAbility);

  // Find best matching question
  // Prefer questions close to target difficulty
  const scoredQuestions = availableQuestions.map(q => ({
    question: q,
    score: Math.abs(q.difficulty - state.currentAbility),
  }));

  // Sort by score (lower is better) and add some randomization
  scoredQuestions.sort((a, b) => {
    const scoreDiff = a.score - b.score;
    // Add small random factor to prevent always picking same question
    return scoreDiff + (Math.random() - 0.5) * 0.3;
  });

  const selectedQuestion = scoredQuestions[0].question;

  return {
    question: selectedQuestion,
    targetDifficulty,
    currentAbilityEstimate: state.currentAbility,
    questionsRemaining: adaptive.maxQuestions - state.questionsAnswered,
    canStop: state.questionsAnswered >= adaptive.minQuestions,
    confidenceLevel: getConfidenceLevel(state),
  };
}

/**
 * Calculate final competency level from ability estimate
 */
export function calculateCompetencyLevel(ability: number): CompetencyLevel {
  for (const threshold of COMPETENCY_THRESHOLDS) {
    if (ability >= threshold.minAbility) {
      return threshold.level;
    }
  }
  return 'Below Basic';
}

/**
 * Generate final session result
 */
export function generateSessionResult(
  state: AdaptiveState,
  stoppingReason: StoppingReason
): AdaptiveSessionResult {
  const accuracy = state.questionsAnswered > 0
    ? Math.round((state.correctCount / state.questionsAnswered) * 100)
    : 0;

  const competencyLevel = calculateCompetencyLevel(state.currentAbility);

  return {
    sessionId: state.sessionId,
    studentId: state.studentId,
    subject: state.subject,
    finalAbility: Math.round(state.currentAbility * 100) / 100,
    competencyLevel,
    totalQuestions: state.questionsAnswered,
    correctAnswers: state.correctCount,
    accuracy,
    stoppingReason,
    difficultyProgression: state.difficultyHistory,
    completedAt: new Date().toISOString(),
    recommendations: generateRecommendations(state, competencyLevel),
  };
}

/**
 * Generate recommendations based on session results
 */
function generateRecommendations(
  state: AdaptiveState,
  competencyLevel: CompetencyLevel
): string[] {
  const recommendations: string[] = [];

  switch (competencyLevel) {
    case 'Below Basic':
    case 'Basic':
      recommendations.push(
        'Focus on foundational concepts before advancing',
        'Use visual aids and hands-on activities',
        'Practice basic skills daily with immediate feedback',
        'Consider one-on-one support sessions'
      );
      break;

    case 'Developing':
      recommendations.push(
        'Continue building core skills through guided practice',
        'Work on connecting concepts across topics',
        'Use error analysis to learn from mistakes',
        'Engage in peer learning activities'
      );
      break;

    case 'Proficient':
      recommendations.push(
        'Challenge with more complex, multi-step problems',
        'Encourage explaining solutions to peers',
        'Introduce real-world application tasks',
        'Develop independent problem-solving strategies'
      );
      break;

    case 'Advanced':
    case 'Mastery':
      recommendations.push(
        'Provide enrichment and extension activities',
        'Consider acceleration or advanced topics',
        'Assign leadership roles in group activities',
        'Encourage participation in competitions'
      );
      break;
  }

  // Add specific recommendations based on response patterns
  if (state.responseHistory.length >= 3) {
    const lastThree = state.responseHistory.slice(-3);
    const recentAccuracy = lastThree.filter(r => r).length / 3;

    if (recentAccuracy < 0.5) {
      recommendations.push('Recent performance suggests need for review of recent topics');
    } else if (recentAccuracy === 1) {
      recommendations.push('Ready for more challenging material');
    }
  }

  return recommendations;
}

/**
 * Get confidence level based on number of questions answered
 */
function getConfidenceLevel(state: AdaptiveState): 'low' | 'medium' | 'high' {
  if (state.questionsAnswered < 3) return 'low';
  if (state.questionsAnswered < 7) return 'medium';
  return 'high';
}

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length;
}

/**
 * Add difficulty levels to questions (for questions without difficulty)
 * Uses simple heuristics based on question characteristics
 */
export function assignQuestionDifficulty(question: Question): AdaptiveQuestion {
  // If question already has difficulty, use it
  if ('difficulty' in question && typeof (question as AdaptiveQuestion).difficulty === 'number') {
    return question as AdaptiveQuestion;
  }

  let difficulty = 2; // Default to medium

  // Heuristics for difficulty estimation
  const questionText = question.question.toLowerCase();

  // Easy indicators
  if (
    questionText.includes('what is') ||
    questionText.includes('name the') ||
    questionText.includes('identify') ||
    question.type === 'true-false'
  ) {
    difficulty = 1;
  }

  // Medium indicators (default)
  if (
    questionText.includes('explain') ||
    questionText.includes('describe') ||
    questionText.includes('how')
  ) {
    difficulty = 2;
  }

  // Hard indicators
  if (
    questionText.includes('compare') ||
    questionText.includes('analyze') ||
    questionText.includes('why') ||
    question.type === 'short-answer'
  ) {
    difficulty = 3;
  }

  // Very hard indicators
  if (
    questionText.includes('evaluate') ||
    questionText.includes('create') ||
    questionText.includes('design') ||
    questionText.includes('prove')
  ) {
    difficulty = 4;
  }

  // Adjust based on points (higher points often = harder)
  if (question.points >= 5) difficulty = Math.min(4, difficulty + 1);
  if (question.points <= 1) difficulty = Math.max(1, difficulty - 1);

  return {
    ...question,
    difficulty,
  };
}

/**
 * Prepare question pool for adaptive assessment
 */
export function prepareAdaptiveQuestionPool(questions: Question[]): AdaptiveQuestion[] {
  return questions.map(assignQuestionDifficulty);
}

// ============================================================================
// Session Storage (for persistence)
// ============================================================================

const ADAPTIVE_SESSION_KEY = 'adaptiveSessions';

/**
 * Save adaptive session to localStorage
 */
export function saveAdaptiveSession(state: AdaptiveState): void {
  if (typeof window === 'undefined') return;

  const sessions = getAdaptiveSessions();
  const index = sessions.findIndex(s => s.sessionId === state.sessionId);

  if (index >= 0) {
    sessions[index] = state;
  } else {
    sessions.push(state);
  }

  localStorage.setItem(ADAPTIVE_SESSION_KEY, JSON.stringify(sessions));
}

/**
 * Get all adaptive sessions
 */
export function getAdaptiveSessions(): AdaptiveState[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(ADAPTIVE_SESSION_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Get adaptive session by ID
 */
export function getAdaptiveSession(sessionId: string): AdaptiveState | null {
  const sessions = getAdaptiveSessions();
  return sessions.find(s => s.sessionId === sessionId) ?? null;
}

/**
 * Delete adaptive session
 */
export function deleteAdaptiveSession(sessionId: string): void {
  if (typeof window === 'undefined') return;

  const sessions = getAdaptiveSessions().filter(s => s.sessionId !== sessionId);
  localStorage.setItem(ADAPTIVE_SESSION_KEY, JSON.stringify(sessions));
}
