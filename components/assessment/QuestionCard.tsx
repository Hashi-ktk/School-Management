import type { Question, Answer } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Timer from './Timer';
import ProgressBar from './ProgressBar';
import QuestionDisplay from './QuestionDisplay';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  answeredCount: number;
  progressPercentage: number;
  existingAnswer?: Answer;
  onSubmitAnswer: (answer: string | number) => boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmitAssessment?: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
  hasAnswered: boolean;
  timeRemaining: number;
  isWarning: boolean;
  isCritical: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  answeredCount,
  progressPercentage,
  existingAnswer,
  onSubmitAnswer,
  onNext,
  onPrevious,
  onSubmitAssessment,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  hasAnswered,
  timeRemaining,
  isWarning,
  isCritical,
}: QuestionCardProps) {
  return (
    <div className="space-y-6">
      {/* Header with Timer and Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Timer
          timeRemaining={timeRemaining}
          isWarning={isWarning}
          isCritical={isCritical}
        />
        <div className="flex-1 max-w-2xl">
          <ProgressBar
            current={answeredCount}
            total={totalQuestions}
            percentage={progressPercentage}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <Card>
        <QuestionDisplay
          question={question}
          questionNumber={questionNumber}
          existingAnswer={existingAnswer}
          onSubmit={onSubmitAnswer}
        />
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          variant="outline"
          size="lg"
          icon={
            <span className="text-lg">←</span>
          }
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-2 rounded-full transition-all ${
                idx === questionNumber - 1
                  ? 'w-8 bg-gradient-to-r from-purple-500 to-orange-400'
                  : idx < answeredCount
                  ? 'bg-emerald-500'
                  : 'bg-gray-300'
              }`}
              aria-label={`Question ${idx + 1}${idx === questionNumber - 1 ? ' (current)' : idx < answeredCount ? ' (answered)' : ''}`}
            />
          ))}
        </div>

        {!isLastQuestion && (
          <Button
            onClick={onNext}
            disabled={!canGoNext || !hasAnswered}
            variant="primary"
            size="lg"
            icon={
              <span className="text-lg">→</span>
            }
          >
            Next
          </Button>
        )}

        {isLastQuestion && (
          <Button
            onClick={onSubmitAssessment}
            disabled={!hasAnswered}
            variant="primary"
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            Submit Assessment
          </Button>
        )}
      </div>
    </div>
  );
}
