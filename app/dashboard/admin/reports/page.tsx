'use client';

import React, { useState } from 'react';
import { getStudents, getAssessments, getAllResults } from '@/lib/utils';
import { generateStudentProgressReport, generateReportCard } from '@/lib/reportData';
import { getAssessmentItemAnalysis } from '@/lib/itemAnalysis';
import { exportClassSummaryToExcel, exportStudentReportToExcel, exportItemAnalysisToExcel } from '@/lib/excelExport';
import { exportPageAsPDF } from '@/lib/exportPDF';
import StudentProgressReport from '@/components/reports/StudentProgressReport';
import StudentReportCard from '@/components/reports/StudentReportCard';
import AssessmentItemAnalysisComponent from '@/components/reports/AssessmentItemAnalysis';

type ReportType = 'student-progress' | 'system-export' | 'report-card' | 'item-analysis' | null;

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  const students = getStudents();
  const assessments = getAssessments();
  const allResults = getAllResults();

  const generateReport = (type: ReportType) => {
    setSelectedReport(type);
    setReportData(null);

    switch (type) {
      case 'student-progress':
        if (selectedStudentId) {
          const data = generateStudentProgressReport(selectedStudentId);
          setReportData(data);
        }
        break;
      case 'report-card':
        if (selectedStudentId) {
          const cardData = generateReportCard(selectedStudentId);
          setReportData(cardData);
        }
        break;
      case 'item-analysis':
        if (selectedAssessmentId) {
          const analysisData = getAssessmentItemAnalysis(selectedAssessmentId);
          setReportData(analysisData);
        }
        break;
      case 'system-export':
        // Direct export, no display
        exportClassSummaryToExcel();
        setSelectedReport(null);
        break;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!selectedReport) return;

    const elementIds: Record<string, string> = {
      'student-progress': 'student-progress-report',
      'report-card': 'student-report-card',
      'item-analysis': 'assessment-item-analysis',
    };

    const elementId = elementIds[selectedReport];
    if (elementId) {
      await exportPageAsPDF(elementId, `${selectedReport}-${Date.now()}.pdf`);
    }
  };

  const handleExportExcel = () => {
    switch (selectedReport) {
      case 'student-progress':
        if (selectedStudentId) {
          exportStudentReportToExcel(selectedStudentId);
        }
        break;
      case 'item-analysis':
        if (selectedAssessmentId) {
          const assessment = assessments.find(a => a.id === selectedAssessmentId);
          if (assessment) {
            exportItemAnalysisToExcel(selectedAssessmentId, assessment.title);
          }
        }
        break;
    }
  };

  // System statistics
  const totalStudents = students.length;
  const totalAssessments = assessments.length;
  const totalResults = allResults.length;
  const averageScore = allResults.length > 0
    ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length)
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          System Reports & Analytics
        </h1>
        <p className="text-gray-600 mt-2">
          Generate system-wide reports and export data for all students and assessments
        </p>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
          <p className="text-sm text-slate-500 font-medium">Total Students</p>
          <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
          <p className="text-sm text-slate-500 font-medium">Total Assessments</p>
          <p className="text-3xl font-bold text-purple-600">{totalAssessments}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200">
          <p className="text-sm text-slate-500 font-medium">Total Results</p>
          <p className="text-3xl font-bold text-emerald-600">{totalResults}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
          <p className="text-sm text-slate-500 font-medium">Average Score</p>
          <p className="text-3xl font-bold text-orange-600">{averageScore}%</p>
        </div>
      </div>

      {!reportData ? (
        /* Report Selection Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System-Wide Data Export */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                🌐
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System-Wide Data Export</h3>
                <p className="text-sm text-gray-500">Complete system data in Excel format</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 h-20">
              Export all students, results, and grade-level summaries in a comprehensive Excel workbook
              with multiple sheets.
            </p>
            <button
              onClick={() => generateReport('system-export')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              📊 Export System Data (Excel)
            </button>
          </div>

          {/* Individual Student Report */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-purple-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Student Progress Report</h3>
                <p className="text-sm text-gray-500">Any student in the system</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- Choose Student --</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} (Grade {student.grade})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => generateReport('student-progress')}
              disabled={!selectedStudentId}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
            >
              Generate Report
            </button>
          </div>

          {/* Student Report Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-green-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                🎓
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Student Report Card</h3>
                <p className="text-sm text-gray-500">Printable grade report</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">-- Choose Student --</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} (Grade {student.grade})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => generateReport('report-card')}
              disabled={!selectedStudentId}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
            >
              Generate Report Card
            </button>
          </div>

          {/* Assessment Item Analysis */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-orange-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                📝
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Assessment Item Analysis</h3>
                <p className="text-sm text-gray-500">Question quality metrics</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Assessment
              </label>
              <select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">-- Choose Assessment --</option>
                {assessments.map(assessment => (
                  <option key={assessment.id} value={assessment.id}>
                    {assessment.title} ({assessment.subject} - Grade {assessment.grade})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => generateReport('item-analysis')}
              disabled={!selectedAssessmentId}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
            >
              Analyze Assessment
            </button>
          </div>
        </div>
      ) : (
        /* Report Display */
        <div>
          {/* Action Buttons */}
          <div className="flex gap-3 mb-6 print:hidden">
            <button
              onClick={() => setReportData(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Reports
            </button>
            <button
              onClick={handlePrint}
              className="print-button"
            >
              Print Report
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              📄 Export PDF
            </button>
            {(selectedReport === 'student-progress' || selectedReport === 'item-analysis') && (
              <button
                onClick={handleExportExcel}
                className="export-button"
              >
                Export Excel
              </button>
            )}
          </div>

          {/* Render Report */}
          {selectedReport === 'student-progress' && reportData && (
            <StudentProgressReport data={reportData} />
          )}
          {selectedReport === 'report-card' && reportData && (
            <StudentReportCard data={reportData} />
          )}
          {selectedReport === 'item-analysis' && reportData && (
            <AssessmentItemAnalysisComponent data={reportData} />
          )}
        </div>
      )}
    </div>
  );
}
