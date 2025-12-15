'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAssessmentById, getAllResults, getFeedbackForResult } from '@/lib/utils';
import { generateFeedback } from '@/lib/feedbackGenerator';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressRing from '@/components/charts/ProgressRing';
import TextToSpeechButton from '@/components/ai/TextToSpeechButton';
import type { AssessmentResult, GeneratedFeedback } from '@/types';

export default function AssessmentCompletePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [feedback, setFeedback] = useState<GeneratedFeedback | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const assessment = getAssessmentById(assessmentId);

  useEffect(() => {
    if (!user || !assessment) return;

    // Find the most recent result for this assessment
    const allResults = getAllResults();
    const studentResult = allResults
      .filter(r => r.studentId === user.id && r.assessmentId === assessmentId && r.status === 'completed')
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

    if (studentResult) {
      setResult(studentResult);

      // Generate feedback
      const generatedFeedback = generateFeedback(studentResult, assessment.questions);
      setFeedback(generatedFeedback);

      // Show confetti for good scores
      if (studentResult.percentage >= 70) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }, [user, assessment, assessmentId]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result || !feedback) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Results Found</h2>
        <p className="text-slate-600 mb-6">We couldn't find your assessment results.</p>
        <Button onClick={() => router.push('/dashboard/student')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const getScoreEmoji = (percentage: number) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🌟';
    if (percentage >= 70) return '✨';
    if (percentage >= 60) return '👍';
    if (percentage >= 50) return '💪';
    return '📚';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Outstanding!';
    if (percentage >= 80) return 'Excellent Work!';
    if (percentage >= 70) return 'Great Job!';
    if (percentage >= 60) return 'Good Effort!';
    if (percentage >= 50) return 'Nice Try!';
    return 'Keep Practicing!';
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  const getBgGradient = (percentage: number) => {
    if (percentage >= 80) return 'from-emerald-50 via-white to-teal-50';
    if (percentage >= 60) return 'from-amber-50 via-white to-orange-50';
    return 'from-red-50 via-white to-pink-50';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Confetti Animation (CSS-based) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
                width: '10px',
                height: '10px',
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      {/* Main Score Card */}
      <Card className={`bg-gradient-to-br ${getBgGradient(result.percentage)} border-2 text-center py-8`}>
        <div className="space-y-6">
          {/* Celebration Emoji */}
          <div className="text-6xl animate-bounce">
            {getScoreEmoji(result.percentage)}
          </div>

          {/* Score Message */}
          <div>
            <h1 className={`text-4xl font-bold ${getScoreColor(result.percentage)} mb-2`}>
              {getScoreMessage(result.percentage)}
            </h1>
            <p className="text-lg text-slate-600">
              You completed the {result.subject} assessment
            </p>
          </div>

          {/* Score Ring */}
          <div className="flex justify-center">
            <ProgressRing
              value={result.percentage}
              size={160}
              color="auto"
              label="Score"
              strokeWidth={12}
            />
          </div>

          {/* Score Details */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-800">{result.score}</p>
              <p className="text-sm text-slate-500">Points Earned</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-800">{result.totalPoints}</p>
              <p className="text-sm text-slate-500">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">
                {result.answers.filter(a => a.isCorrect).length}
              </p>
              <p className="text-sm text-slate-500">Correct Answers</p>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Feedback Card */}
      <Card>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl text-white">
                🤖
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">AI Feedback</h2>
                <p className="text-sm text-slate-500">Personalized insights just for you</p>
              </div>
            </div>
            <TextToSpeechButton
              text={`${feedback.mainMessage}. ${feedback.encouragement}. Your strengths are: ${feedback.strengthAreas.join(', ')}. Areas to focus on: ${feedback.improvementAreas.join(', ')}. ${feedback.subjectTip}`}
              size="lg"
            />
          </div>

          {/* Main Message */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-start gap-3">
              <p className="text-lg text-slate-700 leading-relaxed flex-1">
                {feedback.mainMessage}
              </p>
              <TextToSpeechButton text={feedback.mainMessage} size="md" />
            </div>
          </div>

          {/* Encouragement */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-2xl">💪</span>
            <p className="text-amber-800 flex-1">{feedback.encouragement}</p>
            <TextToSpeechButton text={feedback.encouragement} size="sm" />
          </div>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            {feedback.strengthAreas.length > 0 && (
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                  <span>⭐</span> Your Strengths
                </h3>
                <ul className="space-y-2">
                  {feedback.strengthAreas.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-emerald-700 text-sm">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas to Improve */}
            {feedback.improvementAreas.length > 0 && (
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                  <span>🎯</span> Focus Areas
                </h3>
                <ul className="space-y-2">
                  {feedback.improvementAreas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-orange-700 text-sm">
                      <span className="text-orange-500 mt-0.5">→</span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span>📋</span> What to Do Next
            </h3>
            <ol className="space-y-2">
              {feedback.nextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-700 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Subject Tip */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-bold text-blue-800 mb-1">{result.subject} Tip</h4>
              <p className="text-blue-700 text-sm">{feedback.subjectTip}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => router.push('/dashboard/student/results')}
          variant="outline"
          size="lg"
        >
          📊 View All Results
        </Button>
        <Button
          onClick={() => router.push('/dashboard/student')}
          variant="primary"
          size="lg"
        >
          🏠 Back to Dashboard
        </Button>
      </div>

      {/* Add confetti animation styles */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
