import * as XLSX from 'xlsx';
import {
  getStudents,
  getAllResults,
  getResultsByStudent,
  formatDate,
} from './utils';
import {
  getTeacherStudentAnalytics,
  getAtRiskStudents,
} from './teacherAnalytics';
import type { Student, AssessmentResult } from '@/types';

/**
 * Export students with their performance to Excel
 */
export function exportStudentsToExcel(
  teacherId: string,
  filename: string = 'students-report.xlsx'
): void {
  const students = getStudents().filter(s => s.teacherId === teacherId);
  const analytics = getTeacherStudentAnalytics(teacherId);

  // Sheet 1: Student Roster
  const rosterData = students.map(student => {
    const studentAnalytics = analytics.find(a => a.studentId === student.id);

    return {
      'Student ID': student.id,
      'Name': student.name,
      'Grade': student.grade,
      'Subjects': student.subjects.join(', '),
      'Average Score (%)': studentAnalytics?.averageScore || 0,
      'Performance Tier': studentAnalytics?.performanceTier || 'N/A',
      'Trend': studentAnalytics?.trend || 'N/A',
      'Total Assessments': studentAnalytics?.totalAssessments || 0,
      'At Risk': studentAnalytics?.isAtRisk ? 'Yes' : 'No',
    };
  });

  // Sheet 2: All Results
  const allResults = getAllResults().filter(r =>
    students.some(s => s.id === r.studentId)
  );

  const resultsData = allResults.map(result => ({
    'Result ID': result.id,
    'Student Name': result.studentName,
    'Assessment ID': result.assessmentId,
    'Subject': result.subject,
    'Grade': result.grade,
    'Score': result.score,
    'Total Points': result.totalPoints,
    'Percentage (%)': result.percentage,
    'Status': result.status,
    'Completed At': formatDate(result.completedAt),
  }));

  // Sheet 3: Subject-wise Performance
  const subjectMap = new Map<string, { subject: string; scores: number[]; attempts: number; studentIds: Set<string> }>();

  allResults.forEach(result => {
    if (!subjectMap.has(result.subject)) {
      subjectMap.set(result.subject, {
        subject: result.subject,
        scores: [],
        attempts: 0,
        studentIds: new Set(),
      });
    }
    const subjectData = subjectMap.get(result.subject)!;
    subjectData.scores.push(result.percentage);
    subjectData.attempts++;
    subjectData.studentIds.add(result.studentId);
  });

  const subjectData = Array.from(subjectMap.values()).map(data => {
    const averageScore = Math.round(
      data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length
    );
    const passRate = Math.round(
      (data.scores.filter(s => s >= 60).length / data.scores.length) * 100
    );

    return {
      'Subject': data.subject,
      'Average Score (%)': averageScore,
      'Total Attempts': data.attempts,
      'Students Assessed': data.studentIds.size,
      'Pass Rate (%)': passRate,
      'Highest Score': Math.max(...data.scores),
      'Lowest Score': Math.min(...data.scores),
    };
  });

  // Sheet 4: At-Risk Students
  const atRiskStudents = getAtRiskStudents(teacherId);
  const atRiskData = atRiskStudents.map(student => ({
    'Student Name': student.studentName,
    'Average Score (%)': student.averageScore,
    'Performance Tier': student.performanceTier,
    'Trend': student.trend,
    'Total Assessments': student.totalAssessments,
    'Recent Scores': student.recentScores.join(', '),
    'Last Assessment': formatDate(student.lastAssessmentDate),
  }));

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Add sheets
  const rosterSheet = XLSX.utils.json_to_sheet(rosterData);
  const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
  const subjectSheet = XLSX.utils.json_to_sheet(subjectData);
  const atRiskSheet = XLSX.utils.json_to_sheet(atRiskData.length > 0 ? atRiskData : [{ 'Message': 'No at-risk students' }]);

  XLSX.utils.book_append_sheet(workbook, rosterSheet, 'Student Roster');
  XLSX.utils.book_append_sheet(workbook, resultsSheet, 'All Results');
  XLSX.utils.book_append_sheet(workbook, subjectSheet, 'Subject Performance');
  XLSX.utils.book_append_sheet(workbook, atRiskSheet, 'At-Risk Students');

  // Style column widths
  const columnWidths = [
    { wch: 15 }, // Column A
    { wch: 20 }, // Column B
    { wch: 10 }, // Column C
    { wch: 25 }, // Column D
    { wch: 18 }, // Column E
    { wch: 18 }, // Column F
    { wch: 12 }, // Column G
    { wch: 18 }, // Column H
    { wch: 10 }, // Column I
  ];

  rosterSheet['!cols'] = columnWidths;
  resultsSheet['!cols'] = columnWidths;
  subjectSheet['!cols'] = columnWidths;
  atRiskSheet['!cols'] = columnWidths;

  // Download
  XLSX.writeFile(workbook, filename);
}

