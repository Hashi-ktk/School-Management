'use client';

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { getObservationsByTeacher } from "@/lib/observationUtils";
import { formatDate } from "@/lib/utils";
import type { ClassroomObservation } from "@/types";

export default function TeacherObservationsPage() {
  const { user, isLoading } = useAuth();
  const [observations, setObservations] = useState<ClassroomObservation[]>([]);

  useEffect(() => {
    if (isLoading || !user) return;

    const obs = getObservationsByTeacher(user.id);
    setObservations(obs);
  }, [isLoading, user]);

  if (isLoading || !user) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading...</div>;
  }

  const completedObservations = observations.filter(o => o.status === 'completed');
  const averageScore = completedObservations.length > 0
    ? Math.round(completedObservations.reduce((sum, o) => sum + o.overallScore, 0) / completedObservations.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">My Observations</p>
        <h1 className="text-3xl font-bold text-slate-800">Classroom Observations</h1>
        <p className="text-slate-600">View feedback and recommendations from classroom observers.</p>
      </div>

      {/* Summary Stats */}
      {completedObservations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center mb-0">
            <p className="text-sm font-semibold text-slate-700 mb-2">Total Observations</p>
            <p className="text-4xl font-bold text-indigo-600">{observations.length}</p>
          </Card>
          <Card className="text-center mb-0">
            <p className="text-sm font-semibold text-slate-700 mb-2">Average Score</p>
            <p className={`text-4xl font-bold ${getScoreColor(averageScore).split(' ')[0]}`}>
              {averageScore}%
            </p>
          </Card>
          <Card className="text-center mb-0">
            <p className="text-sm font-semibold text-slate-700 mb-2">Latest Score</p>
            <p className={`text-4xl font-bold ${
              completedObservations[0] ? getScoreColor(completedObservations[0].overallScore).split(' ')[0] : 'text-gray-400'
            }`}>
              {completedObservations[0] ? `${completedObservations[0].overallScore}%` : 'N/A'}
            </p>
          </Card>
        </div>
      )}

      {/* Observations List */}
      {observations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No observations yet</p>
            <p className="text-sm text-gray-400">Classroom observations will appear here once completed by observers.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {observations.map((observation) => (
            <Card key={observation.id} className="mb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      Observation by {observation.observerName}
                    </h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      observation.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {observation.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Grade {observation.classGrade} • {observation.subject} • {observation.observationType}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(observation.date)}</p>
                </div>
                {observation.status === 'completed' && (
                  <div className="text-left sm:text-right">
                    <div className={`text-3xl font-bold mb-1 ${getScoreColor(observation.overallScore).split(' ')[0]}`}>
                      {observation.overallScore}%
                    </div>
                    <div className="text-sm text-slate-600">Overall Score</div>
                  </div>
                )}
              </div>

              {observation.status === 'completed' && (
                <>
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">Indicators</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {observation.indicators.map((indicator, index) => (
                        <div key={index} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-900">{indicator.name}</span>
                            <span className="text-sm font-bold text-indigo-600">
                              {indicator.score}/{indicator.maxScore}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-2">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                              style={{ width: `${(indicator.score / indicator.maxScore) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-600">{indicator.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 mb-4">
                    <h4 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide">Feedback</h4>
                    <p className="text-slate-700">{observation.feedback}</p>
                  </div>

                  {observation.recommendations && observation.recommendations.length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">
                        Recommendations for Growth
                      </h4>
                      <ul className="space-y-2">
                        {observation.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm">
                            <span className="text-indigo-600 font-bold mt-0.5">✓</span>
                            <span className="text-slate-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {observation.status === 'draft' && (
                <div className="text-center py-6 bg-yellow-50 rounded-xl">
                  <p className="text-sm text-yellow-700">
                    This observation is still in draft. You'll see the full details once it's completed.
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
