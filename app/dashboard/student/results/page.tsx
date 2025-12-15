'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getAllResults, getAssessmentById, formatDate, getFeedbackForResult } from '@/lib/utils';
import type { AssessmentResult } from '@/types';
import PersonalizedFeedback from '@/components/student/PersonalizedFeedback';

export default function StudentResultsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    averageScore: 0,
    highestScore: 0,
  });

  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      // Load student results
      const allResults = getAllResults();
      const studentResults = allResults
        .filter((r) => r.studentId === user.id && r.status === 'completed')
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

      setResults(studentResults);

      // Calculate stats
      if (studentResults.length > 0) {
        const avgScore = studentResults.reduce((sum, r) => sum + r.percentage, 0) / studentResults.length;
        const highestScore = Math.max(...studentResults.map((r) => r.percentage));

        setStats({
          totalCompleted: studentResults.length,
          averageScore: Math.round(avgScore),
          highestScore: Math.round(highestScore),
        });
      }
    };

    loadData();
  }, [user]);

  const toggleExpanded = (resultId: string) => {
    setExpandedResult(expandedResult === resultId ? null : resultId);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (percentage >= 80) return { label: 'Great', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (percentage >= 70) return { label: 'Good', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    if (percentage >= 60) return { label: 'Fair', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'Needs Work', color: 'bg-red-100 text-red-700 border-red-200' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Student</p>
        <h1 className="text-3xl font-bold text-slate-800">
          Your Results
        </h1>
        <p className="text-lg text-slate-600">
          View your assessment performance and progress
        </p>
      </div>

      {/* Stats */}
      {results.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            title="Total Completed"
            value={stats.totalCompleted}
            icon="✓"
            accent="emerald"
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon="📊"
            accent="blue"
          />
          <StatCard
            title="Highest Score"
            value={`${stats.highestScore}%`}
            icon="🏆"
            accent="indigo"
          />
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Assessment History</h2>

        {results.length === 0 ? (
          <Card className="text-center py-12">
            <div className="space-y-3">
              <div className="text-6xl">📋</div>
              <h3 className="text-xl font-bold text-slate-800">No results yet</h3>
              <p className="text-slate-600">
                Complete your first assessment to see your results here.
              </p>
              <Button
                onClick={() => router.push('/dashboard/student')}
                variant="primary"
              >
                Go to Assessments
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const assessment = getAssessmentById(result.assessmentId);
              const isExpanded = expandedResult === result.id;
              const badge = getScoreBadge(result.percentage);

              return (
                <Card key={result.id} className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {result.subject === 'Mathematics'
                            ? '🔢'
                            : result.subject === 'English'
                            ? '📖'
                            : '📝'}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">
                            {assessment?.title || 'Assessment'}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {result.subject} • Completed {formatDate(result.completedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div>
                          <p className={`text-3xl font-bold ${getScoreColor(result.percentage)}`}>
                            {result.percentage}%
                          </p>
                          <p className="text-sm text-slate-600">
                            {result.score} / {result.totalPoints} points
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-lg border font-semibold text-sm ${badge.color}`}
                        >
                          {badge.label}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => toggleExpanded(result.id)}
                      variant="ghost"
                      size="sm"
                    >
                      {isExpanded ? '▲ Hide Details' : '▼ View Details'}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="font-bold text-slate-800">Answer Breakdown</h4>
                      <div className="space-y-2">
                        {result.answers.map((answer, idx) => {
                          const question = assessment?.questions.find((q) => q.id === answer.questionId);
                          return (
                            <div
                              key={answer.questionId}
                              className={`p-3 rounded-lg border ${
                                answer.isCorrect
                                  ? 'bg-emerald-50 border-emerald-200'
                                  : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <span className="flex-shrink-0 text-lg">
                                  {answer.isCorrect ? '✓' : '✗'}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-slate-800">
                                    Question {idx + 1}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    {question?.question || 'Question'}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {answer.points} / {question?.points || 0} points
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Personalized Feedback Section */}
                      <div className="pt-4 border-t border-slate-100">
                        <button
                          onClick={() =>
                            setSelectedFeedback(
                              selectedFeedback === result.id ? null : result.id
                            )
                          }
                          className="flex items-center gap-2 text-lg font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                        >
                          <span className="text-2xl">💬</span>
                          {selectedFeedback === result.id
                            ? 'Hide Personalized Feedback'
                            : 'View Personalized Feedback'}
                          <span className="text-sm">
                            {selectedFeedback === result.id ? '▲' : '▼'}
                          </span>
                        </button>

                        {selectedFeedback === result.id && (() => {
                          const feedback = getFeedbackForResult(result.id);
                          return feedback ? (
                            <div className="mt-4">
                              <PersonalizedFeedback feedback={feedback} />
                            </div>
                          ) : (
                            <div className="mt-4 p-4 rounded-lg bg-slate-50 text-center text-slate-500">
                              <p>
                                Feedback is being generated for this assessment...
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
