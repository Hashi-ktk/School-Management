import { getAllResults, getResultsByAssessment, getAssessmentById } from "./utils";
import type { AssessmentResult, Question, Assessment } from "@/types";

/**
 * Question performance statistics
 */
export interface QuestionStats {
  questionId: string;
  questionText: string;
  type: string;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  correctPercentage: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  discriminationIndex: number; // Ranges from -1 to 1
  averagePoints: number;
  maxPoints: number;
}

/**
 * Assessment item analysis summary
 */
export interface AssessmentItemAnalysis {
  assessmentId: string;
  assessmentTitle: string;
  subject: string;
  grade: number;
  totalStudents: number;
  questionStats: QuestionStats[];
  averageScore: number;
  passRate: number;
}

/**
 * Calculate difficulty level based on correct percentage
 */
function calculateDifficulty(correctPercentage: number): 'Easy' | 'Medium' | 'Hard' {
  if (correctPercentage >= 70) return 'Easy';
  if (correctPercentage >= 40) return 'Medium';
  return 'Hard';
}

/**
 * Calculate discrimination index
 * Measures how well a question differentiates between high and low performers
 * Higher values (closer to 1) indicate better discrimination
 */
function calculateDiscriminationIndex(
  results: AssessmentResult[],
  questionId: string
): number {
  if (results.length < 4) return 0;

  // Sort by total score (descending)
  const sortedResults = [...results].sort((a, b) => b.percentage - a.percentage);

  // Top 27% and bottom 27% (standard practice)
  const groupSize = Math.ceil(results.length * 0.27);
  const topGroup = sortedResults.slice(0, groupSize);
  const bottomGroup = sortedResults.slice(-groupSize);

  // Count correct answers in each group
  const topCorrect = topGroup.filter(r =>
    r.answers.find(a => a.questionId === questionId)?.isCorrect
  ).length;

  const bottomCorrect = bottomGroup.filter(r =>
    r.answers.find(a => a.questionId === questionId)?.isCorrect
  ).length;

  // Calculate discrimination index
  const discriminationIndex = (topCorrect - bottomCorrect) / groupSize;

  return Math.round(discriminationIndex * 100) / 100;
}

/**
 * Get statistics for a specific question
 */
export function getQuestionStats(
  assessmentId: string,
  questionId: string,
  question: Question
): QuestionStats {
  const results = getResultsByAssessment(assessmentId);

  const attempts = results.map(r => r.answers.find(a => a.questionId === questionId)).filter(Boolean);
  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter(a => a!.isCorrect).length;
  const incorrectAttempts = totalAttempts - correctAttempts;
  const correctPercentage = totalAttempts > 0
    ? Math.round((correctAttempts / totalAttempts) * 100)
    : 0;

  const averagePoints = totalAttempts > 0
    ? Math.round((attempts.reduce((sum, a) => sum + (a?.points || 0), 0) / totalAttempts) * 10) / 10
    : 0;

  const discriminationIndex = calculateDiscriminationIndex(results, questionId);
  const difficulty = calculateDifficulty(correctPercentage);

  return {
    questionId,
    questionText: question.question,
    type: question.type,
    totalAttempts,
    correctAttempts,
    incorrectAttempts,
    correctPercentage,
    difficulty,
    discriminationIndex,
    averagePoints,
    maxPoints: question.points,
  };
}

/**
 * Get complete item analysis for an assessment
 */
export function getAssessmentItemAnalysis(assessmentId: string): AssessmentItemAnalysis | null {
  const assessment = getAssessmentById(assessmentId);
  if (!assessment) return null;

  const results = getResultsByAssessment(assessmentId);
  if (results.length === 0) {
    return {
      assessmentId,
      assessmentTitle: assessment.title,
      subject: assessment.subject,
      grade: assessment.grade,
      totalStudents: 0,
      questionStats: [],
      averageScore: 0,
      passRate: 0,
    };
  }

  const questionStats = assessment.questions.map(q =>
    getQuestionStats(assessmentId, q.id, q)
  );

  const averageScore = Math.round(
    results.reduce((sum, r) => sum + r.percentage, 0) / results.length
  );

  const passRate = Math.round(
    (results.filter(r => r.percentage >= 60).length / results.length) * 100
  );

  return {
    assessmentId,
    assessmentTitle: assessment.title,
    subject: assessment.subject,
    grade: assessment.grade,
    totalStudents: results.length,
    questionStats,
    averageScore,
    passRate,
  };
}

