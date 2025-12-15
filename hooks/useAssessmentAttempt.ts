'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Assessment, AssessmentAttempt, Answer, Question } from '@/types';
import {
  getAssessmentAttempt,
  saveAssessmentAttempt,
  submitAssessmentAttempt,
  checkAnswer,
} from '@/lib/utils';

interface UseAssessmentAttemptProps {
  assessment: Assessment;
  studentId: string;
  studentName: string;
}

interface UseAssessmentAttemptReturn {
  attempt: AssessmentAttempt | null;
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  isLoading: boolean;
  goToQuestion: (index: number) => void;
  submitAnswer: (answer: string | number) => boolean;
  hasAnswered: (questionId: string) => boolean;
  getAnswer: (questionId: string) => Answer | undefined;
  nextQuestion: () => void;
  previousQuestion: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
  progressPercentage: number;
  answeredCount: number;
  submit: () => void;
  updateTimeRemaining: (time: number) => void;
}

export function useAssessmentAttempt({
  assessment,
  studentId,
  studentName,
}: UseAssessmentAttemptProps): UseAssessmentAttemptReturn {
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize or load existing attempt
  useEffect(() => {
    const loadAttempt = () => {
      const existing = getAssessmentAttempt(studentId, assessment.id);

      if (existing) {
        // Resume existing attempt
        setAttempt(existing);
        setCurrentQuestionIndex(existing.currentQuestionIndex);
      } else {
        // Create new attempt
        const totalPoints = assessment.questions.reduce((sum, q) => sum + q.points, 0);
        const newAttempt: AssessmentAttempt = {
          id: `attempt-${Date.now()}`,
          assessmentId: assessment.id,
          studentId,
          studentName,
          grade: assessment.grade,
          subject: assessment.subject,
          score: 0,
          totalPoints,
          percentage: 0,
          completedAt: '',
          answers: [],
          status: 'in-progress',
          startedAt: new Date().toISOString(),
          timeRemaining: assessment.duration * 60, // Convert minutes to seconds
          currentQuestionIndex: 0,
          lastSaved: new Date().toISOString(),
        };

        setAttempt(newAttempt);
        saveAssessmentAttempt(newAttempt);
      }

      setIsLoading(false);
    };

    loadAttempt();
  }, [assessment, studentId, studentName]);

  // Get current question
  const currentQuestion = attempt && assessment.questions[currentQuestionIndex]
    ? assessment.questions[currentQuestionIndex]
    : null;

  // Navigate to specific question
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < assessment.questions.length) {
      setCurrentQuestionIndex(index);
      if (attempt) {
        const updated = { ...attempt, currentQuestionIndex: index };
        setAttempt(updated);
        saveAssessmentAttempt(updated);
      }
    }
  }, [assessment.questions.length, attempt]);

  // Check if question has been answered
  const hasAnswered = useCallback((questionId: string): boolean => {
    return attempt?.answers.some((a) => a.questionId === questionId) ?? false;
  }, [attempt]);

  // Get answer for a question
  const getAnswer = useCallback((questionId: string): Answer | undefined => {
    return attempt?.answers.find((a) => a.questionId === questionId);
  }, [attempt]);

  // Submit answer for current question
  const submitAnswer = useCallback((answer: string | number): boolean => {
    if (!attempt || !currentQuestion) return false;

    // Use enhanced checkAnswer with fuzzy matching
    const scoringResult = checkAnswer(currentQuestion, answer, attempt.subject);
    const points = scoringResult.isCorrect ? currentQuestion.points : 0;

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer,
      isCorrect: scoringResult.isCorrect,
      points,
      // Store fuzzy matching metadata
      similarityScore: scoringResult.similarityScore,
      matchingMethod: scoringResult.matchingMethod,
    };

    // Update or add answer
    const existingIndex = attempt.answers.findIndex((a) => a.questionId === currentQuestion.id);
    const updatedAnswers = existingIndex >= 0
      ? attempt.answers.map((a, idx) => idx === existingIndex ? newAnswer : a)
      : [...attempt.answers, newAnswer];

    // Calculate new score
    const newScore = updatedAnswers.reduce((sum, a) => sum + a.points, 0);
    const newPercentage = Math.round((newScore / attempt.totalPoints) * 100);

    const updatedAttempt: AssessmentAttempt = {
      ...attempt,
      answers: updatedAnswers,
      score: newScore,
      percentage: newPercentage,
    };

    setAttempt(updatedAttempt);
    saveAssessmentAttempt(updatedAttempt);

    return scoringResult.isCorrect;
  }, [attempt, currentQuestion]);

  // Navigation
  const nextQuestion = useCallback(() => {
    goToQuestion(currentQuestionIndex + 1);
  }, [currentQuestionIndex, goToQuestion]);

  const previousQuestion = useCallback(() => {
    goToQuestion(currentQuestionIndex - 1);
  }, [currentQuestionIndex, goToQuestion]);

  const canGoNext = currentQuestionIndex < assessment.questions.length - 1;
  const canGoPrevious = currentQuestionIndex > 0;
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;

  // Progress tracking
  const answeredCount = attempt?.answers.length ?? 0;
  const progressPercentage = (answeredCount / assessment.questions.length) * 100;

  // Update time remaining
  const updateTimeRemaining = useCallback((time: number) => {
    if (attempt) {
      const updated = { ...attempt, timeRemaining: time };
      setAttempt(updated);
      saveAssessmentAttempt(updated);
    }
  }, [attempt]);

  // Submit final assessment
  const submit = useCallback(() => {
    if (!attempt) return;

    submitAssessmentAttempt(attempt);
  }, [attempt]);

  return {
    attempt,
    currentQuestionIndex,
    currentQuestion,
    isLoading,
    goToQuestion,
    submitAnswer,
    hasAnswered,
    getAnswer,
    nextQuestion,
    previousQuestion,
    canGoNext,
    canGoPrevious,
    isLastQuestion,
    progressPercentage,
    answeredCount,
    submit,
    updateTimeRemaining,
  };
}
