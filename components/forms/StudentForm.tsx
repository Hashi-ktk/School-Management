'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Student } from '@/types';

interface StudentFormProps {
  student?: Student;
  teacherId: string;
  schoolId: string;
  onSave: (student: Partial<Student>) => void;
  onCancel: () => void;
}

export default function StudentForm({
  student,
  teacherId,
  schoolId,
  onSave,
  onCancel,
}: StudentFormProps) {
  const [name, setName] = useState(student?.name || '');
  const [grade, setGrade] = useState(student?.grade?.toString() || '3');
  const [subjects, setSubjects] = useState<string[]>(student?.subjects || ['Mathematics', 'English', 'Urdu']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const studentData: Partial<Student> = {
      ...(student?.id && { id: student.id }),
      name,
      grade: Number(grade),
      schoolId,
      teacherId,
      subjects,
    };

    onSave(studentData);
  };

  const toggleSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 grid place-content-center p-4">
      <Card className="w-full max-w-2xl mb-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-2">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
          <p className="text-[#374151] text-sm">
            {student ? 'Update student information' : 'Register a new student in your class'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Student Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Ali Ahmed"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Grade Level</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
            >
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Subjects</label>
            <div className="flex flex-wrap gap-3">
              {['Mathematics', 'English', 'Urdu'].map((subject) => (
                <label
                  key={subject}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition ${
                    subjects.includes(subject)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={subjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {student ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
