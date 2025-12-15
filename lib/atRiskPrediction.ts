/**
 * Enhanced At-Risk Student Prediction
 * Proactively identifies students who are at risk of falling behind
 * Uses weighted scoring model based on multiple risk factors
 */

import { aiConfig, RiskLevel } from './aiConfig';
import { getResultsByStudent, getStudents, getAllResults, getStudentById } from './utils';
import { calculateTrend } from './teacherAnalytics';
import type { Student, AssessmentResult } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface RiskFactors {
  // Academic factors (60% weight)
  academicScore: number;           // Based on current average score
  trendScore: number;              // Based on performance trend
  failedAssessmentsScore: number;  // Number of failed assessments
  subjectWeaknessScore: number;    // Lowest subject score

  // Engagement factors (25% weight)
  engagementScore: number;         // Based on assessment participation
  frequencyScore: number;          // Days since last assessment
  completionScore: number;         // Incomplete assessments

  // Pattern factors (15% weight)
  consistencyScore: number;        // Consecutive low scores
  volatilityScore: number;         // Score variance
}

export interface RiskTrigger {
  factor: string;
  description: string;
  value: number | string;
  threshold: number | string;
  severity: 'critical' | 'warning' | 'info';
}

export interface RiskAssessment {
  studentId: string;
  studentName: string;
  grade: number;
  overallRiskScore: number;        // 0-100
  riskLevel: RiskLevel;
  riskFactors: RiskFactors;
  triggerFactors: RiskTrigger[];
  primaryConcerns: string[];
  recommendedActions: string[];
  trend: 'worsening' | 'stable' | 'improving';
  lastAssessmentDate: string;
  assessmentCount: number;
  lastUpdated: string;
}

export interface ClassRiskSummary {
  classId: string;
  totalStudents: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  highRiskStudents: RiskAssessment[];
  mediumRiskStudents: RiskAssessment[];
  commonRiskFactors: { factor: string; count: number }[];
  classRiskTrend: 'worsening' | 'stable' | 'improving';
  averageRiskScore: number;
  lastUpdated: string;
}

export interface RiskAlert {
  id: string;
  studentId: string;
  studentName: string;
  alertType: 'new_high_risk' | 'risk_increased' | 'declining_trend' | 'missed_assessments';
  severity: 'critical' | 'warning';
  message: string;
  riskScore: number;
  previousRiskScore?: number;
  createdAt: string;
  acknowledged: boolean;
}

export interface RiskHistoryEntry {
  date: string;
  riskScore: number;
  riskLevel: RiskLevel;
  triggerCount: number;
}

// ============================================================================
// Configuration
// ============================================================================

const { risk } = aiConfig;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Calculate individual risk factor scores (each returns 0-100)
 */
function calculateAcademicScore(averageScore: number): number {
  // Lower average score = higher risk
  if (averageScore >= 80) return 0;
  if (averageScore >= 70) return 20;
  if (averageScore >= 60) return 40;
  if (averageScore >= 50) return 60;
  if (averageScore >= 40) return 80;
  return 100;
}

function calculateTrendScore(trend: 'improving' | 'stable' | 'declining', scores: number[]): number {
  if (trend === 'improving') return 0;
  if (trend === 'stable') return 30;

  // For declining, calculate severity
  if (scores.length < 2) return 50;

  const recentScores = scores.slice(-3);
  const decline = recentScores[0] - recentScores[recentScores.length - 1];

  if (decline <= 5) return 50;
  if (decline <= 10) return 70;
  if (decline <= 15) return 85;
  return 100;
}

function calculateFailedAssessmentsScore(results: AssessmentResult[]): number {
  const failed = results.filter(r => r.percentage < 60).length;

  if (failed === 0) return 0;
  if (failed === 1) return 30;
  if (failed === 2) return 60;
  if (failed === 3) return 80;
  return 100;
}

