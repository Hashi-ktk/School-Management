import {
  getStudentById,
  getResultsByStudent,
  getAllResults,
  getStudents,
  formatDate,
  getAssessmentById
} from "./utils";
import {
  getStudentAnalytics,
  getTeacherStudentAnalytics,
  getPerformanceDistribution,
  getAtRiskStudents,
  calculatePerformanceTier
} from "./teacherAnalytics";
import type {
  Student,
  AssessmentResult,
  StudentAnalytics,
  PerformanceDistribution
} from "@/types";

/**
 * Individual Student Progress Report Data
 */
export interface StudentProgressReportData {
  student: Student;
  analytics: StudentAnalytics;
  performanceHistory: AssessmentResult[];
  subjectPerformance: SubjectPerformance[];
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  generatedAt: string;
  generatedFor: string; // e.g., "Parent-Teacher Meeting"
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number;
  totalAssessments: number;
  highestScore: number;
  lowestScore: number;
  trend: 'improving' | 'stable' | 'declining';
  passRate: number;
}

/**
 * Class Summary Report Data
 */
export interface ClassSummaryReportData {
  teacher: {
    id: string;
    name: string;
  };
  classInfo: {
    totalStudents: number;
    grade?: number;
    subjects: string[];
  };
  overallStatistics: {
    averageScore: number;
    totalAssessments: number;
    completionRate: number;
    passRate: number;
  };
  performanceDistribution: PerformanceDistribution[];
  subjectBreakdown: SubjectBreakdown[];
  atRiskStudents: StudentAnalytics[];
  topPerformers: StudentAnalytics[];
  recentActivity: AssessmentResult[];
  generatedAt: string;
}

export interface SubjectBreakdown {
  subject: string;
  averageScore: number;
  totalAttempts: number;
  passRate: number;
  studentsAssessed: number;
}

/**
 * Generate Individual Student Progress Report Data
 */
export function generateStudentProgressReport(
  studentId: string,
  generatedFor: string = "Parent-Teacher Meeting"
): StudentProgressReportData | null {
  const student = getStudentById(studentId);
  if (!student) return null;

  const analytics = getStudentAnalytics(studentId);
  if (!analytics) return null;

  const performanceHistory = getResultsByStudent(studentId);

  // Calculate subject-wise performance
  const subjectMap = new Map<string, AssessmentResult[]>();
  performanceHistory.forEach(result => {
    const subject = result.subject;
    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, []);
    }
    subjectMap.get(subject)!.push(result);
  });

  const subjectPerformance: SubjectPerformance[] = Array.from(subjectMap.entries()).map(([subject, results]) => {
    const scores = results.map(r => r.percentage);
    const averageScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passRate = Math.round((results.filter(r => r.percentage >= 60).length / results.length) * 100);

    // Calculate trend for this subject
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (scores.length >= 2) {
      const recentScores = scores.slice(-3);
      const first = recentScores[0];
      const last = recentScores[recentScores.length - 1];
      const diff = last - first;
      if (diff >= 5) trend = 'improving';
      else if (diff <= -5) trend = 'declining';
    }

    return {
      subject,
      averageScore,
      totalAssessments: results.length,
      highestScore,
      lowestScore,
      trend,
      passRate,
    };
  });

  // Identify strengths and areas for improvement
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];

  subjectPerformance.forEach(sp => {
    if (sp.averageScore >= 80) {
      strengths.push(`Excelling in ${sp.subject} with ${sp.averageScore}% average`);
    } else if (sp.averageScore < 60) {
      areasForImprovement.push(`Needs support in ${sp.subject} (${sp.averageScore}% average)`);
    }

    if (sp.trend === 'improving') {
      strengths.push(`Showing improvement in ${sp.subject}`);
    } else if (sp.trend === 'declining') {
      areasForImprovement.push(`Recent decline in ${sp.subject} performance`);
    }
  });

  // General strengths based on overall performance
  if (analytics.performanceTier === 'Proficient') {
    strengths.push('Consistently performs above grade level');
  }
  if (analytics.trend === 'improving') {
    strengths.push('Demonstrates consistent improvement over time');
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (analytics.performanceTier === 'Needs Support') {
    recommendations.push('Consider one-on-one tutoring sessions');
    recommendations.push('Provide additional practice materials');
    recommendations.push('Set up regular parent-teacher check-ins');
  } else if (analytics.performanceTier === 'Developing') {
    recommendations.push('Continue current support strategies');
    recommendations.push('Encourage peer learning opportunities');
  } else {
    recommendations.push('Provide enrichment activities and challenges');
    recommendations.push('Consider leadership roles in group activities');
  }

  // Subject-specific recommendations
  subjectPerformance.forEach(sp => {
    if (sp.averageScore < 60) {
      recommendations.push(`Focus on ${sp.subject} fundamentals through targeted exercises`);
    }
  });

  return {
    student,
    analytics,
    performanceHistory,
    subjectPerformance,
    strengths: strengths.length > 0 ? strengths : ['Steady performance in assessments'],
    areasForImprovement: areasForImprovement.length > 0 ? areasForImprovement : ['Maintain current performance level'],
    recommendations,
    generatedAt: new Date().toISOString(),
    generatedFor,
  };
}