/**
 * Export individual student detailed report to Excel
 */
export function exportStudentReportToExcel(
  studentId: string,
  filename?: string
): void {
  const student = getStudents().find(s => s.id === studentId);
  if (!student) return;

  const results = getResultsByStudent(studentId);
  if (results.length === 0) return;

  const defaultFilename = `${student.name.replace(/\s+/g, '-')}-report.xlsx`;

  // Sheet 1: Student Profile
  const profileData = [{
    'Student ID': student.id,
    'Name': student.name,
    'Grade': student.grade,
    'School ID': student.schoolId,
    'Teacher ID': student.teacherId,
    'Subjects': student.subjects.join(', '),
  }];

  // Sheet 2: Assessment Results
  const resultsData = results.map(result => ({
    'Assessment ID': result.assessmentId,
    'Subject': result.subject,
    'Score': result.score,
    'Total Points': result.totalPoints,
    'Percentage (%)': result.percentage,
    'Status': result.status,
    'Completed At': formatDate(result.completedAt),
  }));

  // Sheet 3: Subject Performance
  const subjectMap = new Map<string, number[]>();
  results.forEach(result => {
    if (!subjectMap.has(result.subject)) {
      subjectMap.set(result.subject, []);
    }
    subjectMap.get(result.subject)!.push(result.percentage);
  });

  const subjectPerformanceData = Array.from(subjectMap.entries()).map(([subject, scores]) => {
    const avgScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    return {
      'Subject': subject,
      'Average Score (%)': avgScore,
      'Total Assessments': scores.length,
      'Highest Score': Math.max(...scores),
      'Lowest Score': Math.min(...scores),
      'Pass Rate (%)': Math.round((scores.filter(s => s >= 60).length / scores.length) * 100),
    };
  });

  // Sheet 4: Detailed Answers (last 5 assessments)
  const recentResults = results.slice(-5);
  const answersData: any[] = [];

  recentResults.forEach(result => {
    result.answers.forEach((answer, index) => {
      answersData.push({
        'Assessment ID': result.assessmentId,
        'Subject': result.subject,
        'Question #': index + 1,
        'Question ID': answer.questionId,
        'Answer': answer.answer,
        'Correct': answer.isCorrect ? 'Yes' : 'No',
        'Points Earned': answer.points,
        'Date': formatDate(result.completedAt),
      });
    });
  });

  // Create workbook
  const workbook = XLSX.utils.book_new();

  const profileSheet = XLSX.utils.json_to_sheet(profileData);
  const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
  const subjectSheet = XLSX.utils.json_to_sheet(subjectPerformanceData);
  const answersSheet = XLSX.utils.json_to_sheet(answersData.length > 0 ? answersData : [{ 'Message': 'No answer data available' }]);

  XLSX.utils.book_append_sheet(workbook, profileSheet, 'Student Profile');
  XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Assessment Results');
  XLSX.utils.book_append_sheet(workbook, subjectSheet, 'Subject Performance');
  XLSX.utils.book_append_sheet(workbook, answersSheet, 'Detailed Answers');

  // Download
  XLSX.writeFile(workbook, filename || defaultFilename);
}

/**
 * Export class summary to Excel (for admin)
 */
