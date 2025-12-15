'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getStudents, getAssessments } from '@/lib/utils';
import { generateStudentProgressReport, generateClassSummaryReport, generateReportCard } from '@/lib/reportData';
import { getAssessmentItemAnalysis } from '@/lib/itemAnalysis';
import { exportStudentsToExcel, exportStudentReportToExcel, exportItemAnalysisToExcel } from '@/lib/excelExport';
import { exportPageAsPDF } from '@/lib/exportPDF';
import StudentProgressReport from '@/components/reports/StudentProgressReport';
import ClassSummaryReport from '@/components/reports/ClassSummaryReport';
import StudentReportCard from '@/components/reports/StudentReportCard';
import AssessmentItemAnalysisComponent from '@/components/reports/AssessmentItemAnalysis';

type ReportType = 'student-progress' | 'class-summary' | 'report-card' | 'item-analysis' | null;

export default function TeacherReportsPage() {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ReportType>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  const students = user ? getStudents().filter(s => s.teacherId === user.id) : [];
  const assessments = getAssessments();

  const generateReport = (type: ReportType) => {
    if (!user) return;

    setSelectedReport(type);
    setReportData(null);

    switch (type) {
      case 'student-progress':
        if (selectedStudentId) {
          const data = generateStudentProgressReport(selectedStudentId);
          setReportData(data);
        }
        break;
      case 'class-summary':
        const classData = generateClassSummaryReport(user.id, user.name);
        setReportData(classData);
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
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!selectedReport) return;

    const elementIds: Record<string, string> = {
      'student-progress': 'student-progress-report',
      'class-summary': 'class-summary-report',
      'report-card': 'student-report-card',
      'item-analysis': 'assessment-item-analysis',
    };

    const elementId = elementIds[selectedReport];
    if (elementId) {
      await exportPageAsPDF(elementId, `${selectedReport}-${Date.now()}.pdf`);
    }
  };

  const handleExportExcel = () => {
    if (!user) return;

    switch (selectedReport) {
      case 'student-progress':
        if (selectedStudentId) {
          exportStudentReportToExcel(selectedStudentId);
        }
        break;
      case 'class-summary':
        exportStudentsToExcel(user.id);
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Teacher</p>
        <h1 className="text-3xl font-bold text-slate-800">
          Reports & Analytics
        </h1>
        <p className="text-slate-600 mt-2">
          Generate comprehensive reports for students, assessments, and class performance
        </p>
      </div>

      {!reportData ? (
        /* Report Selection Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Progress Report */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Student Progress Report</h3>
                <p className="text-sm text-gray-500">Detailed individual student performance</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
            >
              Generate Report
            </button>
          </div>

          {/* Class Summary Report */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-purple-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Class Summary Report</h3>
                <p className="text-sm text-gray-500">Overall class performance overview</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 h-20">
              Generate a comprehensive report showing class-wide statistics, performance distribution,
              at-risk students, and subject-wise breakdowns.
            </p>
            <button
              onClick={() => generateReport('class-summary')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors"
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
                <p className="text-sm text-gray-500">Parent-friendly grade report</p>
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
                <p className="text-sm text-gray-500">Question difficulty and discrimination</p>
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
                    {assessment.title} ({assessment.subject})
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
            {(selectedReport === 'student-progress' || selectedReport === 'class-summary' || selectedReport === 'item-analysis') && (
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
          {selectedReport === 'class-summary' && reportData && (
            <ClassSummaryReport data={reportData} />
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
