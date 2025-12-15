'use client';

import { useEffect, useState, useMemo } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { getAssessments, formatDate, deleteAssessment } from "@/lib/utils";
import { filterAssessments, type AssessmentFilters } from "@/lib/filterUtils";
import type { Assessment } from "@/types";

export default function AdminAssessmentsPage() {
  const { user, isLoading } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filters, setFilters] = useState<AssessmentFilters>({
    search: '',
    subject: 'all',
    grade: 'all'
  });

  useEffect(() => {
    if (isLoading || !user) return;
    setAssessments(getAssessments());
  }, [isLoading, user]);

  const getSubjectColor = (subject: Assessment["subject"]) => {
    switch (subject) {
      case "Mathematics":
        return { badge: "bg-blue-50 text-blue-700 ring-blue-100" };
      case "English":
        return { badge: "bg-cyan-50 text-cyan-700 ring-cyan-100" };
      case "Urdu":
        return { badge: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
      default:
        return { badge: "bg-slate-50 text-slate-700 ring-slate-100" };
    }
  };

  // Apply filters using useMemo
  const filteredAssessments = useMemo(() => {
    return filterAssessments(assessments, filters);
  }, [assessments, filters]);

  if (isLoading || !user) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Assessments</p>
        <h2 className="text-3xl font-bold text-slate-800">All assessments</h2>
        <p className="text-slate-600">System-wide assessment management.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilters({ ...filters, search: value })}
          placeholder="Search assessments by title..."
          className="flex-1"
        />
        <Select
          value={filters.subject}
          onChange={(value) => setFilters({ ...filters, subject: value })}
          options={[
            { value: 'all', label: 'All Subjects' },
            { value: 'Mathematics', label: 'Mathematics' },
            { value: 'English', label: 'English' },
            { value: 'Urdu', label: 'Urdu' }
          ]}
          className="lg:w-48"
        />
        <Select
          value={filters.grade}
          onChange={(value) => setFilters({ ...filters, grade: value })}
          options={[
            { value: 'all', label: 'All Grades' },
            { value: '1', label: 'Grade 1' },
            { value: '2', label: 'Grade 2' },
            { value: '3', label: 'Grade 3' },
            { value: '4', label: 'Grade 4' },
            { value: '5', label: 'Grade 5' }
          ]}
          className="lg:w-48"
        />
      </div>

      {filteredAssessments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-slate-600">No assessments found</p>
          <p className="text-sm text-slate-400 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="text-sm text-slate-600 mb-4">
          Showing {filteredAssessments.length} of {assessments.length} assessments
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssessments.map((assessment) => {
          const colors = getSubjectColor(assessment.subject);
          return (
            <Card key={assessment.id} className="mb-0 bg-gradient-to-br from-white to-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ${colors.badge}`}>
                  {assessment.subject}
                </span>
                <span className="text-sm text-slate-600">Grade {assessment.grade}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">{assessment.title}</h3>
              <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                <span>📝 {assessment.questions.length} Questions</span>
                <span>⏱️ {assessment.duration} min</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Created: {formatDate(assessment.createdAt)}</span>
                {assessment.id.startsWith("custom-") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      deleteAssessment(assessment.id);
                      setAssessments(getAssessments());
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

