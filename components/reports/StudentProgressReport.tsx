'use client';

import React from 'react';
import { formatDate } from '@/lib/utils';
import type { StudentProgressReportData } from '@/lib/reportData';

interface StudentProgressReportProps {
  data: StudentProgressReportData;
  onClose?: () => void;
}

export default function StudentProgressReport({ data, onClose }: StudentProgressReportProps) {
  const { student, analytics, subjectPerformance, strengths, areasForImprovement, recommendations } = data;

  const getTierColor = (tier: string) => {
    if (tier === 'Proficient') return 'text-green-600';
    if (tier === 'Developing') return 'text-amber-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return '📈';
    if (trend === 'declining') return '📉';
    return '➡️';
  };

  return (
    <div
      id="student-progress-report"
      className="bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-800 p-8 rounded-lg max-w-5xl mx-auto border border-slate-200 shadow-lg"
    >
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">
              Student Progress Report
            </h1>
            <p className="text-slate-600 mt-2">
              {data.generatedFor}
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

      {/* Student Information */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
          Student Information
        </h2>
        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <p className="text-slate-500 text-sm">Name</p>
            <p className="text-lg font-medium text-slate-800">{student.name}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Grade</p>
            <p className="text-lg font-medium text-slate-800">Grade {student.grade}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Student ID</p>
            <p className="text-lg font-medium text-slate-800">{student.id}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Subjects</p>
            <p className="text-lg font-medium text-slate-800">{student.subjects.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* Overall Performance */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
          Overall Performance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Average Score</p>
            <p className="text-3xl font-bold text-blue-600">
              {analytics.averageScore}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Performance Tier</p>
            <p className={`text-xl font-bold ${getTierColor(analytics.performanceTier)}`}>
              {analytics.performanceTier}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Total Assessments</p>
            <p className="text-3xl font-bold text-purple-600">
              {analytics.totalAssessments}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Trend</p>
            <p className="text-2xl font-bold text-slate-800">
              {getTrendIcon(analytics.trend)} {analytics.trend}
            </p>
          </div>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
          Subject Performance
        </h2>
        <div className="space-y-4">
          {subjectPerformance.map((subject) => (
            <div
              key={subject.subject}
              className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-slate-800">{subject.subject}</h3>
                <span className="text-2xl font-bold text-blue-600">
                  {subject.averageScore}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 mb-3">
                <div
                  className={`h-3 rounded-full ${
                    subject.averageScore >= 80
                      ? 'bg-green-500'
                      : subject.averageScore >= 60
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${subject.averageScore}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                <div>
                  <p className="text-slate-500">Assessments</p>
                  <p className="font-medium text-slate-800">{subject.totalAssessments}</p>
                </div>
                <div>
                  <p className="text-slate-500">Highest</p>
                  <p className="font-medium text-slate-800">{subject.highestScore}%</p>
                </div>
                <div>
                  <p className="text-slate-500">Lowest</p>
                  <p className="font-medium text-slate-800">{subject.lowestScore}%</p>
                </div>
                <div>
                  <p className="text-slate-500">Pass Rate</p>
                  <p className="font-medium text-slate-800">{subject.passRate}%</p>
                </div>
                <div>
                  <p className="text-slate-500">Trend</p>
                  <p className="font-medium text-slate-800">{getTrendIcon(subject.trend)} {subject.trend}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-green-600">
          Strengths
        </h2>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start text-slate-700">
                <span className="text-green-600 mr-2">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Areas for Improvement */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-amber-600">
          Areas for Improvement
        </h2>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <ul className="space-y-2">
            {areasForImprovement.map((area, index) => (
              <li key={index} className="flex items-start text-slate-700">
                <span className="text-amber-600 mr-2">⚠</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-purple-600">
          Recommendations
        </h2>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start text-slate-700">
                <span className="text-purple-600 mr-2">→</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Performance History */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
          Recent Assessment History
        </h2>
        <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-2 text-left text-slate-700">Date</th>
                <th className="px-4 py-2 text-left text-slate-700">Subject</th>
                <th className="px-4 py-2 text-right text-slate-700">Score</th>
                <th className="px-4 py-2 text-right text-slate-700">Percentage</th>
                <th className="px-4 py-2 text-center text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.performanceHistory.slice(-10).reverse().map((result, index) => (
                <tr
                  key={result.id}
                  className={`${
                    index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                  } border-b border-slate-200`}
                >
                  <td className="px-4 py-2 text-slate-700">{formatDate(result.completedAt)}</td>
                  <td className="px-4 py-2 text-slate-700">{result.subject}</td>
                  <td className="px-4 py-2 text-right text-slate-700">
                    {result.score}/{result.totalPoints}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-slate-800">
                    {result.percentage}%
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        result.percentage >= 80
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : result.percentage >= 60
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {result.percentage >= 80
                        ? 'Excellent'
                        : result.percentage >= 60
                        ? 'Good'
                        : 'Needs Work'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        <p>This report is confidential and intended for educational purposes only.</p>
        <p className="mt-2">
          For questions or concerns, please contact the teacher or school administration.
        </p>
      </div>
    </div>
  );
}