/**
 * Get problematic questions (those that most students struggle with)
 */
export function getProblematicQuestions(assessmentId: string, threshold: number = 40): QuestionStats[] {
  const analysis = getAssessmentItemAnalysis(assessmentId);
  if (!analysis) return [];

  return analysis.questionStats
    .filter(q => q.correctPercentage < threshold)
    .sort((a, b) => a.correctPercentage - b.correctPercentage);
}

/**
 * Get questions with poor discrimination (don't differentiate high/low performers)
 */
export function getPoorDiscriminationQuestions(assessmentId: string, threshold: number = 0.2): QuestionStats[] {
  const analysis = getAssessmentItemAnalysis(assessmentId);
  if (!analysis) return [];

  return analysis.questionStats
    .filter(q => q.discriminationIndex < threshold)
    .sort((a, b) => a.discriminationIndex - b.discriminationIndex);
}

/**
 * Get overall assessment quality metrics
 */
export interface AssessmentQualityMetrics {
  assessmentId: string;
  totalQuestions: number;
  easyQuestions: number;
  mediumQuestions: number;
  hardQuestions: number;
  averageDiscrimination: number;
  problematicQuestions: number;
  qualityScore: number; // 0-100
  recommendations: string[];
}

export function getAssessmentQualityMetrics(assessmentId: string): AssessmentQualityMetrics | null {
  const analysis = getAssessmentItemAnalysis(assessmentId);
  if (!analysis || analysis.questionStats.length === 0) return null;

  const easyQuestions = analysis.questionStats.filter(q => q.difficulty === 'Easy').length;
  const mediumQuestions = analysis.questionStats.filter(q => q.difficulty === 'Medium').length;
  const hardQuestions = analysis.questionStats.filter(q => q.difficulty === 'Hard').length;

  const averageDiscrimination = analysis.questionStats.reduce((sum, q) => sum + q.discriminationIndex, 0) / analysis.questionStats.length;

  const problematicQuestions = analysis.questionStats.filter(q => q.correctPercentage < 40).length;

  const recommendations: string[] = [];

  // Quality score calculation (0-100)
  let qualityScore = 100;

  // Check difficulty distribution
  const totalQuestions = analysis.questionStats.length;
  const balancedDistribution = Math.abs(easyQuestions - mediumQuestions) < totalQuestions * 0.3 &&
                                Math.abs(mediumQuestions - hardQuestions) < totalQuestions * 0.3;

  if (!balancedDistribution) {
    qualityScore -= 20;
    recommendations.push('Consider balancing question difficulty distribution');
  }

  // Check discrimination index
  if (averageDiscrimination < 0.3) {
    qualityScore -= 30;
    recommendations.push('Some questions do not effectively differentiate between high and low performers');
  }

  // Check for too many problematic questions
  if (problematicQuestions > totalQuestions * 0.3) {
    qualityScore -= 25;
    recommendations.push(`${problematicQuestions} questions are too difficult (< 40% correct rate)`);
  }

  // Check for questions with negative discrimination
  const negativeDiscrimination = analysis.questionStats.filter(q => q.discriminationIndex < 0).length;
  if (negativeDiscrimination > 0) {
    qualityScore -= 25;
    recommendations.push(`${negativeDiscrimination} questions have negative discrimination (review for errors)`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Assessment demonstrates good quality metrics');
  }

  return {
    assessmentId,
    totalQuestions,
    easyQuestions,
    mediumQuestions,
    hardQuestions,
    averageDiscrimination: Math.round(averageDiscrimination * 100) / 100,
    problematicQuestions,
    qualityScore: Math.max(0, qualityScore),
    recommendations,
  };
}