/**
 * Generate Class Summary Report Data
 */
export function generateClassSummaryReport(
  teacherId: string,
  teacherName: string
): ClassSummaryReportData | null {
  const students = getStudents().filter(s => s.teacherId === teacherId);
  if (students.length === 0) return null;

  const allAnalytics = getTeacherStudentAnalytics(teacherId);
  const allResults = getAllResults().filter(r =>
    students.some(s => s.id === r.studentId)
  );

  // Overall statistics
  const averageScore = allAnalytics.length > 0
    ? Math.round(allAnalytics.reduce((sum, a) => sum + a.averageScore, 0) / allAnalytics.length)
    : 0;

  const totalAssessments = allResults.length;

  const completionRate = students.length > 0
    ? Math.round((allAnalytics.filter(a => a.totalAssessments > 0).length / students.length) * 100)
    : 0;

  const passRate = allResults.length > 0
    ? Math.round((allResults.filter(r => r.percentage >= 60).length / allResults.length) * 100)
    : 0;

  // Performance distribution
  const performanceDistribution = getPerformanceDistribution(teacherId);

  // Subject breakdown
  const subjectMap = new Map<string, AssessmentResult[]>();
  allResults.forEach(result => {
    if (!subjectMap.has(result.subject)) {
      subjectMap.set(result.subject, []);
    }
    subjectMap.get(result.subject)!.push(result);
  });

  const subjectBreakdown: SubjectBreakdown[] = Array.from(subjectMap.entries()).map(([subject, results]) => {
    const scores = results.map(r => r.percentage);
    const averageScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    const passRate = Math.round((results.filter(r => r.percentage >= 60).length / results.length) * 100);
    const uniqueStudents = new Set(results.map(r => r.studentId)).size;

    return {
      subject,
      averageScore,
      totalAttempts: results.length,
      passRate,
      studentsAssessed: uniqueStudents,
    };
  });

  // At-risk students
  const atRiskStudents = getAtRiskStudents(teacherId);

  // Top performers (Proficient tier)
  const topPerformers = allAnalytics
    .filter(a => a.performanceTier === 'Proficient')
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5);

  // Recent activity (last 10 results)
  const recentActivity = [...allResults]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 10);

  // Determine subjects taught
  const subjects = Array.from(new Set(students.flatMap(s => s.subjects)));

  // Determine common grade (if all students are same grade)
  const grades = Array.from(new Set(students.map(s => s.grade)));
  const grade = grades.length === 1 ? grades[0] : undefined;

  return {
    teacher: {
      id: teacherId,
      name: teacherName,
    },
    classInfo: {
      totalStudents: students.length,
      grade,
      subjects,
    },
    overallStatistics: {
      averageScore,
      totalAssessments,
      completionRate,
      passRate,
    },
    performanceDistribution,
    subjectBreakdown,
    atRiskStudents,
    topPerformers,
    recentActivity,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate Report Card Data (Parent-Friendly)
 */
export interface ReportCardData {
  student: Student;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  overallGrade: string; // A, B, C, D, F
  overallPercentage: number;
  performanceTier: string;
  subjectGrades: SubjectGrade[];
  teacherComments: string;
  nextSteps: string[];
  attendance?: {
    present: number;
    total: number;
    percentage: number;
  };
  generatedAt: string;
}

export interface SubjectGrade {
  subject: string;
  grade: string; // A, B, C, D, F
  percentage: number;
  comments: string;
}

/**
 * Convert percentage to letter grade
 */
function percentageToGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Generate Report Card
 */
export function generateReportCard(
  studentId: string,
  startDate?: string,
  endDate?: string
): ReportCardData | null {
  const student = getStudentById(studentId);
  if (!student) return null;

  const analytics = getStudentAnalytics(studentId);
  if (!analytics) return null;

  let results = getResultsByStudent(studentId);

  // Filter by date range if provided
  if (startDate) {
    results = results.filter(r => new Date(r.completedAt) >= new Date(startDate));
  }
  if (endDate) {
    results = results.filter(r => new Date(r.completedAt) <= new Date(endDate));
  }

  if (results.length === 0) return null;

  // Calculate overall percentage
  const overallPercentage = Math.round(
    results.reduce((sum, r) => sum + r.percentage, 0) / results.length
  );

  const overallGrade = percentageToGrade(overallPercentage);
  const performanceTier = calculatePerformanceTier(overallPercentage);

  // Subject grades
  const subjectMap = new Map<string, AssessmentResult[]>();
  results.forEach(result => {
    if (!subjectMap.has(result.subject)) {
      subjectMap.set(result.subject, []);
    }
    subjectMap.get(result.subject)!.push(result);
  });

  const subjectGrades: SubjectGrade[] = Array.from(subjectMap.entries()).map(([subject, subjectResults]) => {
    const scores = subjectResults.map(r => r.percentage);
    const avgPercentage = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    const grade = percentageToGrade(avgPercentage);

    let comments = '';
    if (avgPercentage >= 90) {
      comments = 'Excellent work! Shows strong understanding.';
    } else if (avgPercentage >= 80) {
      comments = 'Very good performance. Keep up the great work!';
    } else if (avgPercentage >= 70) {
      comments = 'Good progress. Continue practicing.';
    } else if (avgPercentage >= 60) {
      comments = 'Satisfactory. Additional practice recommended.';
    } else {
      comments = 'Needs improvement. Extra support required.';
    }

    return {
      subject,
      grade,
      percentage: avgPercentage,
      comments,
    };
  });

  // Teacher comments
  let teacherComments = '';
  if (performanceTier === 'Proficient') {
    teacherComments = `${student.name} is performing exceptionally well and demonstrates strong understanding across all subjects. Continue to challenge ${student.name} with enrichment activities.`;
  } else if (performanceTier === 'Developing') {
    teacherComments = `${student.name} is making good progress and shows steady improvement. With continued effort, ${student.name} will reach proficiency.`;
  } else {
    teacherComments = `${student.name} needs additional support to reach grade-level expectations. Regular practice and one-on-one attention will help improve performance.`;
  }

  // Next steps
  const nextSteps: string[] = [];
  if (performanceTier === 'Proficient') {
    nextSteps.push('Continue current learning pace');
    nextSteps.push('Explore advanced topics and enrichment activities');
    nextSteps.push('Consider peer tutoring opportunities');
  } else if (performanceTier === 'Developing') {
    nextSteps.push('Maintain regular study schedule');
    nextSteps.push('Practice problem-solving independently');
    nextSteps.push('Seek clarification when needed');
  } else {
    nextSteps.push('Schedule additional tutoring sessions');
    nextSteps.push('Complete extra practice exercises at home');
    nextSteps.push('Attend after-school support programs');
    nextSteps.push('Regular parent-teacher communication');
  }

  return {
    student,
    reportPeriod: {
      startDate: startDate || results[0].completedAt,
      endDate: endDate || results[results.length - 1].completedAt,
    },
    overallGrade,
    overallPercentage,
    performanceTier,
    subjectGrades,
    teacherComments,
    nextSteps,
    generatedAt: new Date().toISOString(),
  };
}