function calculateSubjectWeaknessScore(subjectScores: Map<string, number>): number {
  if (subjectScores.size === 0) return 50;

  const lowestScore = Math.min(...subjectScores.values());

  if (lowestScore >= 70) return 0;
  if (lowestScore >= 60) return 30;
  if (lowestScore >= 50) return 50;
  if (lowestScore >= 40) return 70;
  return 100;
}

function calculateEngagementScore(
  totalAssessments: number,
  expectedAssessments: number
): number {
  if (expectedAssessments === 0) return 50;

  const rate = totalAssessments / expectedAssessments;

  if (rate >= 1.0) return 0;
  if (rate >= 0.8) return 20;
  if (rate >= 0.6) return 40;
  if (rate >= 0.4) return 60;
  if (rate >= 0.2) return 80;
  return 100;
}

function calculateFrequencyScore(daysSinceLastAssessment: number): number {
  const threshold = risk.factorThresholds.daysSinceAssessmentThreshold;

  if (daysSinceLastAssessment <= 7) return 0;
  if (daysSinceLastAssessment <= 14) return 30;
  if (daysSinceLastAssessment <= 21) return 50;
  if (daysSinceLastAssessment <= 30) return 70;
  return 100;
}

function calculateCompletionScore(incompleteCount: number): number {
  if (incompleteCount === 0) return 0;
  if (incompleteCount === 1) return 40;
  if (incompleteCount === 2) return 70;
  return 100;
}

function calculateConsistencyScore(scores: number[]): number {
  if (scores.length < 3) return 0;

  // Count consecutive low scores
  const threshold = risk.factorThresholds.lowScore;
  let consecutiveLow = 0;
  let maxConsecutive = 0;

  for (let i = scores.length - 1; i >= 0; i--) {
    if (scores[i] < threshold) {
      consecutiveLow++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveLow);
    } else {
      break;
    }
  }

  if (maxConsecutive === 0) return 0;
  if (maxConsecutive === 1) return 30;
  if (maxConsecutive === 2) return 60;
  if (maxConsecutive === 3) return 80;
  return 100;
}

function calculateVolatilityScore(scores: number[]): number {
  if (scores.length < 3) return 0;

  // Calculate standard deviation
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
  const stdDev = Math.sqrt(squaredDiffs.reduce((sum, d) => sum + d, 0) / scores.length);

  if (stdDev <= 5) return 0;
  if (stdDev <= 10) return 30;
  if (stdDev <= 15) return 50;
  if (stdDev <= 20) return 70;
  return 100;
}

/**
 * Calculate overall risk score using weighted factors
 */
