'use client';

import { useEffect, useState, useMemo } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { getStudents, getResultsByStudent } from "@/lib/utils";
import { filterStudents, type StudentFilters } from "@/lib/filterUtils";
import { prepareStudentCSVData } from "@/lib/exportUtils";
import { CSVLink } from "react-csv";
import type { Student } from "@/types";

export default function AdminStudentsPage() {
  const { user, isLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState<StudentFilters>({
    search: '',
    grade: 'all',
    subject: 'all',
    performance: 'all'
  });

  useEffect(() => {
    if (isLoading || !user) return;
    setStudents(getStudents());
  }, [isLoading, user]);

  const getAverageScore = (studentId: string) => {
    const results = getResultsByStudent(studentId);
    if (!results.length) return 0;
    const total = results.reduce((sum, r) => sum + r.percentage, 0);
    return Math.round(total / results.length);
  };

  // Apply filters using useMemo
  const filteredStudents = useMemo(() => {
    return filterStudents(students, filters, getAverageScore);
  }, [students, filters]);

  if (isLoading || !user) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Students</p>
          <h2 className="text-3xl font-bold text-slate-800">All students</h2>
          <p className="text-slate-600">System-wide student management.</p>
        </div>
        <CSVLink
          data={prepareStudentCSVData(filteredStudents, getAverageScore)}
          filename={`students-${new Date().toISOString().split('T')[0]}.csv`}
        >
          <Button variant="secondary">📥 Export CSV</Button>
        </CSVLink>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilters({ ...filters, search: value })}
          placeholder="Search students by name..."
          className="flex-1"
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
          value={filters.performance}
          onChange={(value) => setFilters({ ...filters, performance: value })}
          options={[
            { value: 'all', label: 'All Performance' },
            { value: 'high', label: 'High (80%+)' },
            { value: 'medium', label: 'Medium (60-79%)' },
            { value: 'low', label: 'Low (<60%)' }
          ]}
          className="lg:w-56"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-slate-600">No students found</p>
          <p className="text-sm text-slate-400 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="text-sm text-slate-600 mb-4">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => {
          const avgScore = getAverageScore(student.id);
          return (
            <Card key={student.id} hover className="mb-0">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 grid place-content-center text-xl font-bold">
                  {student.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 truncate">{student.name}</h3>
                  <p className="text-sm text-slate-600">Grade {student.grade}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Average Score</span>
                  <span
                    className={`text-lg font-bold ${
                      avgScore >= 80 ? "text-green-600" : avgScore >= 60 ? "text-yellow-600" : "text-red-600"
                    }`}
                  >
                    {avgScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      avgScore >= 80 ? "bg-green-500" : avgScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${avgScore}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {student.subjects.map((subject: string) => (
                  <span key={subject} className="px-3 py-1 bg-[#f3f4f6] rounded-full text-xs text-slate-700">
                    {subject}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

