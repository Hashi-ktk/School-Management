'use client';

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { getObservations } from "@/lib/observationUtils";
import { formatDate } from "@/lib/utils";
import type { ClassroomObservation } from "@/types";

export default function ObservationsPage() {
  const { user, isLoading } = useAuth();
  const [observations, setObservations] = useState<ClassroomObservation[]>([]);

  useEffect(() => {
    if (isLoading || !user) return;
    setObservations(getObservations());
  }, [isLoading, user]);

  if (isLoading || !user) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Observations</p>
          <h1 className="text-3xl font-bold text-slate-800">Classroom observations</h1>
          <p className="text-slate-600">AI-enhanced classroom observation reports.</p>
        </div>
        <Button>+ New Observation</Button>
      </div>

      <div className="space-y-6">
        {observations.map((observation) => (
          <Card key={observation.id} className="mb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{observation.teacherName}</h3>
                <p className="text-sm text-slate-600">{formatDate(observation.date)}</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{observation.overallScore}%</div>
                <div className="text-sm text-slate-600">Overall Score</div>
              </div>
            </div>

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

            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wide">Feedback</h4>
              <p className="text-slate-700">{observation.feedback}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

