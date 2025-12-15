'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import { getResults, formatDate, formatTime } from "@/lib/utils";
import type { AssessmentResult } from "@/types";

export default function ResultsPage() {
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;
    setResults(getResults());
  }, [isLoading, user]);

  const badge = (subject: string) => {
    const map: Record<string, string> = {
      Mathematics: "bg-indigo-50 text-indigo-700 ring-indigo-100",
      English: "bg-blue-50 text-blue-700 ring-blue-100",
      Urdu: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    };
    return map[subject] ?? "bg-slate-50 text-slate-700 ring-slate-100";
  };

  const statusColor = (pct: number) => {
    if (pct >= 80) return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    if (pct >= 60) return "bg-amber-50 text-amber-700 ring-amber-100";
    return "bg-rose-50 text-rose-700 ring-rose-100";
  };

  if (isLoading || !user) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 md:px-0 py-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Results</p>
        <h1 className="text-3xl font-bold text-slate-800">
          Assessment results
        </h1>
        <p className="text-slate-600">Detailed outcomes with clear visual cues.</p>
      </div>

      <div className="space-y-8 mb-8">
        {results.map((result) => (
          <Card key={result.id} className="mb-6 p-7 md:p-9">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-full ring-1 ${badge(result.subject)} grid place-content-center font-bold`}
                >
                  {result.studentName.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{result.studentName}</h3>
                  <p className="text-sm text-slate-600">
                    {result.subject} · Grade {result.grade}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div
                  className={`text-3xl font-bold ${
                    result.percentage >= 80
                      ? "text-emerald-600"
                      : result.percentage >= 60
                        ? "text-amber-600"
                        : "text-red-500"
                  }`}
                >
                  {result.percentage}%
                </div>
                <div className="text-sm text-slate-600">
                  {result.score}/{result.totalPoints} points
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-600 mb-4">
              <span>
                Completed: {formatDate(result.completedAt)} at {formatTime(result.completedAt)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ${statusColor(result.percentage)}`}>
                {result.status}
              </span>
            </div>

            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full ${
                  result.percentage >= 80
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                    : result.percentage >= 60
                      ? "bg-gradient-to-r from-amber-500 to-amber-400"
                      : "bg-gradient-to-r from-rose-500 to-rose-400"
                }`}
                style={{ width: `${result.percentage}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

