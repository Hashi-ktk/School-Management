'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getAvailableAssessments, getAssessmentAttempt, getAllResults } from '@/lib/utils';
import type { Assessment, AssessmentResult } from '@/types';

export default function StudentAssessmentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [completedResults, setCompletedResults] = useState<Record<string, AssessmentResult>>({});
  const [filter, setFilter] = useState<'all' | 'Mathematics' | 'English' | 'Urdu'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    if (!user || !user.grade) return;

    const available = getAvailableAssessments(user.id, user.grade);
    setAssessments(available);

    // Get completed results
    const results = getAllResults().filter(r => r.studentId === user.id && r.status === 'completed');
    const resultMap: Record<string, AssessmentResult> = {};
    results.forEach(r => {
      if (!resultMap[r.assessmentId] || new Date(r.completedAt) > new Date(resultMap[r.assessmentId].completedAt)) {
        resultMap[r.assessmentId] = r;
      }
    });
    setCompletedResults(resultMap);
  }, [user]);

  const hasInProgressAttempt = (assessmentId: string): boolean => {
    if (!user) return false;
    const attempt = getAssessmentAttempt(user.id, assessmentId);
    return attempt !== null;
  };

  const getAssessmentStatus = (assessment: Assessment) => {
    if (completedResults[assessment.id]) return 'completed';
    if (hasInProgressAttempt(assessment.id)) return 'in-progress';
    return 'new';
  };

  const filteredAssessments = assessments.filter(a => {
    if (filter !== 'all' && a.subject !== filter) return false;
    const status = getAssessmentStatus(a);
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: assessments.length,
    completed: Object.keys(completedResults).length,
    inProgress: assessments.filter(a => hasInProgressAttempt(a.id) && !completedResults[a.id]).length,
    new: assessments.filter(a => !hasInProgressAttempt(a.id) && !completedResults[a.id]).length,
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">My Assessments</h1>
        <p className="text-lg text-slate-600">Take assessments to test your knowledge</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center py-3 cursor-pointer hover:border-purple-300" onClick={() => setStatusFilter('all')}>
          <p className="text-2xl font-bold text-slate-700">{stats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </Card>
        <Card className="text-center py-3 cursor-pointer hover:border-emerald-300 bg-emerald-50 border-emerald-200" onClick={() => setStatusFilter('completed')}>
          <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
          <p className="text-xs text-emerald-600">Completed</p>
        </Card>
        <Card className="text-center py-3 cursor-pointer hover:border-amber-300 bg-amber-50 border-amber-200" onClick={() => setStatusFilter('in-progress')}>
          <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
          <p className="text-xs text-amber-600">In Progress</p>
        </Card>
        <Card className="text-center py-3 cursor-pointer hover:border-blue-300 bg-blue-50 border-blue-200" onClick={() => setStatusFilter('new')}>
          <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
          <p className="text-xs text-blue-600">New</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <span className="text-sm text-slate-500 self-center">Subject:</span>
          {(['all', 'Mathematics', 'English', 'Urdu'] as const).map(subj => (
            <Button
              key={subj}
              variant={filter === subj ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(subj)}
            >
              {subj === 'all' ? '📚 All' : subj === 'Mathematics' ? '🔢 Math' : subj === 'English' ? '📖 English' : '📝 Urdu'}
            </Button>
          ))}
        </div>
      </div>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No assessments found</h3>
          <p className="text-slate-500">
            {filter !== 'all' || statusFilter !== 'all'
              ? 'Try changing your filters'
              : 'Check back later for new assessments'}
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments.map(assessment => {
            const status = getAssessmentStatus(assessment);
            const result = completedResults[assessment.id];
            const inProgress = hasInProgressAttempt(assessment.id);

            return (
              <Card
                key={assessment.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  status === 'completed' ? 'border-emerald-200' :
                  status === 'in-progress' ? 'border-amber-200' : ''
                }`}
              >
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
                  status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {status === 'completed' ? '✓ Done' : status === 'in-progress' ? '⏳ In Progress' : '✨ New'}
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">
                      {assessment.subject === 'Mathematics' ? '🔢' :
                       assessment.subject === 'English' ? '📖' : '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 line-clamp-2">{assessment.title}</h3>
                      <p className="text-sm text-slate-500">{assessment.subject}</p>
                    </div>
                  </div>

                  {/* Assessment Info */}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      📋 {assessment.questions.length} questions
                    </span>
                    <span className="flex items-center gap-1">
                      ⏱️ {assessment.duration} min
                    </span>
                  </div>

                  {/* Score (if completed) */}
                  {result && (
                    <div className={`p-3 rounded-lg ${
                      result.percentage >= 80 ? 'bg-emerald-50' :
                      result.percentage >= 60 ? 'bg-amber-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Your Score:</span>
                        <span className={`text-xl font-bold ${
                          result.percentage >= 80 ? 'text-emerald-600' :
                          result.percentage >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {result.percentage}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant={status === 'completed' ? 'outline' : 'primary'}
                    className="w-full"
                    onClick={() => router.push(`/dashboard/student/assessment/${assessment.id}`)}
                  >
                    {status === 'completed' ? '🔄 Retake' :
                     status === 'in-progress' ? '▶️ Continue' : '🚀 Start'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