function calculateOverallRiskScore(factors: RiskFactors): number {
  const { weights } = risk;

  const score =
    factors.academicScore * weights.currentScore +
    factors.trendScore * weights.scoreTrend +
    factors.failedAssessmentsScore * weights.failedAssessments +
    factors.subjectWeaknessScore * weights.lowestSubjectScore +
    factors.engagementScore * weights.missedAssessments +
    factors.frequencyScore * weights.assessmentFrequency +
    factors.completionScore * weights.incompleteAssessments +
    factors.consistencyScore * weights.consecutiveLowScores +
    factors.volatilityScore * weights.volatility;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Determine risk level from score
 */
function determineRiskLevel(score: number): RiskLevel {
  if (score >= risk.highRiskThreshold) return 'high';
  if (score >= risk.mediumRiskThreshold) return 'medium';
  return 'low';
}

/**
 * Identify risk triggers (factors exceeding thresholds)
 */
function identifyTriggers(
  factors: RiskFactors,
  averageScore: number,
  trend: string,
  daysSince: number,
  consecutiveLow: number
): RiskTrigger[] {
  const triggers: RiskTrigger[] = [];

  if (factors.academicScore >= 60) {
    triggers.push({
      factor: 'Low Academic Score',
      description: 'Overall performance is below expected level',
      value: averageScore,
      threshold: '60%',
      severity: averageScore < 40 ? 'critical' : 'warning',
    });
  }

  if (factors.trendScore >= 50) {
    triggers.push({
      factor: 'Declining Performance',
      description: 'Performance trend is declining',
      value: trend,
      threshold: 'stable or improving',
      severity: factors.trendScore >= 80 ? 'critical' : 'warning',
    });
  }

  if (factors.failedAssessmentsScore >= 60) {
    triggers.push({
      factor: 'Multiple Failed Assessments',
      description: 'Has failed multiple assessments',
      value: Math.round(factors.failedAssessmentsScore / 30),
      threshold: '0-1',
      severity: factors.failedAssessmentsScore >= 80 ? 'critical' : 'warning',
    });
  }

  if (factors.frequencyScore >= 50) {
    triggers.push({
      factor: 'Assessment Gap',
      description: 'Long time since last assessment',
      value: `${daysSince} days`,
      threshold: '14 days',
      severity: daysSince > 30 ? 'critical' : 'warning',
    });
  }

  if (factors.consistencyScore >= 60) {
    triggers.push({
      factor: 'Consecutive Low Scores',
      description: 'Multiple consecutive low scores',
      value: consecutiveLow,
      threshold: '0-1',
      severity: consecutiveLow >= 3 ? 'critical' : 'warning',
    });
  }

  if (factors.volatilityScore >= 50) {
    triggers.push({
      factor: 'Inconsistent Performance',
      description: 'High variability in scores',
      value: 'High variance',
      threshold: 'Low variance',
      severity: 'info',
    });
  }

  return triggers;
}

/**
 * Generate primary concerns from triggers
 */
function generatePrimaryConcerns(triggers: RiskTrigger[]): string[] {
  return triggers
    .filter(t => t.severity === 'critical' || t.severity === 'warning')
    .map(t => t.description);
}

/**
 * Generate recommended actions based on risk factors
 */
function generateRecommendedActions(factors: RiskFactors, riskLevel: RiskLevel): string[] {
  const actions: string[] = [];

  if (riskLevel === 'high') {
    actions.push('Schedule immediate one-on-one meeting with student');
    actions.push('Contact parent/guardian to discuss concerns');
    actions.push('Create individualized support plan');
  }

  if (factors.academicScore >= 60) {
    actions.push('Provide additional practice materials');
    actions.push('Consider peer tutoring or small group instruction');
  }

  if (factors.trendScore >= 50) {
    actions.push('Identify recent changes affecting performance');
    actions.push('Increase frequency of formative assessments');
  }

  if (factors.frequencyScore >= 50) {
    actions.push('Check on student attendance and engagement');
    actions.push('Schedule make-up assessments');
  }

  if (factors.consistencyScore >= 60) {
    actions.push('Review foundational skills');
    actions.push('Implement daily check-ins');
  }

  if (factors.volatilityScore >= 50) {
    actions.push('Establish consistent study routine');
    actions.push('Monitor for external factors affecting performance');
  }

  // Ensure at least one action
  if (actions.length === 0) {
    actions.push('Continue monitoring student progress');
  }

  return actions.slice(0, 5); // Limit to 5 actions
}

/**
 * Calculate student risk assessment
 */
export function calculateStudentRisk(studentId: string): RiskAssessment | null {
  const student = getStudentById(studentId);
  if (!student) return null;

  const results = getResultsByStudent(studentId);
  if (results.length === 0) return null;

  const scores = results.map(r => r.percentage);
  const averageScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  const trend = calculateTrend(scores);

  // Calculate subject scores
  const subjectScores = new Map<string, number>();
  const subjectCounts = new Map<string, { sum: number; count: number }>();

  results.forEach(r => {
    const existing = subjectCounts.get(r.subject) || { sum: 0, count: 0 };
    subjectCounts.set(r.subject, {
      sum: existing.sum + r.percentage,
      count: existing.count + 1,
    });
  });

  subjectCounts.forEach((value, key) => {
    subjectScores.set(key, Math.round(value.sum / value.count));
  });

  // Calculate days since last assessment
  const lastResult = results[results.length - 1];
  const daysSince = Math.floor(
    (Date.now() - new Date(lastResult.completedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Count consecutive low scores
  let consecutiveLow = 0;
  for (let i = scores.length - 1; i >= 0; i--) {
    if (scores[i] < risk.factorThresholds.lowScore) {
      consecutiveLow++;
    } else {
      break;
    }
  }

  // Calculate all risk factors
  const factors: RiskFactors = {
    academicScore: calculateAcademicScore(averageScore),
    trendScore: calculateTrendScore(trend, scores),
    failedAssessmentsScore: calculateFailedAssessmentsScore(results),
    subjectWeaknessScore: calculateSubjectWeaknessScore(subjectScores),
    engagementScore: calculateEngagementScore(results.length, 5), // Assume 5 expected
    frequencyScore: calculateFrequencyScore(daysSince),
    completionScore: calculateCompletionScore(0), // TODO: Track incomplete assessments
    consistencyScore: calculateConsistencyScore(scores),
    volatilityScore: calculateVolatilityScore(scores),
  };

  const overallRiskScore = calculateOverallRiskScore(factors);
  const riskLevel = determineRiskLevel(overallRiskScore);
  const triggers = identifyTriggers(factors, averageScore, trend, daysSince, consecutiveLow);

  // Determine risk trend
  let riskTrend: 'worsening' | 'stable' | 'improving' = 'stable';
  if (trend === 'declining') riskTrend = 'worsening';
  if (trend === 'improving') riskTrend = 'improving';

  return {
    studentId,
    studentName: student.name,
    grade: student.grade,
    overallRiskScore,
    riskLevel,
    riskFactors: factors,
    triggerFactors: triggers,
    primaryConcerns: generatePrimaryConcerns(triggers),
    recommendedActions: generateRecommendedActions(factors, riskLevel),
    trend: riskTrend,
    lastAssessmentDate: lastResult.completedAt,
    assessmentCount: results.length,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Calculate class-wide risk summary
 */
export function calculateClassRisk(teacherId: string): ClassRiskSummary {
  const students = getStudents().filter(s => s.teacherId === teacherId);
  const assessments: RiskAssessment[] = [];

  students.forEach(student => {
    const assessment = calculateStudentRisk(student.id);
    if (assessment) assessments.push(assessment);
  });

  const highRisk = assessments.filter(a => a.riskLevel === 'high');
  const mediumRisk = assessments.filter(a => a.riskLevel === 'medium');
  const lowRisk = assessments.filter(a => a.riskLevel === 'low');

  // Find common risk factors
  const factorCounts = new Map<string, number>();
  assessments.forEach(a => {
    a.triggerFactors.forEach(t => {
      const count = factorCounts.get(t.factor) || 0;
      factorCounts.set(t.factor, count + 1);
    });
  });

  const commonFactors = Array.from(factorCounts.entries())
    .map(([factor, count]) => ({ factor, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate average risk score
  const avgRisk = assessments.length > 0
    ? Math.round(assessments.reduce((sum, a) => sum + a.overallRiskScore, 0) / assessments.length)
    : 0;

  // Determine class trend
  const worseningCount = assessments.filter(a => a.trend === 'worsening').length;
  const improvingCount = assessments.filter(a => a.trend === 'improving').length;

  let classTrend: 'worsening' | 'stable' | 'improving' = 'stable';
  if (worseningCount > improvingCount + 2) classTrend = 'worsening';
  if (improvingCount > worseningCount + 2) classTrend = 'improving';

  return {
    classId: teacherId,
    totalStudents: students.length,
    highRiskCount: highRisk.length,
    mediumRiskCount: mediumRisk.length,
    lowRiskCount: lowRisk.length,
    highRiskStudents: highRisk.sort((a, b) => b.overallRiskScore - a.overallRiskScore),
    mediumRiskStudents: mediumRisk.sort((a, b) => b.overallRiskScore - a.overallRiskScore),
    commonRiskFactors: commonFactors,
    classRiskTrend: classTrend,
    averageRiskScore: avgRisk,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Generate risk alerts for students with significant changes
 */
export function generateRiskAlerts(
  teacherId: string,
  previousAssessments?: Map<string, RiskAssessment>
): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  const students = getStudents().filter(s => s.teacherId === teacherId);

  students.forEach(student => {
    const current = calculateStudentRisk(student.id);
    if (!current) return;

    const previous = previousAssessments?.get(student.id);

    // Alert for new high-risk students
    if (current.riskLevel === 'high' && (!previous || previous.riskLevel !== 'high')) {
      alerts.push({
        id: `alert-${student.id}-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        alertType: 'new_high_risk',
        severity: 'critical',
        message: `${student.name} is now at HIGH RISK with a risk score of ${current.overallRiskScore}`,
        riskScore: current.overallRiskScore,
        previousRiskScore: previous?.overallRiskScore,
        createdAt: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // Alert for significant risk increase (>20 points)
    if (previous && current.overallRiskScore - previous.overallRiskScore >= 20) {
      alerts.push({
        id: `alert-${student.id}-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        alertType: 'risk_increased',
        severity: 'warning',
        message: `${student.name}'s risk score increased by ${current.overallRiskScore - previous.overallRiskScore} points`,
        riskScore: current.overallRiskScore,
        previousRiskScore: previous.overallRiskScore,
        createdAt: new Date().toISOString(),
        acknowledged: false,
      });
    }

    // Alert for declining trend
    if (current.trend === 'worsening' && previous?.trend !== 'worsening') {
      alerts.push({
        id: `alert-${student.id}-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        alertType: 'declining_trend',
        severity: 'warning',
        message: `${student.name} is showing a declining performance trend`,
        riskScore: current.overallRiskScore,
        createdAt: new Date().toISOString(),
        acknowledged: false,
      });
    }
  });

  return alerts.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
    return b.riskScore - a.riskScore;
  });
}

/**
 * Get students sorted by risk level
 */
export function getStudentsByRiskLevel(teacherId: string): {
  high: RiskAssessment[];
  medium: RiskAssessment[];
  low: RiskAssessment[];
} {
  const summary = calculateClassRisk(teacherId);

  return {
    high: summary.highRiskStudents,
    medium: summary.mediumRiskStudents,
    low: [], // Low risk students are not typically needed in detail
  };
}

/**
 * Get risk history for a student (requires stored data)
 */
export function getRiskHistory(studentId: string): RiskHistoryEntry[] {
  // In a real implementation, this would pull from stored history
  // For now, return current state as single entry
  const current = calculateStudentRisk(studentId);
  if (!current) return [];

  return [{
    date: current.lastUpdated,
    riskScore: current.overallRiskScore,
    riskLevel: current.riskLevel,
    triggerCount: current.triggerFactors.length,
  }];
}

// ============================================================================
// Storage Functions
// ============================================================================

const RISK_ALERTS_KEY = 'riskAlerts';
const RISK_HISTORY_KEY = 'riskHistory';

/**
 * Save risk alerts to localStorage
 */
export function saveRiskAlerts(alerts: RiskAlert[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RISK_ALERTS_KEY, JSON.stringify(alerts));
}

/**
 * Get stored risk alerts
 */
export function getStoredRiskAlerts(): RiskAlert[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(RISK_ALERTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Acknowledge a risk alert
 */
export function acknowledgeAlert(alertId: string): void {
  const alerts = getStoredRiskAlerts();
  const index = alerts.findIndex(a => a.id === alertId);

  if (index >= 0) {
    alerts[index].acknowledged = true;
    saveRiskAlerts(alerts);
  }
}

/**
 * Get unacknowledged alerts count
 */
export function getUnacknowledgedAlertCount(): number {
  const alerts = getStoredRiskAlerts();
  return alerts.filter(a => !a.acknowledged).length;
}
