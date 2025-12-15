'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { getObservationById, deleteObservation } from "@/lib/observationUtils";
import { formatDate } from "@/lib/utils";
import type { ClassroomObservation } from "@/types";

export default function ObservationDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [observation, setObservation] = useState<ClassroomObservation | null>(null);

  useEffect(() => {
    if (isLoading || !user || !params.id) return;

    const obs = getObservationById(params.id as string);
    setObservation(obs);
  }, [isLoading, user, params.id]);

  const handleDelete = () => {
    if (!observation) return;

    if (confirm('Are you sure you want to delete this observation?')) {
      deleteObservation(observation.id);
      router.push('/dashboard/observer/observations');
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading...</div>;
  }

  if (!observation) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Observation not found</p>
            <Button onClick={() => router.push('/dashboard/observer/observations')}>
              Back to Observations
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{observation.teacherName}</h1>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              observation.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {observation.status}
            </span>
          </div>
          <p className="text-gray-600">
            Grade {observation.classGrade} • {observation.subject} • {observation.observationType}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Observed on {formatDate(observation.date)} by {observation.observerName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/observer/observations')}
          >
            ← Back
          </Button>
          {observation.observerId === user.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:bg-red-50"
            >
              🗑️ Delete
            </Button>
          )}
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <div className="text-center py-8">
          <p className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Overall Score</p>
          <p className={`text-6xl font-bold mb-2 ${getScoreColor(observation.overallScore)}`}>
            {observation.overallScore}%
          </p>
          <p className="text-gray-600">Based on {observation.indicators.length} indicators</p>
        </div>
      </Card>

      {/* Pre-Observation Notes */}
      {observation.preObservationNotes && (
        <Card>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Pre-Observation Notes</h2>
          <p className="text-slate-700">{observation.preObservationNotes}</p>
        </Card>
      )}

      {/* Indicators */}
      <Card>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Observation Indicators</h2>
        <div className="space-y-6">
          {observation.indicators.map((indicator, index) => (
            <div key={index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{indicator.name}</h3>
                  {indicator.timestamp && (
                    <p className="text-xs text-gray-500">Timestamp: {indicator.timestamp}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-indigo-600">
                    {indicator.score}/{indicator.maxScore}
                  </span>
                  <p className="text-xs text-gray-600">
                    {Math.round((indicator.score / indicator.maxScore) * 100)}%
                  </p>
                </div>
              </div>

              <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                  style={{ width: `${(indicator.score / indicator.maxScore) * 100}%` }}
                />
              </div>

              {indicator.notes && (
                <div className="mt-3 p-3 rounded-lg bg-white border border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-1">Evidence / Notes:</p>
                  <p className="text-sm text-slate-600">{indicator.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Feedback */}
      {observation.feedback && (
        <Card>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Feedback</h2>
          <p className="text-slate-700 leading-relaxed">{observation.feedback}</p>
        </Card>
      )}

      {/* Recommendations */}
      {observation.recommendations && observation.recommendations.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recommendations</h2>
          <ul className="space-y-2">
            {observation.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <span className="text-slate-700">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Observation Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Observer</p>
            <p className="font-medium text-slate-900">{observation.observerName}</p>
          </div>
          <div>
            <p className="text-gray-500">Teacher</p>
            <p className="font-medium text-slate-900">{observation.teacherName}</p>
          </div>
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-medium text-slate-900">{observation.observationType}</p>
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium text-slate-900">{formatDate(observation.date)}</p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-medium text-slate-900">{formatDate(observation.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-500">Last Updated</p>
            <p className="font-medium text-slate-900">{formatDate(observation.updatedAt)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
