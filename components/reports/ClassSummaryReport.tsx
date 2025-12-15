'use client';

import React from 'react';
import { formatDate } from '@/lib/utils';
import type { ClassSummaryReportData } from '@/lib/reportData';

interface ClassSummaryReportProps {
  data: ClassSummaryReportData;
  onClose?: () => void;
}

export default function ClassSummaryReport({ data, onClose }: ClassSummaryReportProps) {
  const { teacher, classInfo, overallStatistics, performanceDistribution, subjectBreakdown, atRiskStudents, topPerformers } = data;

  return (
    <div
      id="class-summary-report"
      className="bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-800 p-8 rounded-lg max-w-6xl mx-auto border border-slate-200 shadow-lg"
    >
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">
              Class Summary Report
            </h1>
            <p className="text-slate-600 mt-2">
              Teacher: {teacher.name}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 print:hidden"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-4">
          Generated on {formatDate(data.generatedAt)}
        </p>
      </div>

      {/* Class Information */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
          Class Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Total Students</p>
            <p className="text-3xl font-bold text-indigo-600">
              {classInfo.totalStudents}
            </p>
          </div>
          {classInfo.grade && (
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-sm">Grade Level</p>
              <p className="text-3xl font-bold text-purple-600">
                {classInfo.grade}
              </p>
            </div>
          )}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Subjects</p>
            <p className="text-lg font-medium mt-2 text-slate-800">
              {classInfo.subjects.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
          Overall Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Average Score</p>
            <p className="text-3xl font-bold text-blue-600">
              {overallStatistics.averageScore}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Total Assessments</p>
            <p className="text-3xl font-bold text-purple-600">
              {overallStatistics.totalAssessments}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Completion Rate</p>
            <p className="text-3xl font-bold text-green-600">
              {overallStatistics.completionRate}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Pass Rate</p>
            <p className="text-3xl font-bold text-amber-600">
              {overallStatistics.passRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Performance Distribution */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
          Performance Distribution
        </h2>
        <div className="space-y-4">
          {performanceDistribution.map((tier) => (
            <div key={tier.tier} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl print:hidden">{tier.icon}</span>
                  <h3 className="text-lg font-semibold text-slate-800">{tier.tier}</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold" style={{ color: tier.color }}>
                    {tier.count}
                  </span>
                  <span className="text-slate-500 ml-2">
                    ({tier.percentage}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${tier.percentage}%`,
                    backgroundColor: tier.color,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
          Subject Breakdown
        </h2>
        <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-slate-700">Subject</th>
                <th className="px-4 py-3 text-right text-slate-700">Average Score</th>
                <th className="px-4 py-3 text-right text-slate-700">Total Attempts</th>
                <th className="px-4 py-3 text-right text-slate-700">Students Assessed</th>
                <th className="px-4 py-3 text-right text-slate-700">Pass Rate</th>
              </tr>
            </thead>
            <tbody>
              {subjectBreakdown.map((subject, index) => (
                <tr
                  key={subject.subject}
                  className={`${
                    index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                  } border-b border-slate-200`}
                >
                  <td className="px-4 py-3 font-medium text-slate-800">{subject.subject}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-bold ${
                        subject.averageScore >= 80
                          ? 'text-green-600'
                          : subject.averageScore >= 60
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {subject.averageScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">{subject.totalAttempts}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{subject.studentsAssessed}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{subject.passRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* At-Risk Students */}
      {atRiskStudents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">
            At-Risk Students (Score &lt; 60%)
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-3">
              These students need immediate attention and additional support:
            </p>
            <div className="space-y-2">
              {atRiskStudents.map((student) => (
                <div
                  key={student.studentId}
                  className="flex justify-between items-center bg-white p-3 rounded border border-slate-200"
                >
                  <div>
                    <p className="font-medium text-slate-800">{student.studentName}</p>
                    <p className="text-xs text-slate-500">
                      {student.totalAssessments} assessments • {student.trend}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-600">
                      {student.averageScore}%
                    </p>
                    <p className="text-xs text-slate-500">
                      {student.performanceTier}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">
            Top Performers (Score ≥ 80%)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topPerformers.map((student) => (
              <div
                key={student.studentId}
                className="bg-white p-4 rounded-lg flex justify-between items-center border border-slate-200 shadow-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{student.studentName}</p>
                  <p className="text-xs text-slate-500">
                    {student.totalAssessments} assessments
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {student.averageScore}%
                  </p>
                  <p className="text-xs text-slate-500">
                    {student.trend === 'improving' ? '📈' : student.trend === 'declining' ? '📉' : '➡️'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights & Recommendations */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-purple-600">
          Insights & Recommendations
        </h2>
        <div className="bg-white p-4 rounded-lg space-y-3 border border-slate-200 shadow-sm">
          {overallStatistics.averageScore >= 80 && (
            <p className="flex items-start text-slate-700">
              <span className="text-green-600 mr-2">✓</span>
              <span>Class is performing exceptionally well with an {overallStatistics.averageScore}% average.</span>
            </p>
          )}
          {overallStatistics.passRate < 70 && (
            <p className="flex items-start text-slate-700">
              <span className="text-amber-600 mr-2">⚠</span>
              <span>Pass rate of {overallStatistics.passRate}% indicates need for additional support and intervention strategies.</span>
            </p>
          )}
          {atRiskStudents.length > classInfo.totalStudents * 0.3 && (
            <p className="flex items-start text-slate-700">
              <span className="text-red-600 mr-2">!</span>
              <span>{atRiskStudents.length} students ({Math.round((atRiskStudents.length / classInfo.totalStudents) * 100)}%) are at risk. Consider implementing targeted interventions.</span>
            </p>
          )}
          {overallStatistics.completionRate < 80 && (
            <p className="flex items-start text-slate-700">
              <span className="text-amber-600 mr-2">⚠</span>
              <span>Completion rate of {overallStatistics.completionRate}% suggests some students may need encouragement or deadline adjustments.</span>
            </p>
          )}
          {subjectBreakdown.some(s => s.averageScore < 60) && (
            <p className="flex items-start text-slate-700">
              <span className="text-amber-600 mr-2">⚠</span>
              <span>
                Subject(s) with low performance: {subjectBreakdown.filter(s => s.averageScore < 60).map(s => s.subject).join(', ')}.
                Consider subject-specific remediation.
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        <p>This report is for internal use and administrative review.</p>
        <p className="mt-2">
          For detailed individual student reports, please generate separate progress reports.
        </p>
      </div>
    </div>
  );
}
