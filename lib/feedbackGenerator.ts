// Feedback Generator - Template-based personalized feedback for students
import feedbackData from '@/data/feedbackTemplates.json';
import type { AssessmentResult, Question, GeneratedFeedback } from '@/types';

/**
 * Find the matching template based on score percentage
 * @param percentage - Student's score percentage (0-100)
 * @returns Matching tier and randomly selected template
 */
function findTemplateForScore(percentage: number) {
  const tiers = feedbackData.studentFeedbackTemplates.performanceTiers;

  for (const tier of tiers) {
    const [min, max] = tier.scoreRange;
    if (percentage >= min && percentage <= max) {
      // Pick random template from tier for variety
      const templates = tier.templates;
      const randomIndex = Math.floor(Math.random() * templates.length);
      return { tier, template: templates[randomIndex] };
    }
  }

  // Fallback to lowest tier if no match
  const lowestTier = tiers[tiers.length - 1];
  return {
    tier: lowestTier,
    template: lowestTier.templates[0],
  };
}

/**
 * Analyze question types to find strengths and weaknesses
 * @param answers - Student's answers
 * @param questions - Assessment questions
 * @returns Arrays of strength and improvement areas
 */
function analyzeQuestionTypes(
  answers: AssessmentResult['answers'],
  questions: Question[]
) {
  // Initialize statistics for each question type
  const stats = {
    'multiple-choice': { correct: 0, total: 0 },
    'true-false': { correct: 0, total: 0 },
    'short-answer': { correct: 0, total: 0 },
  };

  // Calculate stats
  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question) {
      const type = question.type;
      stats[type].total++;
      if (answer.isCorrect) {
        stats[type].correct++;
      }
    }
  });

  const strengths: string[] = [];
  const improvements: string[] = [];
  const analysis = feedbackData.studentFeedbackTemplates.questionTypeAnalysis;

  // Analyze each type
  Object.entries(stats).forEach(([type, data]) => {
    if (data.total === 0) return; // Skip if no questions of this type

    const percentage = (data.correct / data.total) * 100;
    const typeKey =
      type === 'multiple-choice'
        ? 'multipleChoice'
        : type === 'true-false'
        ? 'trueFalse'
        : 'shortAnswer';

    // 80%+ is a strength
    if (percentage >= 80) {
      strengths.push(analysis[typeKey].strength);
    }
    // <60% needs improvement
    else if (percentage < 60) {
      improvements.push(analysis[typeKey].weakness);
    }
  });

  return { strengths, improvements };
}

/**
 * Get subject-specific study tip
 * @param subject - Subject name (Mathematics, English, Urdu)
 * @param percentage - Student's score percentage
 * @returns Subject-specific tip string
 */
function getSubjectTip(subject: string, percentage: number): string {
  const tips = feedbackData.studentFeedbackTemplates.subjectSpecificTips;
  const subjectKey = subject as keyof typeof tips;
  const subjectTips = tips[subjectKey];

  if (!subjectTips) {
    return 'Keep practicing and reviewing the material regularly.';
  }

  // Use lowScore tip if percentage < 60, otherwise use general tip
  return percentage < 60 ? subjectTips.lowScore : subjectTips.general;
}

/**
 * Replace template variables with actual values
 * @param template - Template string with {variables}
 * @param variables - Object with variable values
 * @returns String with variables replaced
 */
function replaceVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
}

/**
 * Main function to generate personalized feedback
 * @param result - Assessment result with score and answers
 * @param questions - Array of questions from the assessment
 * @returns Generated feedback object
 */
export function generateFeedback(
  result: AssessmentResult,
  questions: Question[]
): GeneratedFeedback {
  // Find matching template based on score
  const { tier, template } = findTemplateForScore(result.percentage);

  // Analyze question types for strengths/weaknesses
  const { strengths, improvements } = analyzeQuestionTypes(
    result.answers,
    questions
  );

  // Prepare variables for template replacement
  const variables = {
    studentName: result.studentName,
    percentage: result.percentage.toString(),
    subject: result.subject,
    score: result.score.toString(),
    totalPoints: result.totalPoints.toString(),
  };

  // Replace variables in template strings
  const mainMessage = replaceVariables(template.message, variables);
  const encouragement = replaceVariables(template.encouragement, variables);
  const nextSteps = template.nextSteps.map((step) =>
    replaceVariables(step, variables)
  );

  // Get subject-specific tip
  const subjectTip = getSubjectTip(result.subject, result.percentage);

  return {
    mainMessage,
    encouragement,
    nextSteps,
    strengthAreas: strengths,
    improvementAreas: improvements,
    subjectTip,
    performanceTier: tier.name,
  };
}

/**
 * Generate aggregate feedback across multiple assessments
 * @param results - Array of assessment results
 * @param allQuestions - Map of assessment ID to questions array
 * @returns Aggregate feedback or null if no results
 */
export function generateAggregateFeedback(
  results: AssessmentResult[],
  allQuestions: Record<string, Question[]>
): GeneratedFeedback | null {
  if (results.length === 0) return null;

  // Calculate average performance across all assessments
  const avgPercentage = Math.round(
    results.reduce((sum, r) => sum + r.percentage, 0) / results.length
  );

  // Use most recent result for context
  const recentResult = results[0];

  // Aggregate strengths/weaknesses across all assessments
  let allStrengths: string[] = [];
  let allImprovements: string[] = [];

  results.forEach((result) => {
    const questions = allQuestions[result.assessmentId] || [];
    const analysis = analyzeQuestionTypes(result.answers, questions);
    allStrengths.push(...analysis.strengths);
    allImprovements.push(...analysis.improvements);
  });

  // Deduplicate
  allStrengths = [...new Set(allStrengths)];
  allImprovements = [...new Set(allImprovements)];

  // Generate feedback using average score
  const syntheticResult = {
    ...recentResult,
    percentage: avgPercentage,
  };

  const questions = allQuestions[recentResult.assessmentId] || [];
  const feedback = generateFeedback(syntheticResult, questions);

  // Override with aggregated strengths/weaknesses
  return {
    ...feedback,
    strengthAreas: allStrengths,
    improvementAreas: allImprovements,
  };
}
