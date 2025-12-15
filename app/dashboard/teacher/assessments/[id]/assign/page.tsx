'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { getAssessmentById, getStudents } from "@/lib/utils";
import type { Assessment, Student } from "@/types";

export default function AssignAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isLoading || !user) return;
    const a = getAssessmentById(params.id as string) ?? null;
    const eligible = a ? getStudents().filter((s) => s.teacherId === user.id && s.grade === a.grade) : [];
    setAssessment(a);
    setStudents(eligible);
  }, [isLoading, user, params.id]);

  if (isLoading || !user || !assessment) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading…</div>;
  }

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 md:px-0 py-4">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-slate-800">
          Assign assessment
        </h1>
        <p className="text-slate-600">{assessment.title}</p>
      </div>

      <Card className="mb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Grade {assessment.grade}
            </p>
            <h3 className="text-lg font-bold text-slate-800">Select students</h3>
          </div>
          <span className="text-sm text-slate-600">{selected.size} selected</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {students.map((student) => {
            const active = selected.has(student.id);
            return (
              <button
                key={student.id}
                onClick={() => toggle(student.id)}
                className={`w-full rounded-2xl border-2 text-left p-4 transition ${
                  active
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-full grid place-content-center font-semibold ${
                      active ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {student.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{student.name}</p>
                     <p className="text-xs text-slate-500 truncate">Grade {student.grade}</p>
                  </div>
                  {active && <span className="ml-auto text-indigo-600 text-lg">✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">{selected.size} student(s) selected</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selected.size) {
                  alert("Select at least one student");
                  return;
                }
                alert(`Assessment assigned to ${selected.size} student(s)!`);
                router.push("/dashboard/teacher/assessments");
              }}
            >
              Assign now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

