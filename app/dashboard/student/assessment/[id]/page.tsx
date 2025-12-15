'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAssessmentAttempt } from '@/hooks/useAssessmentAttempt';
import { useTimer } from '@/hooks/useTimer';
import { useAutoSave } from '@/hooks/useAutoSave';
import { getAssessmentById } from '@/lib/utils';
import QuestionCard from '@/components/assessment/QuestionCard';
import Button from '@/components/ui/Button';
import AdaptiveLevelIndicator from '@/components/ai/AdaptiveLevelIndicator';

export default function AssessmentDeliveryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const assessment = getAssessmentById(assessmentId);

  // Adaptive learning state
  const [adaptiveState, setAdaptiveState] = useState({
    currentAbility: 2.0, // Start at middle level
    questionsAnswered: 0,
    correctCount: 0,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
  });

  const {
    attempt,
    currentQuestionIndex,
    currentQuestion,
    isLoading: attemptLoading,
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
  } = useAssessmentAttempt({
    assessment: assessment!,
    studentId: user?.id || '',
    studentName: user?.name || '',
  });

  // Update adaptive state when answers change
  useEffect(() => {
    if (attempt && attempt.answers) {
      const correctCount = attempt.answers.filter(a => a.isCorrect).length;
      const questionsAnswered = attempt.answers.length;

      // Calculate consecutive streaks
      let consecutiveCorrect = 0;
      let consecutiveIncorrect = 0;

      for (let i = attempt.answers.length - 1; i >= 0; i--) {
        if (attempt.answers[i].isCorrect) {
          if (consecutiveIncorrect === 0) consecutiveCorrect++;
          else break;
        } else {
          if (consecutiveCorrect === 0) consecutiveIncorrect++;
          else break;
        }
      }

      // Calculate ability (simple algorithm based on accuracy)
      const accuracy = questionsAnswered > 0 ? correctCount / questionsAnswered : 0.5;
      const baseAbility = 1.0 + (accuracy * 3.0); // Maps 0-100% to 1.0-4.0

      // Adjust for streaks
      let abilityAdjustment = 0;
      if (consecutiveCorrect >= 3) abilityAdjustment = 0.3;
      else if (consecutiveCorrect >= 2) abilityAdjustment = 0.15;
      if (consecutiveIncorrect >= 2) abilityAdjustment = -0.2;

      const currentAbility = Math.max(1.0, Math.min(4.0, baseAbility + abilityAdjustment));

      setAdaptiveState({
        currentAbility,
        questionsAnswered,
        correctCount,
        consecutiveCorrect,
        consecutiveIncorrect,
      });
    }
  }, [attempt]);

  // Timer hook
  const { timeRemaining, isWarning, isCritical, pause } = useTimer({
    initialTime: attempt?.timeRemaining || (assessment?.duration || 15) * 60,
    onTimeUp: () => {
      handleSubmitAssessment();
    },
    onTick: (time) => {
      updateTimeRemaining(time);
    },
  });

  // Auto-save hook
  useAutoSave({
    data: attempt,
    onSave: (data) => {
      if (data) {
        updateTimeRemaining(timeRemaining);
      }
    },
    interval: 30000, // 30 seconds
    enabled: !!attempt,
  });

  // Handle final submission
  const handleSubmitAssessment = () => {
    pause();
    if (attempt) {
      submit();
      // Redirect to completion page with AI feedback
      router.push(`/dashboard/student/assessment/${assessmentId}/complete`);
    }
  };

  // Handle exit
  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
      router.push('/dashboard/student');
    }
  };

  // Loading state
  if (authLoading || attemptLoading || !assessment || !user || !attempt || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-3">
          <div className="h-16 w-16 mx-auto rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
          <p className="text-lg font-semibold text-slate-600">
            {attemptLoading ? 'Loading assessment...' : 'Preparing your questions...'}
          </p>
        </div>
      </div>
    );
  }

  const existingAnswer = getAnswer(currentQuestion.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">
            {assessment.title}
          </h1>
          <p className="text-sm text-slate-600">
            {assessment.subject} • Grade {assessment.grade}
          </p>
        </div>

        <div className="flex items-start gap-3">
          {/* Adaptive Level Indicator */}
          <AdaptiveLevelIndicator
            currentAbility={adaptiveState.currentAbility}
            questionsAnswered={adaptiveState.questionsAnswered}
            correctCount={adaptiveState.correctCount}
            consecutiveCorrect={adaptiveState.consecutiveCorrect}
            consecutiveIncorrect={adaptiveState.consecutiveIncorrect}
            showDetails={false}
          />

          <Button
            onClick={handleExit}
            variant="ghost"
            size="sm"
          >
            ✕ Exit
          </Button>
        </div>
      </div>

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={assessment.questions.length}
        answeredCount={answeredCount}
        progressPercentage={progressPercentage}
        existingAnswer={existingAnswer}
        onSubmitAnswer={submitAnswer}
        onNext={nextQuestion}
        onPrevious={previousQuestion}
        onSubmitAssessment={handleSubmitAssessment}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        isLastQuestion={isLastQuestion}
        hasAnswered={hasAnswered(currentQuestion.id)}
        timeRemaining={timeRemaining}
        isWarning={isWarning}
        isCritical={isCritical}
      />

      {/* Auto-save indicator */}
      <div className="text-center">
        <p className="text-xs text-slate-500">
          💾 Your progress is automatically saved
        </p>
      </div>
    </div>
  );
}
