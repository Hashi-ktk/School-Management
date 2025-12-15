'use client';

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getObservationsByObserver } from "@/lib/observationUtils";
import { formatDate } from "@/lib/utils";
import type { ClassroomObservation } from "@/types";

export default function ObservationsListPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [observations, setObservations] = useState<ClassroomObservation[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'draft'>('all');

  useEffect(() => {
    if (isLoading || !user) return;

    const obs = getObservationsByObserver(user.id);
    setObservations(obs);
  }, [isLoading, user]);

  if (isLoading || !user) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading...</div>;
  }

  const filteredObservations = observations.filter(obs => {
    if (filter === 'all') return true;
    return obs.status === filter;
  });

  const stats = {
    total: observations.length,
    completed: observations.filter(o => o.status === 'completed').length,
    drafts: observations.filter(o => o.status === 'draft').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">My Observations</p>
          <h1 className="text-3xl font-bold text-slate-800">All Classroom Observations</h1>
          <p className="text-slate-600">View and manage your observation reports.</p>
        </div>
        <Button onClick={() => router.push('/dashboard/observer/observations/create')}>
          ➕ New Observation
        </Button>
      </div>

      {/* Filter Tabs */}
      <Card className="mb-0">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'completed'
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed ({stats.completed})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Drafts ({stats.drafts})
          </button>
        </div>
      </Card>

      {/* Observations List */}
      {filteredObservations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {filter === 'all'
                ? 'No observations yet. Create your first observation!'
                : `No ${filter} observations found.`
              }
            </p>
            <Button
              onClick={() => router.push('/dashboard/observer/observations/create')}
              variant="primary"
            >
              ➕ Create New Observation
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredObservations.map((observation) => (
            <Card key={observation.id} className="mb-0 hover:shadow-lg transition cursor-pointer"
              onClick={() => router.push(`/dashboard/observer/observations/${observation.id}`)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">{observation.teacherName}</h3>
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
                <div className="text-left sm:text-right">
                  <div className={`text-3xl font-bold mb-1 ${
                    observation.status === 'completed' ? 'text-indigo-600' : 'text-slate-400'
                  }`}>
                    {observation.status === 'completed' ? `${observation.overallScore}%` : 'Draft'}
                  </div>
                  <div className="text-sm text-slate-600">Overall Score</div>
                </div>
              </div>

              {observation.status === 'completed' && (
                <>
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">Indicators</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {observation.indicators.slice(0, 3).map((indicator, index) => (
                        <div key={index} className="p-3 rounded-lg border border-slate-200 bg-white">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-900">{indicator.name}</span>
                            <span className="text-xs font-bold text-indigo-600">
                              {indicator.score}/{indicator.maxScore}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                              style={{ width: `${(indicator.score / indicator.maxScore) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {observation.indicators.length > 3 && (
                      <p className="text-xs text-gray-500 mt-2">
                        +{observation.indicators.length - 3} more indicators
                      </p>
                    )}
                  </div>

                  {observation.feedback && (
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-700 line-clamp-2">{observation.feedback}</p>
                    </div>
                  )}
                </>
              )}

              {observation.status === 'draft' && observation.preObservationNotes && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500">
                    <span className="font-medium">Notes:</span> {observation.preObservationNotes}
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
