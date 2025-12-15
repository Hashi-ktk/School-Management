'use client';

interface QuestionStat {
  questionId: string;
  questionNumber: number;
  questionText: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  correctRate: number;
  avgTimeSpent?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  discriminationIndex?: number;
  totalAttempts: number;
}

interface QuestionAnalysisChartProps {
  data: QuestionStat[];
  title?: string;
  showDifficulty?: boolean;
  showDiscrimination?: boolean;
  onQuestionClick?: (question: QuestionStat) => void;
}

export default function QuestionAnalysisChart({
  data,
  title,
  showDifficulty = true,
  showDiscrimination = false,
  onQuestionClick
}: QuestionAnalysisChartProps) {
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Easy' };
      case 'medium':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Medium' };
      case 'hard':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Hard' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-600', label: difficulty };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return '📝';
      case 'true-false':
        return '✓✗';
      case 'short-answer':
        return '✏️';
      default:
        return '❓';
    }
  };

  const getCorrectRateColor = (rate: number) => {
    if (rate >= 80) return 'bg-emerald-500';
    if (rate >= 60) return 'bg-amber-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDiscriminationLabel = (index?: number) => {
    if (index === undefined) return null;
    if (index >= 0.4) return { label: 'Excellent', color: 'text-emerald-600' };
    if (index >= 0.3) return { label: 'Good', color: 'text-blue-600' };
    if (index >= 0.2) return { label: 'Acceptable', color: 'text-amber-600' };
    return { label: 'Poor', color: 'text-red-600' };
  };

  // Calculate summary stats
  const avgCorrectRate = data.length > 0
    ? Math.round(data.reduce((sum, q) => sum + q.correctRate, 0) / data.length)
    : 0;

  const difficultyDistribution = {
    easy: data.filter(q => q.difficulty === 'easy').length,
    medium: data.filter(q => q.difficulty === 'medium').length,
    hard: data.filter(q => q.difficulty === 'hard').length
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full py-8 text-center text-slate-400">
        <p>No question data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-semibold text-slate-600 mb-4">{title}</h4>}

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-slate-800">{data.length}</p>
          <p className="text-xs text-slate-500">Questions</p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-indigo-600">{avgCorrectRate}%</p>
          <p className="text-xs text-slate-500">Avg Correct</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{difficultyDistribution.easy}</p>
          <p className="text-xs text-slate-500">Easy</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{difficultyDistribution.hard}</p>
          <p className="text-xs text-slate-500">Hard</p>
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {data.map((question, index) => {
          const diffBadge = getDifficultyBadge(question.difficulty);
          const discLabel = getDiscriminationLabel(question.discriminationIndex);

          return (
            <div
              key={question.questionId}
              className={`p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all ${
                onQuestionClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onQuestionClick?.(question)}
            >
              <div className="flex items-start gap-4">
                {/* Question Number */}
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  Q{question.questionNumber}
                </div>

                {/* Question Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{getTypeIcon(question.type)}</span>
                    <span className="text-xs text-slate-400 uppercase">{question.type.replace('-', ' ')}</span>
                    {showDifficulty && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${diffBadge.bg} ${diffBadge.text}`}>
                        {diffBadge.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2">{question.questionText}</p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>{question.totalAttempts} attempts</span>
                    {question.avgTimeSpent && (
                      <span>Avg time: {question.avgTimeSpent}s</span>
                    )}
                    {showDiscrimination && discLabel && (
                      <span className={discLabel.color}>
                        Discrimination: {discLabel.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Correct Rate Bar */}
                <div className="w-24 flex-shrink-0">
                  <div className="text-right mb-1">
                    <span className={`text-lg font-bold ${
                      question.correctRate >= 60 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {question.correctRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getCorrectRateColor(question.correctRate)} transition-all`}
                      style={{ width: `${question.correctRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 text-right mt-1">correct</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