export function exportClassSummaryToExcel(
  filename: string = 'class-summary.xlsx'
): void {
  const allStudents = getStudents();
  const allResults = getAllResults();

  // Sheet 1: All Students Overview
  const studentsData = allStudents.map(student => {
    const studentResults = allResults.filter(r => r.studentId === student.id);
    const avgScore = studentResults.length > 0
      ? Math.round(studentResults.reduce((sum, r) => sum + r.percentage, 0) / studentResults.length)
      : 0;

    return {
      'Student ID': student.id,
      'Name': student.name,
      'Grade': student.grade,
      'School ID': student.schoolId,
      'Teacher ID': student.teacherId,
      'Total Assessments': studentResults.length,
      'Average Score (%)': avgScore,
    };
  });

  // Sheet 2: All Assessment Results
  const resultsData = allResults.map(result => ({
    'Result ID': result.id,
    'Student Name': result.studentName,
    'Student ID': result.studentId,
    'Assessment ID': result.assessmentId,
    'Subject': result.subject,
    'Grade': result.grade,
    'Percentage (%)': result.percentage,
    'Completed At': formatDate(result.completedAt),
  }));

  // Sheet 3: Grade-wise Summary
  const gradeMap = new Map<number, { grade: number; students: number; results: AssessmentResult[] }>();

  allStudents.forEach(student => {
    if (!gradeMap.has(student.grade)) {
      gradeMap.set(student.grade, {
        grade: student.grade,
        students: 0,
        results: [],
      });
    }
    gradeMap.get(student.grade)!.students++;
  });

  allResults.forEach(result => {
    if (gradeMap.has(result.grade)) {
      gradeMap.get(result.grade)!.results.push(result);
    }
  });

  const gradeData = Array.from(gradeMap.values()).map(data => {
    const avgScore = data.results.length > 0
      ? Math.round(data.results.reduce((sum, r) => sum + r.percentage, 0) / data.results.length)
      : 0;

    return {
      'Grade': data.grade,
      'Total Students': data.students,
      'Total Assessments': data.results.length,
      'Average Score (%)': avgScore,
      'Pass Rate (%)': data.results.length > 0
        ? Math.round((data.results.filter(r => r.percentage >= 60).length / data.results.length) * 100)
        : 0,
    };
  });

  // Create workbook
  const workbook = XLSX.utils.book_new();

  const studentsSheet = XLSX.utils.json_to_sheet(studentsData);
  const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
  const gradeSheet = XLSX.utils.json_to_sheet(gradeData);

  XLSX.utils.book_append_sheet(workbook, studentsSheet, 'All Students');
  XLSX.utils.book_append_sheet(workbook, resultsSheet, 'All Results');
  XLSX.utils.book_append_sheet(workbook, gradeSheet, 'Grade Summary');

  // Download
  XLSX.writeFile(workbook, filename);
}

/**
 * Export assessment item analysis to Excel
 */
export function exportItemAnalysisToExcel(
  assessmentId: string,
  assessmentTitle: string,
  filename?: string
): void {
  const { getAssessmentItemAnalysis } = require('./itemAnalysis');
  const analysis = getAssessmentItemAnalysis(assessmentId);

  if (!analysis) return;

  const defaultFilename = `${assessmentTitle.replace(/\s+/g, '-')}-item-analysis.xlsx`;

  // Sheet 1: Overview
  const overviewData = [{
    'Assessment ID': analysis.assessmentId,
    'Assessment Title': analysis.assessmentTitle,
    'Subject': analysis.subject,
    'Grade': analysis.grade,
    'Total Students': analysis.totalStudents,
    'Average Score (%)': analysis.averageScore,
    'Pass Rate (%)': analysis.passRate,
  }];

  // Sheet 2: Question Statistics
  const questionData = analysis.questionStats.map((q: any, index: number) => ({
    'Question #': index + 1,
    'Question Text': q.questionText.substring(0, 100) + (q.questionText.length > 100 ? '...' : ''),
    'Type': q.type,
    'Total Attempts': q.totalAttempts,
    'Correct Attempts': q.correctAttempts,
    'Incorrect Attempts': q.incorrectAttempts,
    'Correct %': q.correctPercentage,
    'Difficulty': q.difficulty,
    'Discrimination Index': q.discriminationIndex,
    'Average Points': q.averagePoints,
    'Max Points': q.maxPoints,
  }));

  // Create workbook
  const workbook = XLSX.utils.book_new();

  const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
  const questionSheet = XLSX.utils.json_to_sheet(questionData);

  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');
  XLSX.utils.book_append_sheet(workbook, questionSheet, 'Question Analysis');

  // Download
  XLSX.writeFile(workbook, filename || defaultFilename);
}
