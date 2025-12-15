import type { Question } from '@/types';

interface FeedbackDisplayProps {
  isCorrect: boolean;
  points: number;
  maxPoints: number;
  question?: Question;
  studentAnswer?: string | number;
  similarityScore?: number;
  matchingMethod?: 'exact' | 'fuzzy' | 'none';
}

export default function FeedbackDisplay({
  isCorrect,
  points,
  maxPoints,
  question,
  studentAnswer,
  similarityScore,
  matchingMethod,
}: FeedbackDisplayProps) {
  const getCorrectAnswerText = () => {
    if (!question) return '';

    if (question.type === 'multiple-choice' && question.options) {
      return question.options[Number(question.correctAnswer)];
    }
    if (question.type === 'true-false' && question.options) {
      return question.options[Number(question.correctAnswer)];
    }
    return String(question.correctAnswer);
  };

  const getStudentAnswerText = () => {
    if (studentAnswer === undefined) return '';

    if (question?.type === 'multiple-choice' && question.options) {
      return question.options[Number(studentAnswer)];
    }
    if (question?.type === 'true-false' && question.options) {
      return question.options[Number(studentAnswer)];
    }
    return String(studentAnswer);
  };

  return (
    <div
      className={`rounded-xl p-4 border ${
        isCorrect
          ? 'bg-[#00ff88]/10 border-[#00ff88]/30 glass-surface'
          : 'bg-[#ff6b6b]/10 border-[#ff6b6b]/30 glass-surface'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-2xl ${
            isCorrect
              ? 'bg-[#00ff88]/20 text-[#00ff88]'
              : 'bg-[#ff6b6b]/20 text-[#ff6b6b]'
          }`}
        >
          {isCorrect ? '✓' : '✗'}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <p
              className={`text-lg font-bold ${
                isCorrect ? 'text-[#00ff88]' : 'text-[#ff6b6b]'
              }`}
            >
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
            <p className="text-sm font-semibold text-[#0f172a]">
              {points} / {maxPoints} points
            </p>
          </div>

          {!isCorrect && question && (
            <div className="space-y-1 text-sm">
              <p className="text-[#0f172a]">
                <span className="font-semibold">Your answer:</span>{' '}
                <span className="text-[#ff6b6b]">{getStudentAnswerText()}</span>
              </p>
              <p className="text-[#0f172a]">
                <span className="font-semibold">Correct answer:</span>{' '}
                <span className="text-[#00ff88]">{getCorrectAnswerText()}</span>
              </p>
            </div>
          )}

          {isCorrect && (
            <p className="text-sm text-[#334155]">
              Great job! You earned full points for this question.
            </p>
          )}

          {/* Fuzzy Match Indicator */}
          {isCorrect && matchingMethod === 'fuzzy' && similarityScore !== undefined && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 text-lg flex-shrink-0">ℹ️</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    Smart Match Applied
                  </p>
                  <p className="text-xs text-blue-600">
                    Your answer was <span className="font-bold">{Math.round(similarityScore * 100)}% similar</span> to the correct answer.
                    Our smart matching algorithm recognized your response as correct!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
