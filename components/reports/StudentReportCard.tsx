'use client';

import React from 'react';
import { formatDate } from '@/lib/utils';
import type { ReportCardData } from '@/lib/reportData';

interface StudentReportCardProps {
  data: ReportCardData;
  onClose?: () => void;
}

export default function StudentReportCard({ data, onClose }: StudentReportCardProps) {
  const { student, reportPeriod, overallGrade, overallPercentage, performanceTier, subjectGrades, teacherComments, nextSteps } = data;

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'text-green-600';
    if (grade === 'B') return 'text-blue-600';
    if (grade === 'C') return 'text-yellow-600';
    if (grade === 'D') return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div
      id="student-report-card"
      className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-slate-800 p-8 rounded-lg max-w-4xl mx-auto border border-slate-200 shadow-lg"
    >
      {/* Header with School Crest/Logo Area */}
      <div className="text-center mb-8 border-b border-slate-200 pb-6">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 print:hidden"
          >
            ✕
          </button>
        )}
        <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center border border-indigo-200">
          <span className="text-4xl">🎓</span>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-slate-800">Student Report Card</h1>
        <p className="text-slate-600">Academic Performance Report</p>
      </div>

      {/* Student Information */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-indigo-600">
          Student Information
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Student Name</p>
            <p className="text-lg font-semibold text-slate-800">{student.name}</p>
          </div>
          <div>
            <p className="text-slate-500">Student ID</p>
            <p className="text-lg font-semibold text-slate-800">{student.id}</p>
          </div>
          <div>
            <p className="text-slate-500">Grade Level</p>
            <p className="text-lg font-semibold text-slate-800">Grade {student.grade}</p>
          </div>
          <div>
            <p className="text-slate-500">Report Period</p>
            <p className="text-lg font-semibold text-slate-800">
              {formatDate(reportPeriod.startDate)} - {formatDate(reportPeriod.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Performance - Large Display */}
      <div className="bg-white rounded-lg p-8 mb-6 text-center border border-slate-200 shadow-sm">
        <p className="text-slate-500 mb-2">Overall Grade</p>
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className={`text-8xl font-bold ${getGradeColor(overallGrade)}`}>
            {overallGrade}
          </div>
          <div className="text-left">
            <p className="text-5xl font-bold text-slate-800">{overallPercentage}%</p>
            <p className="text-xl text-slate-600 mt-2">{performanceTier}</p>
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${
              overallPercentage >= 90
                ? 'bg-green-500'
                : overallPercentage >= 80
                ? 'bg-blue-500'
                : overallPercentage >= 70
                ? 'bg-yellow-500'
                : overallPercentage >= 60
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${overallPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Subject Grades */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-indigo-600">
          Subject Performance
        </h2>
        <div className="space-y-4">
          {subjectGrades.map((subject) => (
            <div
              key={subject.subject}
              className="bg-slate-50 rounded-lg p-4 border border-slate-200"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-slate-800">{subject.subject}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-slate-800">{subject.percentage}%</span>
                  <span className={`text-5xl font-bold ${getGradeColor(subject.grade)}`}>
                    {subject.grade}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    subject.percentage >= 90
                      ? 'bg-green-500'
                      : subject.percentage >= 80
                      ? 'bg-blue-500'
                      : subject.percentage >= 70
                      ? 'bg-yellow-500'
                      : subject.percentage >= 60
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${subject.percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-600 italic">{subject.comments}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grading Scale Reference */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-indigo-600">
          Grading Scale
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div className="text-center bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-2xl font-bold text-green-600">A</p>
            <p className="text-slate-600">90-100%</p>
            <p className="text-xs text-slate-500">Excellent</p>
          </div>
          <div className="text-center bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">B</p>
            <p className="text-slate-600">80-89%</p>
            <p className="text-xs text-slate-500">Very Good</p>
          </div>
          <div className="text-center bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-600">C</p>
            <p className="text-slate-600">70-79%</p>
            <p className="text-xs text-slate-500">Good</p>
          </div>
          <div className="text-center bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-2xl font-bold text-orange-600">D</p>
            <p className="text-slate-600">60-69%</p>
            <p className="text-xs text-slate-500">Satisfactory</p>
          </div>
          <div className="text-center bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-2xl font-bold text-red-600">F</p>
            <p className="text-slate-600">Below 60%</p>
            <p className="text-xs text-slate-500">Needs Work</p>
          </div>
        </div>
      </div>

      {/* Teacher Comments */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-indigo-600">
          Teacher Comments
        </h3>
        <p className="text-slate-700 leading-relaxed">{teacherComments}</p>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-indigo-600">
          Next Steps for Success
        </h3>
        <ul className="space-y-2">
          {nextSteps.map((step, index) => (
            <li key={index} className="flex items-start">
              <span className="text-indigo-500 mr-2 mt-1">✓</span>
              <span className="text-slate-700">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-600">
          Generated on {formatDate(data.generatedAt)}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          This report card reflects {student.name}'s performance during the specified period.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          For questions or concerns, please contact your child's teacher.
        </p>
      </div>
    </div>
  );
}
