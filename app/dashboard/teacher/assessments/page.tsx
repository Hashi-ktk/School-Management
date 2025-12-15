'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { getAssessments, formatDate, deleteAssessment } from "@/lib/utils";
import type { Assessment } from "@/types";

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user || role !== "teacher") return;
    const allAssessments = getAssessments();
    setAssessments(allAssessments);
    setFilteredAssessments(allAssessments);
  }, [isLoading, user, role]);

  useEffect(() => {
    let filtered = assessments;

    // Filter by subject
    if (subjectFilter !== "all") {
      filtered = filtered.filter((a) => a.subject === subjectFilter);
    }

    // Filter by grade
    if (gradeFilter !== "all") {
      filtered = filtered.filter((a) => a.grade === Number(gradeFilter));
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(query) ||
        a.subject.toLowerCase().includes(query)
      );
    }

    setFilteredAssessments(filtered);
  }, [assessments, subjectFilter, gradeFilter, searchQuery]);

  const subjectBadge = (subject: Assessment["subject"]) => {
    const map: Record<Assessment["subject"], string> = {
      Mathematics: "bg-blue-50 text-blue-700 ring-blue-600/20",
      English: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
      Urdu: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    };
    return map[subject] ?? "bg-slate-50 text-slate-700 ring-slate-100";
  };

  if (isLoading || !user || role !== "teacher") {
    return (
      <div className="min-h-[60vh] grid place-content-center text-slate-600">Loading assessments…</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 md:px-0 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Assessments</p>
          <h1 className="text-3xl font-bold text-slate-800">
            Manage assessments
          </h1>
          <p className="text-slate-600">Glass cards, quick assign, and clear metadata per subject.</p>
        </div>
        <Button size="lg" onClick={() => router.push("/dashboard/teacher/assessments/create")}>
          + Create assessment
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or subject..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
            >
              <option value="all">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Urdu">Urdu</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Grade</label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
            >
              <option value="all">All Grades</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {filteredAssessments.length} of {assessments.length} assessments
          </p>
          {(subjectFilter !== "all" || gradeFilter !== "all" || searchQuery !== "") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSubjectFilter("all");
                setGradeFilter("all");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {filteredAssessments.length === 0 ? (
        <Card className="mb-0">
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg mb-2">No assessments found</p>
            <p className="text-sm text-slate-400 mb-4">
              {assessments.length === 0
                ? "Create your first assessment to get started"
                : "Try adjusting your filters or search query"}
            </p>
            {assessments.length === 0 && (
              <Button onClick={() => router.push("/dashboard/teacher/assessments/create")}>
                + Create Assessment
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment) => (
          <Link
            key={assessment.id}
            href={`/dashboard/teacher/assessments/${assessment.id}`}
            className="group block"
          >
            <Card className="h-full hover:glow-hover">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${subjectBadge(
                    assessment.subject
                  )}`}
                >
                  {assessment.subject}
                </span>
                <span className="text-xs font-medium text-slate-600">Grade {assessment.grade}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-3 leading-snug group-hover:text-indigo-600">
                {assessment.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">📝</span> {assessment.questions.length} questions
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">⏱️</span> {assessment.duration} min
                </span>
              </div>
              <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Created {formatDate(assessment.createdAt)}</span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/dashboard/teacher/assessments/${assessment.id}/assign`);
                    }}
                  >
                    Assign
                  </Button>
                  {assessment.id.startsWith("custom-") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteAssessment(assessment.id);
                        setAssessments(getAssessments());
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
