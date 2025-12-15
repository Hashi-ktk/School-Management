import {
  getResultsByStudent,
  getStudents
} from "./utils";
import type {
  StudentAnalytics,
  PerformanceTier,
  PerformanceDistribution,
  Student,
  AssessmentResult
} from "@/types";

/**
 * Calculate performance tier based on average score
 */
export function calculatePerformanceTier(averageScore: number): PerformanceTier {
  if (averageScore >= 80) return 'Proficient';
  if (averageScore >= 60) return 'Developing';
  return 'Needs Support';
}

/**
 * Calculate trend based on last 3 assessments
 * Returns 'improving' if last score > first score by 5%+
 * Returns 'declining' if last score < first score by 5%+
 * Otherwise 'stable'
 */
export function calculateTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
  if (scores.length < 2) return 'stable';

  const recentScores = scores.slice(-3); // Last 3
  if (recentScores.length < 2) return 'stable';

  const first = recentScores[0];
  const last = recentScores[recentScores.length - 1];
  const diff = last - first;

  if (diff >= 5) return 'improving';
  if (diff <= -5) return 'declining';
  return 'stable';
}

/**
 * Get comprehensive analytics for a single student
 */
export function getStudentAnalytics(studentId: string): StudentAnalytics | null {
  const results = getResultsByStudent(studentId);
  if (!results.length) return null;

  const scores = results.map(r => r.percentage);
  const averageScore = Math.round(
    scores.reduce((sum, score) => sum + score, 0) / scores.length
  );

  const recentScores = scores.slice(-3);
  const trend = calculateTrend(scores);
  const tier = calculatePerformanceTier(averageScore);
  const isAtRisk = averageScore < 60;

  const lastResult = results[results.length - 1];

  return {
    studentId,
    studentName: lastResult.studentName,
    averageScore,
    performanceTier: tier,
    trend,
    isAtRisk,
    totalAssessments: results.length,
    recentScores,
    lastAssessmentDate: lastResult.completedAt,
  };
}

/**
 * Get analytics for all students of a teacher
 */
export function getTeacherStudentAnalytics(teacherId: string): StudentAnalytics[] {
  const students = getStudents().filter(s => s.teacherId === teacherId);

  return students
    .map(s => getStudentAnalytics(s.id))
    .filter((a): a is StudentAnalytics => a !== null)
    .sort((a, b) => a.averageScore - b.averageScore); // At-risk students first
}

/**
 * Get at-risk students (average < 60%)
 */
export function getAtRiskStudents(teacherId: string): StudentAnalytics[] {
  const analytics = getTeacherStudentAnalytics(teacherId);
  return analytics.filter(a => a.isAtRisk);
}

/**
 * Calculate performance distribution for chart visualization
 */
export function getPerformanceDistribution(teacherId: string): PerformanceDistribution[] {
  const analytics = getTeacherStudentAnalytics(teacherId);
  const total = analytics.length;

  if (total === 0) {
    return [
      { tier: 'Proficient', count: 0, percentage: 0, color: '#00ff88', icon: '🌟' },
      { tier: 'Developing', count: 0, percentage: 0, color: '#ffd060', icon: '📈' },
      { tier: 'Needs Support', count: 0, percentage: 0, color: '#ff6b6b', icon: '🎯' },
    ];
  }

  const proficient = analytics.filter(a => a.performanceTier === 'Proficient').length;
  const developing = analytics.filter(a => a.performanceTier === 'Developing').length;
  const needsSupport = analytics.filter(a => a.performanceTier === 'Needs Support').length;

  return [
    {
      tier: 'Proficient',
      count: proficient,
      percentage: Math.round((proficient / total) * 100),
      color: '#00ff88',
      icon: '🌟',
    },
    {
      tier: 'Developing',
      count: developing,
      percentage: Math.round((developing / total) * 100),
      color: '#ffd060',
      icon: '📈',
    },
    {
      tier: 'Needs Support',
      count: needsSupport,
      percentage: Math.round((needsSupport / total) * 100),
      color: '#ff6b6b',
      icon: '🎯',
    },
  ];
}

/**
 * Get grouped students by performance tier
 */
export function getGroupedStudents(teacherId: string): Record<PerformanceTier, StudentAnalytics[]> {
  const analytics = getTeacherStudentAnalytics(teacherId);

  return {
    'Proficient': analytics.filter(a => a.performanceTier === 'Proficient'),
    'Developing': analytics.filter(a => a.performanceTier === 'Developing'),
    'Needs Support': analytics.filter(a => a.performanceTier === 'Needs Support'),
  };
}
