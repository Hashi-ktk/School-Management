'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { getAssessmentById } from "@/lib/utils";
import type { Assessment } from "@/types";

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    if (isLoading || !user) return;
    const found = getAssessmentById(params.id as string) ?? null;
    setAssessment(found);
  }, [isLoading, user, params.id]);

  if (isLoading || !user || !assessment) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 md:px-0 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-800">
            {assessment.title}
          </h1>
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
              {assessment.subject}
            </span>
            <span>Grade {assessment.grade}</span>
            <span>•</span>
            <span>{assessment.duration} minutes</span>
            <span>•</span>
            <span>{assessment.questions.length} questions</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push(`/dashboard/teacher/assessments/${assessment.id}/assign`)}
          >
            Assign
          </Button>
        </div>
      </div>

      <Card className="mb-0">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Questions</h3>
        <div className="space-y-4">
          {assessment.questions.map((q: any, index: number) => (
            <div key={q.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-4">
                <span className="h-9 w-9 rounded-xl bg-indigo-100 border border-indigo-200 grid place-content-center text-sm font-semibold text-indigo-600">
                  {index + 1}
                </span>
                <div className="space-y-3 w-full">
                  <p className="text-slate-800 font-semibold">{q.question}</p>
                  {q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt: string, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                        >
                          {String.fromCharCode(65 + idx)}. {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-slate-500">
                    Points: {q.points} • Type: {q.type}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

