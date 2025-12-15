'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StudentForm from "@/components/forms/StudentForm";
import { useAuth } from "@/hooks/useAuth";
import { getStudents, getResultsByStudent, createStudent, updateStudent, deleteStudent } from "@/lib/utils";
import { getStudentAnalytics } from "@/lib/teacherAnalytics";
import type { Student } from "@/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const loadStudents = () => {
    if (!user) return;
    const list = getStudents().filter((s) => s.teacherId === user.id);
    setStudents(list);
  };

  useEffect(() => {
    if (isLoading || !user) return;
    loadStudents();
  }, [isLoading, user]);

  const handleAddStudent = () => {
    setEditingStudent(undefined);
    setShowForm(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleSaveStudent = (studentData: Partial<Student>) => {
    if (!user) return;

    if (studentData.id) {
      // Update existing student
      updateStudent(studentData as Student);
    } else {
      // Create new student
      createStudent({
        name: studentData.name!,
        grade: studentData.grade!,
        schoolId: studentData.schoolId!,
        teacherId: studentData.teacherId!,
        subjects: studentData.subjects!,
      });
    }

    setShowForm(false);
    setEditingStudent(undefined);
    loadStudents();
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      deleteStudent(studentId);
      loadStudents();
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStudent(undefined);
  };

  const averageScore = (id: string) => {
    const results = getResultsByStudent(id);
    if (!results.length) return 0;
    return Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
  };

  const barColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getTrendIcon = (studentId: string) => {
    const analytics = getStudentAnalytics(studentId);
    if (!analytics) return null;

    if (analytics.trend === 'improving') {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-semibold">
          📈 Improving
        </div>
      );
    }
    if (analytics.trend === 'declining') {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/20 text-rose-600 text-xs font-semibold">
          📉 Declining
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-500/20 text-slate-600 text-xs font-semibold">
        ➡️ Stable
      </div>
    );
  };

  if (isLoading || !user) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 md:px-0 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Students</p>
          <h1 className="text-3xl font-bold text-slate-800">
            My students
          </h1>
          <p className="text-slate-600">Progress snapshots by learner.</p>
        </div>
        <Button onClick={handleAddStudent} size="md">
          + Add Student
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => {
          const avg = averageScore(student.id);
          return (
            <Card key={student.id} className="mb-0">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 text-white grid place-content-center text-xl font-bold shadow-md">
                  {student.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-800 truncate">{student.name}</h3>
                  <p className="text-sm text-slate-600">Grade {student.grade}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Average score</span>
                  <span
                    className={`text-lg font-bold ${
                      avg >= 80 ? "text-emerald-600" : avg >= 60 ? "text-amber-600" : "text-red-500"
                    }`}
                  >
                    {avg}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${barColor(avg)}`} style={{ width: `${avg}%` }} />
                </div>
              </div>

              <div className="mb-4">
                {getTrendIcon(student.id)}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {student.subjects.map((subject: string) => (
                  <span key={subject} className="px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-700">
                    {subject}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditStudent(student)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteStudent(student.id)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {showForm && user && (
        <StudentForm
          student={editingStudent}
          teacherId={user.id}
          schoolId={user.schoolId || 'school-1'}
          onSave={handleSaveStudent}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

